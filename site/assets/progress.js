// Per-page level toggle (levels 1-5; 0 Unseen is not user-settable).
// The concept's effective level is the owner's choice from progress/levels.json
// (a gitignored folder inside the repo, written via the File System Access API
// with the same folder handle notes.js uses), falling back to the map's content
// flag. A localStorage mirror lets the map page show levels without a prompt.
// The toggle is enabled only when the page has content — a playback always does.
//
// Needs on a page: data-page-id + data-concept on <body>, and CONCEPT_MAP.

(function () {
  const MIRROR_KEY = "um-levels";
  const mirror = () => {
    try { return JSON.parse(localStorage.getItem(MIRROR_KEY) || "{}"); }
    catch (e) { return {}; }
  };
  const override = mirror();

  // Effective level: the owner's stored choice if the concept has content,
  // else the map's 0/1 content flag.
  const effective = (n) =>
    n && (n.playback || n.page) && n.id in override ? override[n.id] : (n ? n.level : 0);

  // Fold overrides into the map data (must run before the page renders it).
  if (window.CONCEPT_MAP)
    for (const n of window.CONCEPT_MAP.nodes) n.level = effective(n);

  const api = {
    level: (n) => effective(typeof n === "string" && window.CONCEPT_MAP
      ? window.CONCEPT_MAP.nodes.find((x) => x.id === n) : n),
  };

  // ----- repo folder handle (shared with notes.js's store) -----
  const hasFS = "showDirectoryPicker" in window && "indexedDB" in window;
  function db() {
    return new Promise((res, rej) => {
      const r = indexedDB.open("um-notes", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("kv");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  const storeGet = (k) =>
    db().then((d) => new Promise((res, rej) => {
      const t = d.transaction("kv").objectStore("kv").get(k);
      t.onsuccess = () => res(t.result);
      t.onerror = () => rej(t.error);
    }));
  const storeSet = (k, v) =>
    db().then((d) => new Promise((res, rej) => {
      const t = d.transaction("kv", "readwrite").objectStore("kv").put(v, k);
      t.onsuccess = () => res();
      t.onerror = () => rej(t.error);
    }));

  // Stored handle may be the repo root or notes/; progress/ needs the root.
  async function progressDir() {
    let h = await storeGet("dir").catch(() => null);
    if (h && h.name === "notes") h = null; // can't reach a sibling of notes/
    if (!h || (await h.queryPermission({ mode: "readwrite" })) !== "granted") {
      h = await window.showDirectoryPicker({ id: "um-notes", mode: "readwrite" });
      await storeSet("dir", h);
    }
    return h.getDirectoryHandle("progress", { create: true });
  }

  async function writeFile() {
    const fh = await (await progressDir()).getFileHandle("levels.json", { create: true });
    const w = await fh.createWritable();
    await w.write(JSON.stringify(mirror(), null, 2) + "\n");
    await w.close();
  }

  // ----- widget: level chip in the header + pick menu -----
  const pageId = document.body.dataset.pageId;
  const conceptId = document.body.dataset.concept;
  const header = document.querySelector("header");
  const node = window.CONCEPT_MAP && conceptId &&
    window.CONCEPT_MAP.nodes.find((n) => n.id === conceptId);

  if (header && node && pageId) {
    const levels = window.CONCEPT_MAP.levels;
    const hasContent = !!(node.playback || node.page);
    const chip = document.createElement("button");
    chip.className = "level-toggle";
    const paint = () => {
      const lv = api.level(node.id);
      chip.innerHTML = `<span class="level lv${lv}">${lv}</span> ${levels[lv].name}`;
    };
    chip.title = hasContent
      ? "Your level for this concept (1-5); saved to progress/levels.json"
      : "Level is settable once this concept has a page";
    if (hasContent) {
      const menu = document.createElement("div");
      menu.className = "level-menu";
      menu.hidden = true;
      menu.innerHTML = levels.slice(1).map((l, i) =>
        `<button data-lv="${i + 1}"><span class="level lv${i + 1}">${i + 1}</span> ` +
        `${l.name}<span class="muted"> — ${l.desc}</span></button>`).join("");
      const close = () => { menu.hidden = true; };
      chip.addEventListener("click", () => { menu.hidden = !menu.hidden; });
      document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && e.target !== chip) close();
      });
      menu.addEventListener("click", async (e) => {
        const b = e.target.closest("button[data-lv]");
        if (!b) return;
        close();
        const lv = +b.dataset.lv;
        const m = mirror(); m[node.id] = lv;
        try { localStorage.setItem(MIRROR_KEY, JSON.stringify(m)); } catch (e2) {}
        node.level = lv;
        paint();
        if (hasFS) {
          try { await writeFile(); }
          catch (err) { chip.title = `kept in this browser — file write failed: ${err.message}`; }
        }
      });
      const wrap = document.createElement("span");
      wrap.className = "level-wrap";
      wrap.appendChild(chip);
      wrap.appendChild(menu);
      header.appendChild(wrap);
    } else {
      chip.disabled = true;
      header.appendChild(chip);
    }
    paint();
  }

  window.Progress = api;
})();
