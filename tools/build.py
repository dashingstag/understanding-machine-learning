"""Validate map.json, notation.json and the concept pages; write the site data files.

    python tools/build.py           # check, then write site/map.js and site/notation-data.js
    python tools/build.py --check   # check only; fail if the generated files are stale
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAP = ROOT / "map.json"
NOTATION = ROOT / "notation.json"
LORE = ROOT / "lore.json"
OUTPUTS = {
    "map": ROOT / "site" / "map.js",
    "notation": ROOT / "site" / "notation-data.js",
    "lore": ROOT / "site" / "lore-data.js",
}


def front_matter(path):
    m = re.match(r"---\s*\n(.*?)\n---", path.read_text(encoding="utf-8"), re.S)
    text = m.group(1) if m else ""
    fid = re.search(r"^id:\s*(\S+)", text, re.M)
    notation = re.search(r"^notation:\s*\[(.*?)\]", text, re.M)
    ids = [x.strip() for x in notation.group(1).split(",") if x.strip()] if notation else []
    return (fid.group(1) if fid else None), ids


def html_refs(path):
    html = path.read_text(encoding="utf-8")
    return re.findall(r'data-notation="([^"]+)"', html), re.findall(r'data-formula="([^"]+)"', html)


def discover_pages(nodes):
    """Find each concept's folder and set its "page" / "playback" paths.

    A concept's folder is named after its id. It lives at concepts/<id>/, unless the
    concept has exactly one parent: then it may be nested in that parent's folder.
    Shared concepts (several parents) must stay at the top level so no parent owns them.
    Folders named "assets" hold a page's files and are skipped.
    """
    errors, warnings = [], []
    concepts = ROOT / "concepts"
    folders = {}
    for d in sorted(p for p in concepts.rglob("*") if p.is_dir()):
        if "assets" in d.relative_to(concepts).parts:
            continue
        cid, rel = d.name, d.relative_to(ROOT).as_posix()
        if cid not in nodes:
            errors.append(f"{rel}: folder name {cid!r} is not a concept id in map.json")
            continue
        if cid in folders:
            errors.append(f"{cid}: two folders, {folders[cid]} and {rel}")
            continue
        folders[cid] = rel
        if d.parent != concepts:
            host, parents = d.parent.name, nodes[cid]["parents"]
            if parents != [host]:
                needed_by = ", ".join(parents) or "nothing"
                errors.append(f"{rel}: only a concept with a single parent may be nested; "
                              f"{cid} is needed by {needed_by}. Move it to concepts/{cid}/")

        md, html = d / "index.md", d / "playback.html"
        if md.is_file():
            fid, _ = front_matter(md)
            if fid != cid:
                errors.append(f"{rel}/index.md: front-matter id {fid!r} should be {cid!r}")
            nodes[cid]["page"] = f"{rel}/index.md"
            nodes[cid]["page_html"] = f"{rel}/index.html"
        if html.is_file():
            text, root = html.read_text(encoding="utf-8"), "../" * len(d.relative_to(ROOT).parts)
            if f'data-concept="{cid}"' not in text:
                errors.append(f"{rel}/playback.html: needs data-concept=\"{cid}\" on <body>")
            if f'data-root="{root}"' not in text:
                errors.append(f"{rel}/playback.html: data-root should be {root!r}")
            for src in ("site/map.js", "site/notation-data.js", "site/assets/notation.js",
                        "site/lore-data.js", "site/assets/lore.js", "site/assets/notes.js",
                        "site/assets/progress.js", "site/assets/playback.js",
                        "site/assets/search.js"):
                if f'src="{root}{src}"' not in text:
                    errors.append(f"{rel}/playback.html: missing <script src=\"{root}{src}\">")
            if "katex.min.js" not in text or "auto-render" not in text:
                errors.append(f"{rel}/playback.html: KaTeX + auto-render scripts missing")
            if "MiniChart(" in text and "assets/charts.js" not in text:
                errors.append(f"{rel}/playback.html: uses MiniChart but loads no assets/charts.js")
            if not re.search(r'<a href="index\.html"', text):
                errors.append(f"{rel}/playback.html: header needs the Article link "
                              "(href=\"index.html\" — the rendered index.md)")
            if not re.search(r'<a href="index\.md"', text):
                errors.append(f"{rel}/playback.html: header needs the Notes link "
                              "(href=\"index.md\" — notes.js hijacks it into the widget)")
            nodes[cid]["playback"] = f"{rel}/playback.html"
            # Every playback ships the full kit (keep one reference page updated).
            if '<section class="frame"' not in text:
                warnings.append(f"{rel}/playback.html: no frames at all")
            if 'class="anim-panel"' not in text:
                warnings.append(f"{rel}/playback.html: no anim-panel; add a persistent animation")
            elif 'id="scrub"' not in text:
                warnings.append(f"{rel}/playback.html: anim-panel has no scrub slider "
                                "(id=\"scrub\") for manual playback")
            for j, chunk in enumerate(text.split('<section class="frame"')[1:], 1):
                m = re.search(r'data-title="([^"]+)"', chunk)
                if 'class="aside' not in chunk.split("</section>")[0]:
                    warnings.append(f"{rel}/playback.html: frame {j} "
                                    f"({m.group(1) if m else 'untitled'}) has no story aside")
    return errors, warnings


def validate_page_ids():
    """Every HTML file must carry a unique data-page-id on <body> (shown in the
    header by assets/page-id.js) plus the page-id.js script that displays it.
    A playback.html's page-id is its folder name (the concept id).
    Templates under site/templates/ are exempt."""
    errors = []
    ids = {}
    for html in sorted(ROOT.rglob("*.html")):
        rel = html.relative_to(ROOT)
        if "templates" in rel.parts or ".git" in rel.parts:
            continue
        text, path = html.read_text(encoding="utf-8"), rel.as_posix()
        m = re.search(r'data-page-id="([^"]+)"', text)
        if not m:
            errors.append(f"{path}: missing data-page-id on <body>")
            continue
        pid = m.group(1)
        if pid in ids and Path(ids[pid]).parent != rel.parent:
            errors.append(f"{path}: page-id {pid!r} already used by {ids[pid]}")
        ids[pid] = path
        if "assets/page-id.js" not in text:
            errors.append(f"{path}: loads no assets/page-id.js, so its id won't be shown")
        # every page gets the header search box (it needs all three datasets)
        for src in ("map.js", "notation-data.js", "lore-data.js", "assets/search.js"):
            if src not in text:
                errors.append(f"{path}: missing {src} — every page loads the header search")
        if html.name == "playback.html" and "concepts" in rel.parts and pid != html.parent.name:
            errors.append(f"{path}: data-page-id should be the concept id {html.parent.name!r}")
    return errors


def validate_map(data):
    errors, warnings = [], []
    nodes = {}
    for n in data["nodes"]:
        if n["id"] in nodes:
            errors.append(f"duplicate id: {n['id']}")
        nodes[n["id"]] = n

    if data["root"] not in nodes:
        errors.append(f"root {data['root']!r} is not a node")
    for n in nodes.values():
        if n.get("level") not in (0, 1):
            errors.append(f"{n['id']}: level must be 0 or 1 (the content flag); "
                          "levels 2-5 are the owner's, stored in progress/")
        for p in n["parents"]:
            if p not in nodes:
                errors.append(f"{n['id']}: unknown parent {p!r}")
            elif p not in n.get("why", {}):
                errors.append(f"{n['id']}: no why[{p!r}] — explain the concept's relevance to each parent")
        for w in n.get("why", {}):
            if w not in n["parents"]:
                errors.append(f"{n['id']}: why names {w!r}, which is not a parent")
        if not n["parents"] and n["id"] != data["root"]:
            errors.append(f"{n['id']}: has no parents and is not the root")
        for key in ("page", "playback"):
            if key in n:
                errors.append(f"{n['id']}: remove {key!r} from map.json; pages are found by folder name")

    children = {i: [] for i in nodes}
    for n in nodes.values():
        for p in n["parents"]:
            if p in children:
                children[p].append(n["id"])

    state = {}

    def visit(i, stack):
        if state.get(i) == "done":
            return
        if state.get(i) == "open":
            errors.append("cycle: " + " -> ".join(stack + [i]))
            return
        state[i] = "open"
        for c in children[i]:
            visit(c, stack + [i])
        state[i] = "done"

    if data["root"] in nodes:
        visit(data["root"], [])
    for i in nodes:
        if i not in state:
            errors.append(f"{i}: not reachable from the root")

    errs, warns = discover_pages(nodes)
    errors += errs
    warnings += warns

    for n in nodes.values():
        has_content = "page" in n or "playback" in n
        if n["level"] == 1 and not has_content:
            errors.append(f"{n['id']}: level 1 (Content) but no index.md/playback.html exists")
        if n["level"] == 0 and has_content:
            warnings.append(f"{n['id']}: has a page but level 0 — toggle it to 1 (Content)")
        for k in n.get("assess", {}):
            if k not in ("2", "3", "4", "5"):
                errors.append(f"{n['id']}: assess key {k!r} must be one of '2'-'5'")
        if not n.get("summary"):
            errors.append(f"{n['id']}: missing one-line 'summary' "
                          "(shown in the playback pagination bar)")
        if has_content:
            missing = [k for k in ("2", "3", "4", "5") if k not in n.get("assess", {})]
            if missing:
                errors.append(f"{n['id']}: page exists — add self-assessment prompts "
                              f"for levels {', '.join(missing)} in map.json")
        v = n.get("video")
        if v:
            if not re.fullmatch(r"[A-Za-z0-9_-]{11}", str(v.get("id", ""))):
                errors.append(f"{n['id']}: video.id {v.get('id')!r} isn't a YouTube id")
            for key in ("title", "channel", "note"):
                if not v.get(key):
                    errors.append(f"{n['id']}: video missing {key}")
            if not isinstance(v.get("t"), int) or v["t"] < 0:
                errors.append(f"{n['id']}: video.t must be a start timestamp in seconds")
        if has_content and not v:
            errors.append(f"{n['id']}: page exists — add a video (a strong explainer "
                          "channel preferred) with a timestamp to the relevant bit")

    return errors, warnings


def validate_notation(notation, concept_ids):
    """Check notation.json and every reference to it; return errors and where each entry is used."""
    errors = []
    symbols = {}
    formulas = {}
    for kind, table, items in (("symbol", symbols, notation["symbols"]), ("formula", formulas, notation["formulas"])):
        for x in items:
            if x["id"] in symbols or x["id"] in formulas:
                errors.append(f"notation: duplicate id {x['id']!r}")
            table[x["id"]] = x
            for key in ("tex", "name", "meaning"):
                if not x.get(key):
                    errors.append(f"notation {kind} {x['id']}: missing {key}")
            if x.get("concept") and x["concept"] not in concept_ids:
                errors.append(f"notation {kind} {x['id']}: unknown concept {x['concept']!r}")
    for s in symbols.values():
        for ref in s.get("see", []):
            if ref not in symbols:
                errors.append(f"notation symbol {s['id']}: 'see' refers to unknown symbol {ref!r}")
    for f in formulas.values():
        if not f.get("parts"):
            errors.append(f"notation formula {f['id']}: needs at least one part")
        for part in f.get("parts", []):
            if part.get("symbol") and part["symbol"] not in symbols:
                errors.append(f"notation formula {f['id']}: part refers to unknown symbol {part['symbol']!r}")

    used = {i: [] for i in list(symbols) + list(formulas)}

    def use(ref, kinds, where):
        if not any(ref in k for k in kinds):
            errors.append(f"{where}: unknown notation {ref!r}")
        elif where not in used[ref]:
            used[ref].append(where)

    for md in sorted((ROOT / "concepts").rglob("index.md")):
        rel = md.relative_to(ROOT).as_posix()
        for ref in front_matter(md)[1]:
            use(ref, (symbols, formulas), rel)
    for html in sorted((ROOT / "concepts").rglob("*.html")):
        if html.name == "index.html" and (html.parent / "index.md").is_file():
            continue  # generated by render_concept_pages; its ids come from the .md
        rel = html.relative_to(ROOT).as_posix()
        notes, forms = html_refs(html)
        for ref in notes:
            use(ref, (symbols,), rel)
        for ref in forms:
            use(ref, (formulas,), rel)
    return errors, used


def validate_lore(lore):
    """Check lore.json and every data-person / data-theorem reference."""
    errors = []
    people = {}
    theorems = {}
    for kind, table, items, keys in (
        ("person", people, lore["people"], ("name", "dates", "famous_for", "text")),
        ("theorem", theorems, lore["theorems"], ("name", "text")),
    ):
        for x in items:
            if x["id"] in people or x["id"] in theorems:
                errors.append(f"lore: duplicate id {x['id']!r}")
            table[x["id"]] = x
            for key in keys:
                if not x.get(key):
                    errors.append(f"lore {kind} {x['id']}: missing {key}")

    used = {i: [] for i in list(people) + list(theorems)}
    for html in sorted((ROOT / "concepts").rglob("*.html")):
        rel = html.relative_to(ROOT).as_posix()
        text = html.read_text(encoding="utf-8")
        for ref in re.findall(r'data-person="([^"]+)"', text):
            if ref not in people:
                errors.append(f"{rel}: unknown person {ref!r}")
            else:
                used[ref].append(rel)
        for ref in re.findall(r'data-theorem="([^"]+)"', text):
            if ref not in theorems:
                errors.append(f"{rel}: unknown theorem {ref!r}")
            else:
                used[ref].append(rel)
    return errors, used


def validate_links(data, notation):
    """Link-by-default: when a playback page's prose mentions another concept's
    title or a glossary symbol's name, it should be a link — wrap the phrase in
    data-concept-link / data-notation / data-formula. Warnings only."""
    warnings = []
    sym_names = {s["id"]: s["name"].lower() for s in notation["symbols"] if len(s["name"]) >= 9}
    for n in data["nodes"]:
        p = n.get("playback")
        if not p:
            continue
        text = (ROOT / p).read_text(encoding="utf-8")
        plain = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", text, flags=re.S)
        plain = re.sub(r"<[^>]+>", " ", plain).lower()
        def linked(mid, phrases):
            # the id itself is a link target, or the phrase sits inside any
            # data-* element (concept link, notation, formula, lore theorem/person)
            if re.search(r'data-(?:concept-link|notation|formula)="%s"' % re.escape(mid), text):
                return True
            for x in phrases:
                if re.search(r'<(?:a|span)[^>]*data-[a-z-]+="[^"]*"[^>]*>[^<]*\b'
                             + re.escape(x), text, flags=re.I):
                    return True
            return False
        for m in data["nodes"]:
            if m["id"] == n["id"]:
                continue
            t = m["title"].split("(")[0].strip().lower()
            needles = {t, t[4:]} if t.startswith("the ") else {t}
            if any(re.search(r"\b" + re.escape(x) + r"\b", plain) for x in needles if len(x) >= 6) \
                    and not linked(m["id"], needles):
                warnings.append(f"{p}: mentions {m['title']!r} — wrap it in "
                                f"data-concept-link=\"{m['id']}\"")
        for sid, sname in sym_names.items():
            if re.search(r"\b" + re.escape(sname) + r"\b", plain) and not linked(sid, [sname]):
                warnings.append(f"{p}: mentions {sname!r} — wrap it in "
                                f"data-notation=\"{sid}\"")
    return warnings


def render_concept_pages(data, notation):
    """Emit concepts/<id>/index.html — the index.md rendered as a styled page.

    Converts the small markdown subset used in the repo (##/### headings, - and
    1. lists, > quotes, **b** *em* _em_, `code`, [text](url), $…$/$$…$$ math).
    `code` matching a concept id links to its playback; matching a symbol or
    formula id links to the glossary. External links open in a new tab.
    """
    nodes = {n["id"]: n for n in data["nodes"]}
    sym_ids = {s["id"] for s in notation["symbols"]}
    formula_ids = {f["id"] for f in notation["formulas"]}

    def inline(s, root):
        math = []
        def stash(m):
            math.append(m.group(0))
            return f"\x00{len(math) - 1}\x00"
        s = re.sub(r"\$\$[^$]*\$\$|\$[^$\n]+\$", stash, s)
        s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        s = re.sub(r"\[([^\]]+)\]\((http[^)]+)\)",
                   r'<a href="\2" target="_blank" rel="noopener">\1</a>', s)
        s = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", r'<a href="\2">\1</a>', s)
        def code(m):
            c = m.group(1)
            n = nodes.get(c)
            if n and n.get("playback"):
                return f'<a class="doc-concept" href="{root}{n["playback"]}">' \
                       f"<code>{c}</code></a>"
            if c in sym_ids:
                return f'<code data-notation="{c}">{c}</code>'
            if c in formula_ids:
                return f'<a class="doc-concept" href="{root}site/notation.html#{c}">' \
                       f"<code>{c}</code></a>"
            return f"<code>{c}</code>"
        s = re.sub(r"`([^`]+)`", code, s)
        s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
        s = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<em>\1</em>", s)
        s = re.sub(r"(?<![\w$])_([^_\n]+)_(?![\w])", r"<em>\1</em>", s)
        return re.sub("\x00(\\d+)\x00", lambda m: math[int(m.group(1))], s)

    def convert(md, root):
        md = re.sub(r"\A---\s*\n.*?\n---\s*\n", "", md, flags=re.S)
        out, buf, list_tag, li_idx, bq, math_raw, fence = [], [], None, None, False, False, False
        esc = lambda s: s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

        def flush_par():
            nonlocal buf
            if buf:
                out.append("<p>" + inline(" ".join(buf), root) + "</p>")
                buf = []

        def end_list():
            nonlocal list_tag, li_idx
            if list_tag:
                out.append(f"</{list_tag}>")
                list_tag = li_idx = None

        def end_bq():
            nonlocal bq
            if bq:
                out.append("</blockquote>")
                bq = False

        for line in md.split("\n"):
            t = line.strip()
            if t.startswith("```"):
                flush_par(); end_list(); end_bq()
                out.append("</code></pre>" if fence else "<pre><code>")
                fence = not fence
                continue
            if fence:
                out.append(esc(line.rstrip()))
                continue
            if math_raw:
                out.append(line.rstrip())
                if "$$" in t:
                    math_raw = False
                continue
            if t.startswith("$$"):
                flush_par(); end_list(); end_bq()
                if t.count("$$") >= 2:
                    out.append(f"<p>{t}</p>")
                else:
                    math_raw = True
                    out.append(line.rstrip())
                continue
            if not t:
                flush_par(); end_list(); end_bq()
                continue
            if t.startswith(">"):
                flush_par(); end_list()
                if not bq:
                    out.append("<blockquote>")
                    bq = True
                out.append(f"<p>{inline(t.lstrip('> ').strip(), root)}</p>")
                continue
            h = re.match(r"(#{1,4})\s+(.*)", t)
            if h:
                flush_par(); end_list(); end_bq()
                out.append(f"<h{len(h.group(1))}>{inline(h.group(2), root)}</h{len(h.group(1))}>")
                continue
            m = re.match(r"(\d+)\.\s+(.*)", t) or re.match(r"[-*]\s+(.*)", t)
            if m:
                flush_par(); end_bq()
                tag = "ol" if m.lastindex == 2 else "ul"
                body = m.group(2) if tag == "ol" else m.group(1)
                if list_tag != tag:
                    end_list()
                    out.append(f"<{tag}>")
                    list_tag = tag
                out.append(f"<li>{inline(body, root)}</li>")
                li_idx = len(out) - 1
                continue
            if list_tag and li_idx is not None:
                out[li_idx] = out[li_idx][:-5] + " " + inline(t, root) + "</li>"
            else:
                buf.append(t)                           # soft-wrapped paragraph
        flush_par(); end_list(); end_bq()
        if fence:
            out.append("</code></pre>")
        return "\n    ".join(out)

    for n in data["nodes"]:
        if "page" not in n:
            continue
        md_path = ROOT / n["page"]
        folder = md_path.parent
        root = "../" * len(folder.relative_to(ROOT).parts)
        _, sym_list = front_matter(md_path)
        chips = ""
        if sym_list:
            chips = '<p class="doc-syms">' + " ".join(
                f'<span data-notation="{s}"></span>' if s in sym_ids
                else f'<a class="doc-concept" href="{root}site/notation.html#{s}"><code>{s}</code></a>'
                for s in sym_list) + "</p>"
        play = f'<a href="playback.html">Playback</a>' if (folder / "playback.html").is_file() else ""
        nav = f'<nav><a href="{root}site/index.html">Map</a>{play}<a href="index.md">Notes</a></nav>'
        html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{n['title']} · notes</title>
  <link rel="stylesheet" href="{root}site/assets/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+" crossorigin="anonymous">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" integrity="sha384-7zkQWkzuo3B5mTepMUcHkMB5jZaolc2xDwL6VFqjFALcbeS9Ggm/Yr2r3Dy4lfFg" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" integrity="sha384-43gviWU0YVjaDtb/GhzOouOXtZMP/7XUzwPTstBeZFe/+rCMvRwr4yROQP43s0Xk" crossorigin="anonymous"></script>
</head>
<body data-concept="{n['id']}" data-page-id="{n['id']}" data-root="{root}">
  <header class="top">
    <h1>{n['title']}</h1>
    {nav}
  </header>
  <main class="doc">
    <p class="doc-summary muted">{n.get('summary', '')}</p>
    {chips}
    {convert(md_path.read_text(encoding="utf-8"), root)}
    <p class="muted doc-src"><a href="index.md">view markdown source</a></p>
  </main>
  <script src="{root}site/map.js"></script>
  <script src="{root}site/assets/page-id.js"></script>
  <script src="{root}site/notation-data.js"></script>
  <script src="{root}site/assets/notation.js"></script>
  <script src="{root}site/lore-data.js"></script>
  <script src="{root}site/assets/lore.js"></script>
  <script src="{root}site/assets/notes.js"></script>
  <script src="{root}site/assets/progress.js"></script>
  <script src="{root}site/assets/search.js"></script>
  <script>window.addEventListener("load", () => window.renderMathInElement && renderMathInElement(document.body, {{delimiters: [{{left: "$$", right: "$$", display: true}}, {{left: "$", right: "$", display: false}}], throwOnError: false}}));</script>
</body>
</html>
"""
        (folder / "index.html").write_text(html, encoding="utf-8")


