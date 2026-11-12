/* EVOXFIT Fitness Health Club Maia — animações leves ao deslizar (sem bibliotecas): revelações, contadores, paralaxe e secção "Porquê o EVOXFIT". */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function en() { return window.EVOXLANG === "en"; }

  /* ---------- Revelações ---------- */
  var rv = [].slice.call(document.querySelectorAll(".rv, .clip, .dist"));
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
    if (reduce) { el.textContent = fmt(el._v, el._d); return; }
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

  /* ---------- Porquê o EVOXFIT: a imagem muda com o texto ---------- */
  var items = [].slice.call(document.querySelectorAll(".why-item")), imgs = [].slice.call(document.querySelectorAll(".why-pic img"));
  function activate(i) {
    items.forEach(function (it, k) { it.classList.toggle("on", k === i); });
    imgs.forEach(function (im, k) { im.classList.toggle("on", k === i); });
  }
  if (items.length && hasIO) {
    var wo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) activate(items.indexOf(e.target)); });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    items.forEach(function (it) { wo.observe(it); });
  }

  /* ---------- Estado "aberto agora" ---------- */
  var now = [].slice.call(document.querySelectorAll("[data-now]"));
  function tick() {
    var d = new Date(), t = pad(d.getHours()) + ":" + pad(d.getMinutes());
    now.forEach(function (el) { el.textContent = en() ? "Open now (" + t + ") · 24-hour access" : "Aberto agora (" + t + ") · Acesso 24 horas"; });
  }
  if (now.length) { tick(); setInterval(tick, 20000); document.addEventListener("evox:lang", tick); }
})();
