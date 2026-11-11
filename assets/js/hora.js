/* EVOXFIT Maia — "A que horas te dá jeito?": escolhe uma hora e segue para o formulário já preenchida */
(function () {
  "use strict";
  var sec = document.querySelector("[data-hora]");
  if (!sec || !window.EVOXDial) return;
  var slots = [].slice.call(sec.querySelectorAll(".slot"));
  var dial = sec.querySelector(".dial"), timeEl = sec.querySelector("[data-time]"), label = sec.querySelector("[data-label]");
  var msg = sec.querySelector("[data-msg]"), cta = sec.querySelector("[data-cta]"), ctaText = sec.querySelector("[data-cta-text]");
  var cur = 2, inView = false;
  function en() { return window.EVOXLANG === "en"; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmt(v) { var h = Math.floor(v), m = Math.round((v - h) * 60); return pad(h) + ":" + pad(m); }

  window.EVOXDial.build(dial);
  function select(i, move) {
    cur = i;
    var b = slots[i], h = +b.dataset.h, t = fmt(h);
    slots.forEach(function (s, k) { s.setAttribute("aria-checked", k === i ? "true" : "false"); s.tabIndex = k === i ? 0 : -1; });
    timeEl.textContent = t;
    label.textContent = en() ? b.dataset.tEn : b.dataset.t;
    msg.textContent = en() ? b.dataset.mEn : b.dataset.m;
    cta.href = "primeiro-treino.html?h=" + h;
    ctaText.textContent = (en() ? "Book for " : "Marcar para as ") + t;
    window.EVOXDial.set(dial, inView || move ? h : 0);
    if (move) b.focus();
  }
  slots.forEach(function (b, i) {
    b.addEventListener("click", function () { select(i, false); });
    b.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); select((cur + 1) % slots.length, true); }
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); select((cur + slots.length - 1) % slots.length, true); }
    });
  });
  document.addEventListener("evox:lang", function () { select(cur, false); });
  select(cur, false);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { inView = true; select(cur, false); o.disconnect(); } }, { threshold: 0.35 }).observe(sec);
  } else { inView = true; select(cur, false); }
})();
