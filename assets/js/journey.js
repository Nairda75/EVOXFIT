/* EVOXFIT Fitness Health Club Maia — início em slides: ao deslizar, cada ecrã sobe como uma folha arredondada sobre o anterior
   (o anterior escurece e afasta-se). Só usa transform/opacity, sem bibliotecas. */
(function () {
  "use strict";
  var root = document.querySelector("[data-journey]");
  if (!root) return;
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var layers = [].slice.call(root.querySelectorAll("[data-layer]")), N = layers.length;
  if (reduce || !doc.classList.contains("js-anim") || N < 2) { root.classList.add("static"); return; }

  var stage = root.querySelector(".j-stage");
  var medias = layers.map(function (l) { return l.querySelector(".j-media"); });
  var copies = layers.map(function (l) { return l.querySelector(".j-copy"); });
  var shades = layers.map(function (l) { return l.querySelector("[data-shade]"); });
  var dotsBox = root.querySelector("[data-j-dots]"), curEl = root.querySelector("[data-j-cur]");
  var barEl = root.querySelector("[data-j-bar]"), hint = root.querySelector("[data-j-hint]");
  var dots = [];
  var M = parseFloat(getComputedStyle(doc).getPropertyValue("--m")) || 12;

  root.querySelectorAll("img[loading]").forEach(function (im) { im.loading = "eager"; im.decoding = "async"; });

  function en() { return window.EVOXLANG === "en"; }
  layers.forEach(function (l, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.addEventListener("click", function () { go(i); });
    dotsBox.appendChild(b); dots.push(b);
  });
  function labels() { dots.forEach(function (b, i) { b.setAttribute("aria-label", (i + 1) + ". " + (en() ? layers[i].dataset.titleEn : layers[i].dataset.title)); }); }
  labels(); document.addEventListener("evox:lang", labels);

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var cache = [], lastIdx = -1, ticking = false;
  function span() { return Math.max(1, root.offsetHeight - stage.offsetHeight); }

  function go(i) {
    var y = root.getBoundingClientRect().top + window.scrollY;
    var p = clamp((i + 0.2) / (N - 1), 0, 1);
    window.scrollTo({ top: y - M + p * span(), behavior: "smooth" });
  }

  function update() {
    ticking = false;
    var r = root.getBoundingClientRect();
    var p01 = clamp((M - r.top) / span(), 0, 1), p = p01 * (N - 1);
    var enters = [], i;
    for (i = 0; i < N; i++) enters[i] = i === 0 ? 1 : ease(clamp((p - (i - 1) - 0.5) / 0.5, 0, 1));
    for (i = 0; i < N; i++) {
      var enter = enters[i], next = i < N - 1 ? enters[i + 1] : 0;
      var hold = clamp(p - i, 0, 1);
      var ty = ((1 - enter) * 104).toFixed(2);
      var scale = ((i === 0 ? 1 : 1.1 - 0.1 * enter) + 0.05 * hold).toFixed(4);
      var my = (-(1 - enter) * 22).toFixed(2);
      var so = (next * 0.62).toFixed(3);
      var co = clamp(1 - next * 2.2, 0, 1).toFixed(3), cy = (-next * 36).toFixed(1);
      var vis = enter > 0 && next < 1 ? "visible" : "hidden";
      var on = enter > 0.6 && next < 0.25;
      var key = ty + "|" + scale + "|" + my + "|" + so + "|" + co + "|" + cy + "|" + vis + "|" + on;
      if (cache[i] === key) continue;
      cache[i] = key;
      var L = layers[i];
      L.style.transform = "translate3d(0," + ty + "%,0)";
      L.style.visibility = vis;
      medias[i].style.transform = "translate3d(0," + my + "%,0) scale(" + scale + ")";
      shades[i].style.opacity = so;
      copies[i].style.opacity = co;
      copies[i].style.transform = "translate3d(0," + cy + "px,0)";
      L.classList.toggle("on", on);
    }
    var idx = clamp(Math.floor(p + 0.3), 0, N - 1);
    if (idx !== lastIdx) {
      lastIdx = idx;
      dots.forEach(function (b, k) { if (k === idx) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
      if (curEl) curEl.textContent = pad(idx + 1);
    }
    if (barEl) barEl.style.transform = "scaleX(" + p01.toFixed(4) + ")";
    if (hint) hint.style.opacity = p < 0.12 ? "1" : "0";
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", function () { cache = []; req(); });
  window.addEventListener("load", function () { cache = []; req(); });
  update();
})();
