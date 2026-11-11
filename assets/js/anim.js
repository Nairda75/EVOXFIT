/* EVOXFIT Maia — animações (GSAP + ScrollTrigger + Lenis no computador).
   Tudo respeita "reduzir movimento" do sistema. Sem GSAP o site continua a funcionar. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Botões grandes: efeito magnético (só com rato) */
  function magnetic() {
    if (!window.gsap || !finePointer || reduce) return;
    document.querySelectorAll(".btn--big").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.16, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 0.4, ease: "power3.out" });
      });
      b.addEventListener("pointerleave", function () { gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,.4)" }); });
    });
  }

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("js-anim");

  /* ---------- Scroll suave no computador ---------- */
  if (finePointer && window.Lenis) {
    var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  magnetic();

  /* ---------- Títulos: as palavras sobem uma a uma ---------- */
  function split(el) {
    if (el.dataset.split === "1") return;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (t) {
      if (!t.textContent.trim()) return;
      var frag = document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement("span"); w.className = "w";
        var i = document.createElement("span"); i.className = "wi"; i.textContent = part;
        w.appendChild(i); frag.appendChild(w);
      });
      t.parentNode.replaceChild(frag, t);
    });
    el.dataset.split = "1";
  }
  var heads = gsap.utils.toArray("main h1, main h2:not(.sr-only), .final-cta h2").filter(function (h) { return !h.closest(".vs-step"); });
  heads.forEach(function (h) {
    split(h);
    var hero = !!h.closest(".vs-intro, .page-hero");
    gsap.from(h.querySelectorAll(".wi"), {
      yPercent: 120, rotate: 5, duration: 1.1, ease: "expo.out", stagger: 0.07, delay: hero ? 0.25 : 0,
      scrollTrigger: hero ? null : { trigger: h, start: "top 88%", once: true }
    });
  });
  document.addEventListener("evox:lang", function () {
    heads.forEach(function (h) { h.dataset.split = "0"; split(h); gsap.set(h.querySelectorAll(".wi"), { yPercent: 0, rotate: 0 }); });
    document.querySelectorAll("[data-count]").forEach(function (el) { if (el.dataset.done) el.textContent = fmt(+el.dataset.count, +(el.dataset.dec || 0)); });
  });

  /* ---------- Entradas do topo ---------- */
  gsap.from(".site-header .wrap > *", { y: -24, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, delay: 0.1 });
  if (document.querySelector(".vs-intro")) gsap.from(".vs-intro .eyebrow, .vs-now, .vs-intro .lead, .vs-intro .actions > *, .vs-proof, .vs-dial", { y: 34, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.55 });
  if (document.querySelector(".page-hero")) gsap.from(".page-hero .crumb, .page-hero .lead", { y: 26, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.5 });

  /* ---------- Cartões e listas em cascata ---------- */
  ["section:not(.vs) .eyebrow", ".zone", ".chip", ".voice", ".side-steps li", ".faq details", ".info li", ".hours li", ".form-card", ".invite .tabs", ".invite .actions > *", ".uno-core > *", ".contact .tabs", ".contact .real-map", ".tabs--v", ".final-cta .actions > *", ".footer-top > div", ".lead:not(.vs-intro .lead):not(.page-hero .lead)", ".stars", ".score", ".dist > div"].forEach(function (sel) {
    ScrollTrigger.batch(sel, {
      start: "top 92%", once: true,
      onEnter: function (els) { gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.09, overwrite: true, clearProps: "transform,opacity" }); }
    });
  });

  /* ---------- Faixa UNO Studio: as filas deslizam em sentidos opostos com o scroll ---------- */
  gsap.utils.toArray("[data-uno-row]").forEach(function (r) {
    var d = +r.getAttribute("data-uno-row");
    gsap.fromTo(r.querySelector(".uno-shift"), { xPercent: -7 * d }, { xPercent: 7 * d, ease: "none", scrollTrigger: { trigger: r.closest(".uno"), start: "top bottom", end: "bottom top", scrub: 0.6 } });
  });

  /* ---------- Contadores ---------- */
  function fmt(v, dec) { return v.toLocaleString(window.EVOXLANG === "en" ? "en-GB" : "pt-PT", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  gsap.utils.toArray("[data-count]").forEach(function (el) {
    var end = +el.dataset.count, dec = +(el.dataset.dec || 0), o = { v: 0 };
    el.textContent = fmt(0, dec);
    gsap.to(o, { v: end, duration: end > 10 ? 2.2 : 1.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 92%", once: true },
      onUpdate: function () { el.textContent = fmt(o.v, dec); }, onComplete: function () { el.textContent = fmt(end, dec); el.dataset.done = "1"; } });
  });

  /* ---------- Barras das avaliações ---------- */
  gsap.utils.toArray(".dist .b i").forEach(function (el, i) {
    var w = parseFloat(el.style.getPropertyValue("--w")) || 0;
    gsap.to(el, { scaleX: w, duration: 1.5, delay: i * 0.08, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 94%", once: true } });
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
