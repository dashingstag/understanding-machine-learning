// Shared playback runtime.
// A playback page has <body data-concept="<id>" data-root="<path to repo root>">,
// loads site/map.js before this file, and contains <section class="frame" data-title="…">.

(function () {
  const body = document.body;
  const root = body.dataset.root || "";
  const conceptId = body.dataset.concept;
  const map = window.CONCEPT_MAP;
  const frames = [...document.querySelectorAll(".frame")];
  let current = 0;

  function renderMath(el) {
    if (window.renderMathInElement) {
      renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }
  }

  // ----- story panel: a frame's <aside class="aside"> moves to the left rail -----
  const playbackEl = document.querySelector(".playback");
  const storyPanel = document.createElement("aside");
  storyPanel.className = "story-panel";
  if (document.querySelector(".frame .aside")) {
    playbackEl.before(storyPanel);
    body.classList.add("has-stories");
  }

  function updateStories(frame) {
    storyPanel.replaceChildren(...frame.querySelectorAll(".aside"));
  }

  // ----- resizable animation panel (drag its left edge) -----
  const animPanel = document.querySelector(".anim-panel");
  if (animPanel) {
    const setAnimW = (w) => {
      w = Math.round(Math.max(240, Math.min(w, Math.min(720, window.innerWidth - 60))));
      body.style.setProperty("--anim-w", `${w}px`);
      try { localStorage.setItem("animPanelWidth", w); } catch (e) { /* file:// may forbid */ }
    };
    const saved = parseInt(localStorage.getItem("animPanelWidth"), 10);
    if (Number.isFinite(saved)) setAnimW(saved);

    const grip = document.createElement("div");
    grip.className = "anim-grip";
    grip.title = "Drag to resize";
    animPanel.appendChild(grip);
    grip.addEventListener("pointerdown", (e) => {
      if (window.innerWidth <= 1280) return; // panel is a static block there
      e.preventDefault();
      const x0 = e.clientX, w0 = animPanel.offsetWidth, sel = body.style.userSelect;
      body.style.userSelect = "none";
      grip.classList.add("dragging");
      const move = (ev) => setAnimW(w0 + x0 - ev.clientX);
      const up = () => {
        body.style.userSelect = sel;
        grip.classList.remove("dragging");
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }

  // ----- frame navigation -----
  const controls = document.createElement("div");
  controls.className = "controls";
  controls.innerHTML =
    '<button data-go="prev">← Back</button><div class="dots"></div>' +
    '<span class="muted counter"></span><button data-go="next">Next →</button>';
  playbackEl.after(controls);
  const dots = controls.querySelector(".dots");

  // ----- bar wing: Watch on the left (self-check lives on the notation page) -----
  const wnode = map && conceptId ? map.nodes.find((n) => n.id === conceptId) : null;
  const wing = (cls, label, inner) => {
    const d = document.createElement("details");
    d.className = `bar-wing ${cls}`;
    d.innerHTML = `<summary>${label}</summary><div class="bar-pop">${inner}</div>`;
    controls.appendChild(d);
    document.addEventListener("click", (e) => { if (!d.contains(e.target)) d.open = false; });
    return d;
  };
  if (wnode && wnode.video) {
    const v = wnode.video;
    const mmss = `${Math.floor(v.t / 60)}:${String(v.t % 60).padStart(2, "0")}`;
    const media = location.protocol === "file:"
      ? `<a class="bar-thumb" href="https://youtu.be/${v.id}?t=${v.t}" target="_blank" rel="noopener">` +
        `<img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="">` +
        `<span class="bar-play">▶</span></a>`
      : `<div class="bar-video"></div>`;
    const det = wing("bar-watch", `▶ ${v.title}`,
      `<p class="muted">${v.note || ""}</p>${media}` +
      `<a href="https://youtu.be/${v.id}?t=${v.t}" target="_blank" rel="noopener">Open on YouTube at ${mmss} ↗</a>`);
    if (location.protocol !== "file:") det.addEventListener("toggle", () => {
      const box = det.querySelector(".bar-video");
      if (det.open && box && !box.firstChild) {
        const f = document.createElement("iframe");
        f.src = `https://www.youtube-nocookie.com/embed/${v.id}?start=${v.t}`;
        f.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture";
        f.allowFullscreen = true;
        f.title = v.title;
        box.appendChild(f);
      }
    });
  }
  if (wnode && wnode.summary) {
    const cap = document.createElement("div");
    cap.className = "bar-caption";
    cap.innerHTML = `<b>${wnode.title}.</b> ${wnode.summary}`;
    controls.prepend(cap);
  }

  frames.forEach((f, i) => {
    const d = document.createElement("span");
    d.title = f.dataset.title || `Frame ${i + 1}`;
    d.onclick = () => show(i);
    dots.appendChild(d);
  });

  function show(i) {
    current = Math.max(0, Math.min(frames.length - 1, i));
    frames.forEach((f, j) => f.classList.toggle("active", j === current));
    [...dots.children].forEach((d, j) => d.classList.toggle("on", j === current));
    controls.querySelector('[data-go="prev"]').disabled = current === 0;
    controls.querySelector('[data-go="next"]').disabled = current === frames.length - 1;
    controls.querySelector(".counter").textContent =
      `${current + 1} / ${frames.length}` + (frames[current].dataset.title ? ` · ${frames[current].dataset.title}` : "");
    history.replaceState(null, "", `#${current + 1}`);
    updateStories(frames[current]);
    frames[current].dispatchEvent(new CustomEvent("frameshow", { bubbles: true }));
  }

  controls.querySelector('[data-go="prev"]').onclick = () => show(current - 1);
  controls.querySelector('[data-go="next"]').onclick = () => show(current + 1);
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); show(current + 1); }
    if (e.key === "ArrowLeft") show(current - 1);
  });

  // ----- drill up / down from map.js -----
  if (map) {
    const byId = Object.fromEntries(map.nodes.map((n) => [n.id, n]));
    const href = (n) => (n.playback || n.page ? root + (n.playback || n.page) : null);

    // <a data-concept-link="id">: resolved from the map, so pages can move without breaking links
    document.querySelectorAll("a[data-concept-link]").forEach((a) => {
      const n = byId[a.dataset.conceptLink];
      if (n && href(n)) a.href = href(n);
      else { a.removeAttribute("href"); a.title = n ? "No page yet" : `Unknown concept ${a.dataset.conceptLink}`; a.classList.add("muted"); }
    });

    const node = byId[conceptId];
    const kids = map.nodes.filter((n) => n.parents.includes(conceptId));
    const link = (n) => {
      const lv = `<span class="level lv${n.level}" title="${map.levels[n.level].name} — ${map.levels[n.level].desc}">${n.level}</span>`;
      const title = href(n) ? `<a href="${href(n)}">${n.title}</a>` : `${n.title} <span class="muted">(no page yet)</span>`;
      const shared = n.parents.length > 1 ? ` <span class="shared-badge" title="Needed by ${n.parents.length} concepts">shared ×${n.parents.length}</span>` : "";
      return `<li>${lv} ${title}${shared}${n.summary ? ` <span class="muted">— ${n.summary}</span>` : ""}</li>`;
    };
    const drill = document.createElement("nav");
    drill.className = "drill";
    let html = "";
    if (node && node.assess) {
      const cur = window.Progress ? window.Progress.level(node.id) : null;
      html += `<h3>Self-check</h3><ul class="self-check">` +
        Object.keys(node.assess).sort().map((k) =>
          `<li${+k === cur ? ' class="cur"' : ""}><span class="level lv${k}">${k}</span> ` +
          `<b>${map.levels[k].name}</b> — ${node.assess[k]}</li>`).join("") + "</ul>";
    }
    if (node && node.parents.length) {
      const note = node.parents.length > 1 ? ` <span class="muted">(shared by ${node.parents.length} concepts)</span>` : "";
      html += `<h3>Needed by${note}</h3><ul>` + node.parents.map((p) => link(byId[p])).join("") + "</ul>";
    }
    if (kids.length) html += "<h3>Drill down</h3><ul>" + kids.map(link).join("") + "</ul>";
    html += `<p><a href="${root}site/index.html">Whole map</a>${node && node.page_html ? ` · <a href="${root}${node.page_html}">article</a>` : ""}</p>`;
    drill.innerHTML = html;
    if (conceptId) controls.after(drill);

    // ----- "See also" dropdown in the header: jump to parent concepts -----
    const navEl = document.querySelector("header nav");
    if (navEl && node && node.parents.length) {
      const det = document.createElement("details");
      det.className = "see-also";
      det.innerHTML = "<summary>See also</summary><div class=\"see-menu\">" +
        node.parents
          .map((p) => (byId[p] && href(byId[p])
            ? `<a href="${href(byId[p])}">${byId[p].title}</a>` +
              (node.why && node.why[p] ? `<span class="see-why">${node.why[p]}</span>` : "")
            : ""))
          .join("") +
        "</div>";
      navEl.appendChild(det);
      document.addEventListener("click", (e) => { if (!det.contains(e.target)) det.open = false; });
    }
  }

  const startAt = parseInt(location.hash.slice(1), 10);
  window.addEventListener("load", () => {
    renderMath(document.body);
    show(Number.isFinite(startAt) ? startAt - 1 : 0);
  });
})();
