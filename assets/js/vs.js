/* EVOXFIT Maia — início: relógio "agora mesmo" e sequência EVOXFIT vs ginásio tradicional.
   Sem JS ou com "reduzir movimento" a sequência aparece simplesmente em lista, uma diferença a seguir à outra. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg", R = 135, CIRC = 2 * Math.PI * R;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function en() { return window.EVOXLANG === "en"; }

  /* Marcas das 24 horas no mostrador (partilhado com hora.js) */
  window.EVOXDial = {
    CIRC: CIRC,
    build: function (root) {
      var g = root.querySelector("[data-ticks]");
      if (!g || g.childNodes.length) return;
      for (var i = 0; i < 24; i++) {
        var a = (i / 24) * Math.PI * 2 - Math.PI / 2, big = i % 6 === 0;
        var r1 = big ? 152 : 154, r2 = big ? 172 : 164;
        var ln = document.createElementNS(NS, "line");
        ln.setAttribute("x1", (200 + Math.cos(a) * r1).toFixed(2)); ln.setAttribute("y1", (200 + Math.sin(a) * r1).toFixed(2));
        ln.setAttribute("x2", (200 + Math.cos(a) * r2).toFixed(2)); ln.setAttribute("y2", (200 + Math.sin(a) * r2).toFixed(2));
        ln.setAttribute("class", "tick" + (big ? " big" : ""));
        g.appendChild(ln);
        if (big) {
          var tx = document.createElementNS(NS, "text");
          tx.setAttribute("x", (200 + Math.cos(a) * 190).toFixed(2)); tx.setAttribute("y", (200 + Math.sin(a) * 190 + 7).toFixed(2));
          tx.textContent = pad(i); g.appendChild(tx);
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

  var sec = document.querySelector("[data-vs]");
  if (!sec) return;

  /* ---------- Mostrador com a hora do visitante ---------- */
  var dial = sec.querySelector(".vs-dial"), timeEl = sec.querySelector("[data-time]"), nowEl = sec.querySelector("[data-now]");
  window.EVOXDial.build(dial);
  function tick(first) {
    var d = new Date(), t = pad(d.getHours()) + ":" + pad(d.getMinutes());
    timeEl.textContent = t;
    if (nowEl) nowEl.textContent = en() ? "It's " + t + ". Yes, the door is open." : "Agora: " + t + ". Sim, a porta está aberta.";
    window.EVOXDial.set(dial, d.getHours() + d.getMinutes() / 60);
  }
  setTimeout(tick, 350);
  setInterval(tick, 20000);
  document.addEventListener("evox:lang", function () { tick(); });

  /* ---------- Sequência ---------- */
  var steps = [].slice.call(sec.querySelectorAll(".vs-step")), tabs = [].slice.call(sec.querySelectorAll(".vs-tabs button"));
  var N = steps.length, INTRO = 0.06, live = !reduce, cur = -2;
  if (live) sec.classList.add("vs-live");

  function span() { return Math.max(1, sec.offsetHeight - window.innerHeight); }
  function progress() { return Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / span())); }
  function render() {
    if (!live) return;
    var p = progress(), idx = p > INTRO ? Math.min(N - 1, Math.floor((p - INTRO) / (1 - INTRO) * N)) : -1;
    if (idx === cur) return;
    cur = idx;
    sec.classList.toggle("is-step", idx >= 0);
    steps.forEach(function (s, i) { s.classList.toggle("on", i === idx); s.setAttribute("aria-hidden", i === idx ? "false" : "true"); });
    tabs.forEach(function (b, i) { b.classList.toggle("on", i === idx); if (i === idx) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
  }
  window.addEventListener("scroll", render, { passive: true });
  window.addEventListener("resize", render);
  render();

  /* Botões: levam mesmo ao passo pedido */
  function go(n) {
    var i = Math.max(1, Math.min(N, n)) - 1, y;
    if (live) {
      var top = sec.getBoundingClientRect().top + window.scrollY;
      y = top + (INTRO + (i + 0.5) / N * (1 - INTRO)) * span();
    } else {
      y = steps[i].getBoundingClientRect().top + window.scrollY - 90;
    }
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }
  sec.querySelectorAll("[data-vs-go]").forEach(function (b) {
    b.addEventListener("click", function () { go(+b.getAttribute("data-vs-go")); });
  });
  document.addEventListener("keydown", function (e) {
    if (!live || cur < 0 || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/input|textarea|select/i.test((e.target.tagName || ""))) return;
    var r = sec.getBoundingClientRect();
    if (r.top > 0 || r.bottom < window.innerHeight) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 2); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(cur); }
  });
})();
