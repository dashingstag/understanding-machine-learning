// Reusable notation: formula cards with breakdowns, and pop-up explanations for symbols.
// Data comes from notation.json via site/notation-data.js (window.NOTATION).
//
//   <div data-formula="example-formula"></div>       display formula + "Break it down"
//   <span data-notation="example-symbol"></span>     the symbol, click for its explanation
//   <span data-notation="example-symbol">$\alpha$</span>  custom text, same explanation
//
// Load order on a page: map.js, notation-data.js, notation.js, playback.js.

(function () {
  const data = window.NOTATION;
  if (!data) return;
  const root = document.body.dataset.root || "";
  const symbols = Object.fromEntries(data.symbols.map((s) => [s.id, s]));
  const formulas = Object.fromEntries(data.formulas.map((f) => [f.id, f]));
  const glossary = (id) => `${root}site/notation.html#${id}`;

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

  const ref = (id, text) =>
    `<span class="notation-ref" data-notation="${id}" tabindex="0">${text || `$${symbols[id].tex}$`}</span>`;

  function symbolCard(id, { full = false } = {}) {
    const s = symbols[id];
    let html =
      `<div class="sym-head"><span class="sym-tex">$${s.tex}$</span><strong>${s.name}</strong></div>` +
      `<p class="say">Say: “${s.say}”</p>` +
      `<p>${s.meaning}</p><p>${s.explanation}</p>`;
    if (s.example) html += `<p class="example"><span class="muted">Example:</span> ${s.example}</p>`;
    if (s.see && s.see.length) html += `<p class="see"><span class="muted">See also:</span> ${s.see.map((r) => ref(r)).join(" ")}</p>`;
    if (!full) html += `<p class="more"><a href="${glossary(id)}">In the glossary →</a></p>`;
    return html;
  }

  function breakdown(f) {
    let html = `<p class="say">Say: “${f.say}”</p><p>${f.meaning}</p><table class="parts">`;
    for (const p of f.parts) {
      const sym = p.symbol ? ` ${ref(p.symbol, "ⓘ")}` : "";
      html += `<tr><td class="part-tex">$${p.tex}$</td><td>${p.explain}${sym}</td></tr>`;
    }
    html += "</table>";
    if (f.conditions) html += `<p><span class="muted">Holds when:</span> ${f.conditions}</p>`;
    if (f.source) html += `<p class="muted">Source: ${f.source}</p>`;
    return html;
  }

  function formulaCard(id, { open = false, link = true } = {}) {
    const f = formulas[id];
    return (
      `<div class="formula-tex">$$${f.tex}$$</div>` +
      `<details class="breakdown"${open ? " open" : ""}><summary>Break it down: ${f.name}</summary>` +
      breakdown(f) +
      (link ? `<p class="more"><a href="${glossary(id)}">In the glossary →</a></p>` : "") +
      `</details>`
    );
  }

  function fill(scope) {
    scope.querySelectorAll("[data-formula]").forEach((el) => {
      if (el.dataset.filled) return;
      if (!formulas[el.dataset.formula]) return console.warn("unknown formula", el.dataset.formula);
      el.classList.add("formula-card");
      el.innerHTML = formulaCard(el.dataset.formula);
      el.dataset.filled = "1";
    });
    scope.querySelectorAll("[data-notation]").forEach((el) => {
      if (el.dataset.filled) return;
      if (!symbols[el.dataset.notation]) return console.warn("unknown notation", el.dataset.notation);
      el.classList.add("notation-ref");
      el.tabIndex = 0;
      if (!el.innerHTML.trim()) el.innerHTML = `$${symbols[el.dataset.notation].tex}$`;
      el.dataset.filled = "1";
    });
  }

  // ----- pop-up -----
  const pop = document.createElement("div");
  pop.className = "notation-pop";
  pop.hidden = true;
  document.body.appendChild(pop);
  let anchor = null;

  function openPop(el) {
    anchor = el;
    pop.innerHTML = symbolCard(el.dataset.notation);
    fill(pop);
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
    const el = e.target.closest(".notation-ref");
    if (el) { e.preventDefault(); el === anchor && !pop.hidden ? closePop() : openPop(el); }
    else if (!pop.contains(e.target)) closePop();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePop();
    if (e.key === "Enter" && e.target.classList && e.target.classList.contains("notation-ref")) openPop(e.target);
  });

  // ----- "Notation on this page" in the drill-down panel -----
  function pageIndex() {
    const drill = document.querySelector(".drill");
    if (!drill) return;
    const syms = new Set(), forms = new Set();
    document.querySelectorAll("main [data-notation]").forEach((el) => syms.add(el.dataset.notation));
    document.querySelectorAll("main [data-formula]").forEach((el) => {
      forms.add(el.dataset.formula);
      formulas[el.dataset.formula].parts.forEach((p) => p.symbol && syms.add(p.symbol));
    });
    if (!syms.size && !forms.size) return;
    const items = [
      ...[...forms].map((id) => `<li><a href="${glossary(id)}">${formulas[id].name}</a></li>`),
      ...[...syms].filter((id) => symbols[id]).map((id) => `<li>${ref(id)} ${symbols[id].name}</li>`),
    ];
    const nav = document.createElement("div");
    nav.innerHTML = `<h3>Notation on this page</h3><ul class="notation-index">${items.join("")}</ul>`;
    drill.prepend(nav);
  }

  fill(document);
  window.addEventListener("load", pageIndex);
  window.Notation = { symbols, formulas, symbolCard, formulaCard, breakdown, fill, renderMath, ref };
})();
