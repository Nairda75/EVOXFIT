/* EVOXFIT Fitness Health Club Maia — animações leves ao deslizar (sem bibliotecas): revelações, contadores, paralaxe e estado "aberto agora". */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var C = window.EVOX || {};
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function en() { return window.EVOXLANG === "en"; }

  /* ---------- Revelações ---------- */
  var rv = [].slice.call(document.querySelectorAll(".rv, .dist"));
  if (!hasIO || reduce) rv.forEach(function (el) { el.classList.add("in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contadores ---------- */
  var counts = [].slice.call(document.querySelectorAll("[data-count]"));
  function fmt(v, dec) { var t = v.toFixed(dec); return en() ? t : t.replace(".", ","); }
  counts.forEach(function (el) { el._v = parseFloat(el.dataset.count); el._d = parseInt(el.dataset.dec || "0", 10); });
  function runCount(el) {
    if (reduce) { el.textContent = fmt(el._v, el._d); el._done = true; return; }
    var t0 = performance.now(), D = 1400;
    (function step(now) {
      var p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(el._v * e, el._d);
      if (p < 1) requestAnimationFrame(step); else el._done = true;
    })(t0);
  }
  if (hasIO) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counts.forEach(function (el) { co.observe(el); });
  }
  document.addEventListener("evox:lang", function () { counts.forEach(function (el) { if (el._done) el.textContent = fmt(el._v, el._d); }); });

  /* ---------- Paralaxe suave ---------- */
  var par = [].slice.call(document.querySelectorAll("[data-par]")), pTick = false;
  function doPar() {
    pTick = false;
    var vh = window.innerHeight;
    par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var k = parseFloat(el.dataset.par) || 0.1, y = (r.top + r.height / 2 - vh / 2) * -k;
      el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0) scale(1.14)";
    });
  }
  if (par.length && !reduce) {
    window.addEventListener("scroll", function () { if (!pTick) { pTick = true; requestAnimationFrame(doPar); } }, { passive: true });
    window.addEventListener("resize", doPar);
    doPar();
  }

  /* ---------- Estado "aberto agora" e horário da receção de hoje ---------- */
  var now = [].slice.call(document.querySelectorAll("[data-now]")), rec = [].slice.call(document.querySelectorAll("[data-rec-today]"));
  function parse(t) { var p = t.split(":"); return (+p[0]) + (+p[1] || 0) / 60; }
  function recText(d) {
    var w = (C.rececao || {})[String(d.getDay())] || [], h = d.getHours() + d.getMinutes() / 60;
    if (!w.length) return en() ? "Reception closed today" : "Receção fechada hoje";
    var span = w.map(function (x) { return x[0] + "–" + x[1]; }).join(" · ");
    var open = w.some(function (x) { return h >= parse(x[0]) && h < parse(x[1]); });
    return (en() ? (open ? "Reception open now · " : "Reception today · ") : (open ? "Receção aberta agora · " : "Receção hoje · ")) + span;
  }
  function tick() {
    var d = new Date(), t = pad(d.getHours()) + ":" + pad(d.getMinutes());
    now.forEach(function (el) { el.textContent = en() ? "Open now (" + t + ") · 24-hour access" : "Aberto agora (" + t + ") · Acesso 24 horas"; });
    rec.forEach(function (el) { el.textContent = recText(d); });
  }
  if (now.length || rec.length) { tick(); setInterval(tick, 20000); document.addEventListener("evox:lang", tick); }
})();