def validate_external_links():
    """External links must open in a new tab: every literal <a href="http…">
    in site assets and generated pages needs target="_blank"."""
    errors = []
    pat = re.compile(r'<a\b[^>]*href="https?://[^>]*>', re.S)
    files = list((ROOT / "site").rglob("*.html")) + list((ROOT / "site" / "assets").rglob("*.js"))
    for f in files:
        rel = f.relative_to(ROOT).as_posix()
        for m in pat.finditer(f.read_text(encoding="utf-8")):
            if 'target="_blank"' not in m.group(0):
                errors.append(f"{rel}: external link missing target=\"_blank\": {m.group(0)[:80]}")
    return errors


def main():
    try:
        sys.stdout.reconfigure(errors="replace")
    except Exception:
        pass
    data = json.loads(MAP.read_text(encoding="utf-8"))
    notation = json.loads(NOTATION.read_text(encoding="utf-8"))
    lore = json.loads(LORE.read_text(encoding="utf-8"))
    errors, warnings = validate_map(data)
    errors += validate_page_ids()
    n_errors, used = validate_notation(notation, {n["id"] for n in data["nodes"]})
    errors += n_errors
    l_errors, lore_used = validate_lore(lore)
    errors += l_errors
    gi = ROOT / ".gitignore"
    gi_text = gi.read_text(encoding="utf-8") if gi.is_file() else ""
    if not re.search(r"^progress/$", gi_text, re.M):
        errors.append(".gitignore: needs a progress/ entry — owner level data must not commit")
    if not re.search(r"^notes/\*$", gi_text, re.M):
        errors.append(".gitignore: needs a notes/* entry — owner notes must not commit")
    errors += validate_external_links()
    warnings += validate_links(data, notation)
    for p in lore["people"] + lore["theorems"]:
        p["used"] = lore_used.get(p["id"], [])
    for w in warnings:
        print("warning:", w)
    for e in errors:
        print("error:", e)
    if errors:
        sys.exit(1)

    header = "// Generated by tools/build.py. Do not edit.\n"
    outputs = {
        "map": header + "window.CONCEPT_MAP = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n",
        "notation": header + "window.NOTATION = " + json.dumps(dict(notation, used=used), ensure_ascii=False, indent=1) + ";\n",
        "lore": header + "window.LORE = " + json.dumps(lore, ensure_ascii=False, indent=1) + ";\n",
    }
    for key, js in outputs.items():
        out = OUTPUTS[key]
        if "--check" in sys.argv:
            if not out.is_file() or out.read_text(encoding="utf-8") != js:
                print(f"error: {out.relative_to(ROOT).as_posix()} is stale; run python tools/build.py")
                sys.exit(1)
        else:
            out.write_text(js, encoding="utf-8")
    if "--check" not in sys.argv:
        render_concept_pages(data, notation)
    print(f"ok: {len(data['nodes'])} concepts, {len(notation['symbols'])} symbols, {len(notation['formulas'])} formulas, "
          f"{len(lore['people'])} people, {len(lore['theorems'])} theorems")


if __name__ == "__main__":
    main()
