/* EVOXFIT Fitness Health Club Maia — "Qual o horário mais conveniente?": escolhe uma hora e segue para o formulário já preenchida */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg", R = 135, CIRC = 2 * Math.PI * R;
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  /* Mostrador de 24 horas (régua de marcas, arco e ponteiro) */
  window.EVOXDial = {
    build: function (root) {
      var g = root.querySelector("[data-ticks]");
      if (!g || g.childNodes.length) return;
      for (var i = 0; i < 24; i++) {
        var a = (i / 24) * Math.PI * 2 - Math.PI / 2, big = i % 6 === 0, r1 = big ? 152 : 154, r2 = big ? 172 : 164;
        var ln = document.createElementNS(NS, "line");
        ln.setAttribute("x1", (200 + Math.cos(a) * r1).toFixed(2)); ln.setAttribute("y1", (200 + Math.sin(a) * r1).toFixed(2));
        ln.setAttribute("x2", (200 + Math.cos(a) * r2).toFixed(2)); ln.setAttribute("y2", (200 + Math.sin(a) * r2).toFixed(2));
        ln.setAttribute("class", "tick" + (big ? " big" : ""));
        g.appendChild(ln);
        if (big) {
          var tx = document.createElementNS(NS, "text");
          tx.setAttribute("x", (200 + Math.cos(a) * 190).toFixed(2)); tx.setAttribute("y", (200 + Math.sin(a) * 190 + 5).toFixed(2));
          tx.textContent = p2(i); g.appendChild(tx);
        }
      }
      var arc = root.querySelector("[data-arc]");
      arc.style.strokeDasharray = CIRC.toFixed(2); arc.style.strokeDashoffset = CIRC.toFixed(2);
    },
    set: function (root, hours) {
      var f = Math.min(1, Math.max(0, hours / 24));
      root.querySelector("[data-arc]").style.strokeDashoffset = (CIRC * (1 - f)).toFixed(2);
      root.querySelector("[data-hand]").style.transform = "rotate(" + (f * 360).toFixed(2) + "deg)";
    }
  };
})();
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
