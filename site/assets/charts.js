// MiniChart — tiny inline SVG line charts for callouts and widgets.
// One pattern for every chart: dashed limit lines, colored polylines, axis
// ticks, and a legend row rendered as HTML *above* the SVG so labels can
// never overlap the plot.
//
// Usage:
//   const c = MiniChart(document.getElementById("chart-x"), {
//     width: 460, height: 140, xmin: 0, xmax: 1000, ymin: 0, ymax: 2.1 });
//   c.legend([{ color: "#7aa2f7", label: "Σ 1/p" }, { color: "#9aa3b2", label: "Σ 1/n²" }]);
//   c.limit(Math.PI ** 2 / 6, "π²/6");
//   c.poly([[x, y], ...], "#7aa2f7", 1.7);
//   c.axis([1, 500, 1000], (t) => "x = " + t);
//
// Requires only the DOM; the page must load assets/charts.js.

(function () {
  const NS = "http://www.w3.org/2000/svg";
  const AXIS = "#2a2f3a", MUTED = "#9aa3b2";

  const el = (host, tag, attrs, txt) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (txt != null) e.textContent = txt;
    host.appendChild(e);
    return e;
  };

  function MiniChart(host, o) {
    o = o || {};
    const W = o.width || 460, H = o.height || 140;
    const padL = o.padL ?? 8, padR = o.padR ?? 12, padT = o.padT ?? 6, padB = o.padB ?? 20;
    const xmin = o.xmin ?? 0, xmax = o.xmax ?? 1, ymin = o.ymin ?? 0, ymax = o.ymax ?? 1;
    const svg = el(host, "svg", { viewBox: `0 0 ${W} ${H}` });
    const X = (x) => padL + ((W - padL - padR) * (x - xmin)) / (xmax - xmin);
    const Y = (v) => H - padB - ((H - padT - padB) * (v - ymin)) / (ymax - ymin);

    return {
      svg, X, Y, muted: MUTED,
      text: (x, y, s, color, size) =>
        el(svg, "text", { x, y, fill: color || MUTED, "font-size": size || 10.5 }, s),
      poly: (pts, color, w) =>
        el(svg, "polyline", {
          fill: "none", stroke: color, "stroke-width": w || 1.6, "stroke-linejoin": "round",
          points: pts.map(([a, b]) => `${X(a).toFixed(1)},${Y(Math.min(b, ymax)).toFixed(1)}`).join(" "),
        }),
      // dashed horizontal reference line with an end-aligned label above it
      limit: (v, label) => {
        el(svg, "line", { x1: padL, y1: Y(v), x2: W - padR, y2: Y(v), stroke: MUTED, "stroke-dasharray": "5 4" });
        el(svg, "text", { x: W - padR - 2, y: Y(v) - 4, fill: MUTED, "font-size": 10, "text-anchor": "end" }, label);
      },
      // baseline + labelled ticks
      axis: (ticks, fmt) => {
        el(svg, "line", { x1: padL, y1: H - padB, x2: W - padR, y2: H - padB, stroke: AXIS });
        (ticks || []).forEach((t) =>
          el(svg, "text", { x: X(t), y: H - 6, fill: MUTED, "font-size": 9, "text-anchor": "middle" },
            fmt ? fmt(t) : t));
      },
      // legend as an HTML row above the SVG — cannot overlap the plot
      legend: (items) => {
        const p = document.createElement("p");
        p.className = "chart-legend";
        p.innerHTML = items.map((i) => `<span style="color:${i.color}">—</span> ${i.label}`).join("&ensp;·&ensp;");
        host.insertBefore(p, svg);
      },
    };
  }

  window.MiniChart = MiniChart;
})();
