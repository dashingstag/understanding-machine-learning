// Shows the page's id (body[data-page-id]) as a chip in the header,
// so a page can be referred to unambiguously, e.g. "the page 'root-concept'".
// Click (or press Enter/Space) to copy the id.
(function () {
  const id = document.body.dataset.pageId;
  if (!id) return;

  const chip = document.createElement("span");
  chip.className = "page-id";
  chip.title = `Page id — click to copy "${id}" (with the slide number on a frame)`;
  chip.tabIndex = 0;
  chip.setAttribute("role", "button");

  // include the slide number when the URL hash is a frame (#3 -> "id#3")
  const ref = () => id + (/^#\d+$/.test(location.hash) ? location.hash : "");
  const paint = () => { chip.textContent = `page: ${ref()}`; };
  paint();
  document.addEventListener("frameshow", paint);
  window.addEventListener("hashchange", paint);

  function flash() {
    chip.textContent = `${ref()} copied`;
    chip.classList.add("copied");
    setTimeout(() => {
      paint();
      chip.classList.remove("copied");
    }, 1200);
  }

  function fallbackCopy() {
    const ta = document.createElement("textarea");
    ta.value = ref();
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try {
      if (document.execCommand("copy")) flash();
    } finally {
      ta.remove();
    }
  }

  function copy() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ref()).then(flash, fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  chip.addEventListener("click", copy);
  chip.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      copy();
    }
  });

  const header = document.querySelector("header.top");
  if (header) header.appendChild(chip);
  else document.body.prepend(chip);
})();
