// Editable per-page notes. The header "Notes" link toggles a panel with a
// textarea + Save button; Save writes notes/<page-id>.md via the File System
// Access API. The repo root is picked once and its handle kept in IndexedDB;
// notes/ inside it is used (created if missing), so later saves write straight
// through. Where the API is missing, Save falls back to downloading the file.
//
// Needs on a page: <a href="index.md">Notes</a> in the header nav and
// data-page-id on <body>. Loads after playback.js.

(function () {
  const link = document.querySelector('header nav a[href$="index.md"]');
  const pageId = document.body.dataset.pageId;
  if (!link || !pageId) return;
  const fileName = `${pageId}.md`;
  const hasFS = "showDirectoryPicker" in window && "indexedDB" in window;

  // ----- the notes folder handle, kept in IndexedDB -----
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

  const granted = async (h) =>
    (await h.queryPermission({ mode: "readwrite" })) === "granted";

  // ----- panel -----
  const panel = document.createElement("div");
  panel.className = "notes-panel";
  panel.hidden = true;
  panel.innerHTML =
    `<div class="notes-head"><strong>notes/${fileName}</strong>` +
    `<button class="notes-close" title="Close">×</button></div>` +
    `<textarea spellcheck="false" placeholder="Your notes for this page…"></textarea>` +
    `<div class="notes-foot"><button class="notes-save">Save</button>` +
    (hasFS ? `<button class="notes-dir" title="Pick the repo folder (or notes/ inside it)">Folder…</button>` : "") +
    `<span class="muted notes-status"></span></div>`;
  document.body.appendChild(panel);
  const ta = panel.querySelector("textarea");
  const status = panel.querySelector(".notes-status");
  const say = (t) => { status.textContent = t; };

  // The stored handle may be the repo root or notes/ itself; resolve to notes/.
  const notesDir = (h) => h.name === "notes" ? h : h.getDirectoryHandle("notes", { create: true });

  async function ensureDir() {
    let h = await storeGet("dir").catch(() => null);
    if (h && (await granted(h))) return notesDir(h);
    h = await window.showDirectoryPicker({ id: "um-notes", mode: "readwrite" });
    await storeSet("dir", h);
    return notesDir(h);
  }

  async function load(fromGesture) {
    if (!hasFS) { say("saves download as a file — drop it in notes/"); return; }
    const h = await storeGet("dir").catch(() => null);
    if (!h) { say(`Save asks once for the repo folder, then writes notes/ inside it`); return; }
    const ok = (await granted(h)) ||
      (fromGesture && (await h.requestPermission({ mode: "readwrite" })) === "granted");
    if (!ok) { say("folder permission needed — click Save or Folder…"); return; }
    try {
      const f = await (await (await notesDir(h)).getFileHandle(fileName)).getFile();
      ta.value = await f.text();
      say(`loaded notes/${fileName}`);
    } catch (e) {
      say(e.name === "NotFoundError" ? `notes/${fileName} doesn't exist yet — write away` : `read failed: ${e.message}`);
    }
  }

  // keep a tiny index so the map page's search can find note contents
  const indexNote = () => {
    try { localStorage.setItem(`um-notes-index:${pageId}`, ta.value.slice(0, 300)); } catch (e) {}
  };

  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ta.value], { type: "text/markdown" }));
    a.download = fileName;
    a.click();
    indexNote();
    say(`downloaded ${fileName} — drop it in notes/`);
  }

  async function save() {
    if (!hasFS) return download();
    say("saving…");
    try {
      const dir = await ensureDir();
      const fh = await dir.getFileHandle(fileName, { create: true });
      const w = await fh.createWritable();
      await w.write(ta.value);
      await w.close();
      indexNote();
      say(`saved ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      say(e.name === "AbortError" ? "save cancelled" : `save failed: ${e.message}`);
    }
  }

  panel.querySelector(".notes-save").addEventListener("click", save);
  panel.querySelector(".notes-close").addEventListener("click", () => { panel.hidden = true; });
  const dirBtn = panel.querySelector(".notes-dir");
  if (dirBtn) dirBtn.addEventListener("click", async () => {
    try {
      const h = await window.showDirectoryPicker({ id: "um-notes", mode: "readwrite" });
      await storeSet("dir", h);
      say(h.name === "notes" ? `folder: notes/` : `folder: ${h.name}/notes/`);
      load(true);
    } catch (e) { /* picker cancelled */ }
  });

  // ----- draggable by the header strip -----
  const head = panel.querySelector(".notes-head");
  try {
    const pos = JSON.parse(localStorage.getItem("um-notes-pos") || "null");
    if (pos) { panel.style.left = pos.x + "px"; panel.style.top = pos.y + "px";
               panel.style.bottom = "auto"; }
  } catch (e) {}
  head.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    const r = panel.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    panel.style.left = r.left + "px"; panel.style.top = r.top + "px";
    panel.style.bottom = "auto"; panel.style.right = "auto";
    const move = (ev) => {
      panel.style.left = Math.max(0, ev.clientX - dx) + "px";
      panel.style.top = Math.max(0, ev.clientY - dy) + "px";
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      try {
        const p = panel.getBoundingClientRect();
        localStorage.setItem("um-notes-pos", JSON.stringify({ x: p.left, y: p.top }));
      } catch (e2) {}
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    e.preventDefault();
  });

  link.addEventListener("click", (e) => {
    e.preventDefault();
    panel.hidden = !panel.hidden;
    if (!panel.hidden) { load(true); ta.focus(); }
  });

  load(false); // always show the latest notes behind the link
})();
