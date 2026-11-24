// Story callouts: pop-up bios for people and cards for related theorems.
// Data comes from lore.json via site/lore-data.js (window.LORE).
//
//   <span data-person="example-person">A person</span>   click for who they were
//   <span data-theorem="basel">the Basel problem</span>  click for the statement
//
// Load order on a page: lore-data.js then lore.js (after KaTeX, like notation.js).

(function () {
  const data = window.LORE;
  if (!data) return;
  const people = Object.fromEntries(data.people.map((p) => [p.id, p]));
  const theorems = Object.fromEntries(data.theorems.map((t) => [t.id, t]));

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

  const wikiUrl = (title) => `https://en.wikipedia.org/wiki/${encodeURIComponent(title).replace(/%20/g, "_")}`;

  function personCard(id) {
    const p = people[id];
    const wiki = p.wiki
      ? `<p class="more"><a class="wiki-link" data-wiki="${p.wiki}" href="${wikiUrl(p.wiki)}" target="_blank" rel="noopener">Wikipedia ↗</a></p>`
      : "";
    return (
      `<div class="sym-head"><strong>${p.name}</strong><span class="muted">${p.dates}</span></div>` +
      `<p class="famous"><span class="muted">Famous for:</span> ${p.famous_for}</p>` +
      `<p>${p.text}</p>` +
      wiki
    );
  }

  function theoremCard(id) {
    const t = theorems[id];
    let html = `<div class="sym-head"><strong>${t.name}</strong></div>`;
    if (t.tex) html += `<div class="formula-tex">$$${t.tex}$$</div>`;
    if (t.status) html += `<p class="status"><span class="muted">Status:</span> ${t.status}</p>`;
    return html + `<p>${t.text}</p>`;
  }

  // mark every data-person / data-theorem span as a clickable ref
  document.querySelectorAll("[data-person], [data-theorem]").forEach((el) => {
    el.classList.add("lore-ref");
    el.tabIndex = 0;
  });

  const pop = document.createElement("div");
  pop.className = "notation-pop lore-pop";
  pop.hidden = true;
  document.body.appendChild(pop);
  let anchor = null;

  function openPop(el) {
    const pid = el.dataset.person, tid = el.dataset.theorem;
    if (pid && !people[pid]) return console.warn("unknown person", pid);
    if (tid && !theorems[tid]) return console.warn("unknown theorem", tid);
    anchor = el;
    pop.innerHTML = pid ? personCard(pid) : theoremCard(tid);
    renderMath(pop);
    pop.hidden = false;
    const r = el.getBoundingClientRect();
    const w = Math.min(380, window.innerWidth - 16);
    pop.style.width = `${w}px`;
    pop.style.left = `${Math.max(8, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - w - 8))}px`;
    pop.style.top = `${r.bottom + window.scrollY + 6}px`;
  }
  const closePop = () => { pop.hidden = true; anchor = null; };

  document.addEventListener("click", (e) => {
    const el = e.target.closest(".lore-ref");
    if (el) { e.preventDefault(); el === anchor && !pop.hidden ? closePop() : openPop(el); }
    else if (!pop.contains(e.target)) closePop();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePop();
    if (e.key === "Enter" && e.target.classList && e.target.classList.contains("lore-ref")) openPop(e.target);
  });

  // ----- Wikipedia hover preview (thumbnail + first paragraph, live from the REST API) -----
  const wprev = document.createElement("div");
  wprev.className = "wiki-preview";
  wprev.hidden = true;
  document.body.appendChild(wprev);
  const wikiCache = new Map();
  let hideTimer = null;

  const wikiSummary = (title) => {
    if (!wikiCache.has(title)) {
      wikiCache.set(
        title,
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
          .then((r) => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
          .catch((e) => ({ error: String(e) }))
      );
    }
    return wikiCache.get(title);
  };

  function placePreview(link) {
    const r = link.getBoundingClientRect();
    const w = Math.min(320, window.innerWidth - 16);
    wprev.style.width = `${w}px`;
    wprev.style.left = `${Math.max(8, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - w - 8))}px`;
    wprev.style.top = `${r.bottom + window.scrollY + 6}px`;
  }

  let wikiTitle = null;

  async function showWiki(link) {
    const title = link.dataset.wiki;
    wikiTitle = title;
    wprev.innerHTML = '<p class="muted">Loading Wikipedia…</p>';
    wprev.hidden = false;
    placePreview(link);
    const s = await wikiSummary(title);
    if (wikiTitle !== title) return; // a newer hover took over
    wprev.innerHTML = s.error
      ? `<p class="muted">Couldn't load the preview — <a href="${wikiUrl(title)}" target="_blank" rel="noopener">open Wikipedia ↗</a></p>`
      : (s.thumbnail ? `<img src="${s.thumbnail.source}" alt="">` : "") +
        `<p><strong>${s.title}</strong> — ${s.extract || "(no summary)"}</p>` +
        `<p class="more"><a href="${s.content_urls.desktop.page}" target="_blank" rel="noopener">Read on Wikipedia ↗</a></p>`;
    placePreview(link);
  }

  const cancelHide = () => clearTimeout(hideTimer);
  const scheduleHide = () => { hideTimer = setTimeout(() => { wprev.hidden = true; }, 220); };

  document.addEventListener("mouseover", (e) => {
    const link = e.target.closest(".wiki-link");
    if (!link) return;
    cancelHide();
    showWiki(link);
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(".wiki-link") || e.target.closest(".wiki-preview")) scheduleHide();
  });
  wprev.addEventListener("mouseenter", cancelHide);
  wprev.addEventListener("mouseleave", scheduleHide);
})();
