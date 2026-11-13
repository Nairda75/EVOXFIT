/* EVOXFIT Fitness Health Club Maia — início: sequência "a entrar no ginásio" (3D) + diferenças, passo a passo.
   Sem JS ou com "reduzir movimento" a sequência aparece em lista simples, uma diferença a seguir à outra. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sec = document.querySelector("[data-vs]");
  if (!sec) return;

  var steps = [].slice.call(sec.querySelectorAll(".vs-step")), tabs = [].slice.call(sec.querySelectorAll(".vs-tabs button"));
  var N = steps.length, INTRO = parseFloat(sec.getAttribute("data-intro") || "0.1"), live = !reduce, cur = -2, showT = 0;
  if (live) sec.classList.add("vs-live");

  function span() { return Math.max(1, sec.offsetHeight - window.innerHeight); }
  function progress() { return Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / span())); }

  function render() {
    if (!live) return;
    var p = progress(), idx = p > INTRO ? Math.min(N - 1, Math.floor((p - INTRO) / (1 - INTRO) * N)) : -1;
    if (idx === cur) return;
    var first = cur === -2;
    cur = idx;
    sec.classList.toggle("is-step", idx >= 0);
    tabs.forEach(function (b, i) {
      b.classList.toggle("on", i === idx);
      if (i === idx) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    /* com o 3D ligado: o texto anterior sai logo e o novo entra quando o ecrã está mais escuro (a meio da viagem) */
    steps.forEach(function (s) { s.classList.remove("on"); s.setAttribute("aria-hidden", "true"); });
    clearTimeout(showT);
    function show() { steps.forEach(function (s, i) { s.classList.toggle("on", i === idx); s.setAttribute("aria-hidden", i === idx ? "false" : "true"); }); }
    if (first || idx < 0 || !sec.classList.contains("gl-on")) show(); else showT = setTimeout(show, 720);
  }
  window.addEventListener("scroll", render, { passive: true });
  window.addEventListener("resize", render);
  render();

  /* Botões e separadores: levam mesmo ao passo pedido */
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
