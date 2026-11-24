// Fuzzy search box for the map page: type, get a dropdown of suggestions.
// Corpus (built from the already-loaded data files):
//   concept   — map.json nodes; page-less ones jump to their spot in the tree
//   symbol / formula — notation.json (link to the glossary)
//   person / theorem — lore.json (link to Wikipedia, or the page that names it)
//   note      — the owner's saved notes, indexed in localStorage by notes.js
//
// Each suggestion shows its type, the name, and a snippet.
// Load order: map.js, notation-data.js, lore-data.js, then this file.
// Works from any page: links are prefixed from the page's location (site/ pages
// use ../, concept pages use their data-root).

(function () {
  const nav = document.querySelector("header nav");
  if (!nav || !window.CONCEPT_MAP) return;

  const inSite = /\/site\//.test(location.pathname);
  const onMap = inSite && /index\.html$/.test(location.pathname);
  const repo = inSite ? "../" : (document.body.dataset.root || "../../");
  const site = inSite ? "" : repo + "site/";
  const nodeJump = (id) => onMap ? `#node-${id}` : `${site}index.html#node-${id}`;

  // ----- corpus -----
  const entries = [];
  const push = (type, name, snippet, href) => entries.push({ type, name, snippet, href });

  for (const n of window.CONCEPT_MAP.nodes) {
    push("concept", n.title, n.summary || n.id,
      n.playback || n.page ? `${repo}${n.playback || n.page}` : nodeJump(n.id), n.id);
  }
  for (const s of (window.NOTATION || { symbols: [] }).symbols) {
    push("symbol", s.name, s.meaning, `${site}notation.html#${s.id}`);
  }
  for (const f of (window.NOTATION || { formulas: [] }).formulas) {
    push("formula", f.name, f.meaning, `${site}notation.html#${f.id}`);
  }
  for (const p of (window.LORE || { people: [] }).people) {
    const href = p.wiki
      ? `https://en.wikipedia.org/wiki/${encodeURIComponent(p.wiki).replace(/%20/g, "_")}`
      : p.used && p.used.length ? `${repo}${p.used[0]}` : null;
    push("person", p.name, `${p.dates} — ${p.famous_for}`, href);
  }
  for (const t of (window.LORE || { theorems: [] }).theorems) {
    push("theorem", t.name, `${t.status ? t.status + " — " : ""}${t.text}`,
      t.used && t.used.length ? `${repo}${t.used[0]}` : null);
  }
  // notes written through the widget leave a snippet in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("um-notes-index:")) {
      const pid = k.slice(15);
      push("note", `notes/${pid}.md`, localStorage.getItem(k) || "(saved note)", `${repo}notes/${pid}.md`);
    }
  }

  // ----- fuzzy scoring: subsequence match, word-start + streak bonuses -----
  function score(q, text) {
    text = (text || "").toLowerCase();
    let ti = 0, s = 0, streak = 0;
    for (const c of q) {
      const i = text.indexOf(c, ti);
      if (i < 0) return -1;
      streak = i === ti ? streak + 1 : 0;
      s += 1 + streak * 2 + (i === 0 || /[\s(–—-]/.test(text[i - 1]) ? 3 : 0);
      ti = i + 1;
    }
    return s;
  }

  function search(q) {
    return entries
      .map((e) => {
        const s = score(q, e.name) * 2;
        const s2 = score(q, e.snippet) + score(q, e.id || "") * 0.5;
        return { e, s: Math.max(s, s2) };
      })
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((r) => r.e);
  }

  // ----- ui -----
  const box = document.createElement("span");
  box.className = "searchbox";
  box.innerHTML = '<input id="search" type="search" placeholder="Search…" autocomplete="off" spellcheck="false"><div class="search-results" hidden></div>';
  nav.prepend(box);
  const input = box.querySelector("input");
  const drop = box.querySelector(".search-results");
  let hits = [], hi = -1;

  const esc = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

  function render() {
    if (!hits.length) { drop.hidden = true; return; }
    drop.innerHTML = hits.map((e, i) => {
      const inner =
        `<span class="sr-type sr-${e.type}">${e.type}</span>` +
        `<span class="sr-main"><strong>${esc(e.name)}</strong>` +
        `<span class="sr-snip">${esc(e.snippet.slice(0, 110))}</span></span>`;
      const ext = /^https?:\/\//.test(e.href) ? ' target="_blank" rel="noopener"' : "";
      return e.href
        ? `<a class="sr${i === hi ? " hi" : ""}" href="${e.href}"${ext}${e.href.startsWith("#node-") ? ` data-jump="${e.href.slice(6)}"` : ""}>${inner}</a>`
        : `<div class="sr dead${i === hi ? " hi" : ""}" title="No page yet">${inner}</div>`;
    }).join("");
    drop.hidden = false;
  }

  function run() {
    const q = input.value.trim().toLowerCase();
    hi = -1;
    hits = q ? search(q) : [];
    render();
  }

  input.addEventListener("input", run);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); hi = Math.min(hi + 1, hits.length - 1); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); hi = Math.max(hi - 1, -1); render(); }
    else if (e.key === "Enter") {
      const e2 = hits[hi < 0 ? 0 : hi];
      if (e2 && e2.href) {
        if (e2.href.startsWith("#node-")) { document.querySelector(`[data-jump="${e2.href.slice(6)}"]`)?.click(); }
        else if (/^https?:\/\//.test(e2.href)) window.open(e2.href, "_blank", "noopener");
        else location.href = e2.href;
        drop.hidden = true;
      }
    } else if (e.key === "Escape") { input.value = ""; run(); input.blur(); }
  });
  drop.addEventListener("mousemove", (e) => {
    const row = e.target.closest(".sr");
    if (!row) return;
    hi = [...drop.children].indexOf(row);
    [...drop.children].forEach((r, i) => r.classList.toggle("hi", i === hi));
  });
  drop.addEventListener("click", () => { drop.hidden = true; input.value = ""; run(); });
  document.addEventListener("click", (e) => { if (!box.contains(e.target)) drop.hidden = true; });
})();
