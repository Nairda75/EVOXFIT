/* EVOXFIT Fitness Health Club Maia — início: visita 3D ao ginásio (gym3d.bundle.js) + painel de números e texto por passos.
   O 3D vive numa janela arredondada; o texto fica ao lado, nunca por cima da animação.
   Sem JS ou sem WebGL (ou com ?calmo no endereço): a janela mostra uma imagem e os passos aparecem em lista. */
(function () {
  "use strict";
  var sec = document.querySelector("[data-disc]");
  if (!sec) return;
  var reduce = /[?&]calmo\b/.test(location.search);
  var C = window.EVOX || {};
  function en() { return window.EVOXLANG === "en"; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hh(t) { var p = String(t).split(":"); return (+p[0]) + (+p[1] || 0) / 60; }
  function $(s) { return sec.querySelector(s); }
  function $$(s) { return [].slice.call(sec.querySelectorAll(s)); }

  var stick = $(".disc-stick"), intro = $(".disc-intro"), caps = $$(".disc-cap"), tabs = $$(".disc-tabs button");
  var core = $(".disc-core"), coreB = $(".disc-core b"), coreL = $(".disc-core span");
  var arcA = $(".arcA"), arcR = $(".arcR"), arcC = $(".arcC"), arcB = $$(".arcB");
  var N = caps.length, INTRO = parseFloat(sec.getAttribute("data-intro") || "0.1"), live = !reduce, cur = -2, S = 0, showT = 0, swapT = 0, cntRaf = 0;
  if (live) {
    sec.classList.add("disc-live");
    /* o 3D só é carregado quando há movimento; sem WebGL o pacote não faz nada e fica a imagem */
    var sc = document.createElement("script");
    sc.src = "assets/js/gym3d.bundle.js";
    document.body.appendChild(sc);
  }

  /* ---------- painel de números (dados reais do site) ---------- */
  var rec = (C.rececao || {})["1"] || [];
  if (!rec.length) { for (var k in (C.rececao || {})) { if ((C.rececao[k] || []).length) { rec = C.rececao[k]; break; } } }
  var rs = rec.length ? hh(rec[0][0]) : 8, re = rec.length ? hh(rec[rec.length - 1][1]) : 21;
  arcR.style.strokeDashoffset = String(-rs);
  var eq = C.equip || [], tot = eq.reduce(function (a, g) { return a + g.n; }, 0) || 1, GAP = 2.2, acc = 0, bLen = [];
  arcB.forEach(function (el, i) {
    var n = eq[i] ? eq[i].n : tot / 4, len = Math.max(0.6, n / tot * (100 - GAP * arcB.length));
    bLen.push(len); el.style.strokeDashoffset = String(-acc); acc += len + GAP;
  });
  var rate = (C.nota || 4.7) / 5 * 100;
  function dash(el, len, total) { el.style.strokeDasharray = len.toFixed(2) + " " + (total - len).toFixed(2); }

  function apply(s) {
    dash(arcA, 100, 100);
    dash(arcR, s === 3 ? Math.max(0.1, re - rs) : 0, 24);
    var showB = s === 0 || s === 2 || s === 5;
    arcB.forEach(function (el, i) { el.style.transitionDelay = showB ? (i * 0.12) + "s" : "0s"; dash(el, showB ? bLen[i] : 0, 100); });
    dash(arcC, s === 0 || s === 4 || s === 5 ? rate : 0, 100);
  }

  function setCore(text, label, animate) {
    cancelAnimationFrame(cntRaf); clearTimeout(swapT);
    core.classList.add("swap");
    swapT = setTimeout(function () {
      coreL.textContent = label;
      core.classList.remove("swap");
      var m = /^(\d+)([.,](\d+))?$/.exec(text);
      if (!m || !animate || reduce) { coreB.textContent = text; return; }
      var dec = m[3] ? m[3].length : 0, v = parseFloat(text.replace(",", ".")), t0 = performance.now(), D = 1100;
      (function step(now) {
        var p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 3), x = (v * e).toFixed(dec);
        coreB.textContent = en() ? x : x.replace(".", ",");
        if (p < 1) cntRaf = requestAnimationFrame(step);
      })(t0);
    }, animate ? 260 : 0);
  }
  function coreFor(s, animate) {
    var c = s === 0 ? intro : caps[s - 1];
    setCore(c.getAttribute("data-core"), en() ? c.getAttribute("data-core-l-en") : c.getAttribute("data-core-l"), animate);
  }

  /* ---------- mudança de passo ---------- */
  function showText(s) {
    intro.classList.toggle("on", s === 0);
    caps.forEach(function (c, i) { c.classList.toggle("on", i === s - 1); c.setAttribute("aria-hidden", i === s - 1 || !live ? "false" : "true"); });
  }
  function setState(s, first) {
    S = s;
    sec.setAttribute("data-s", String(s));
    apply(s);
    coreFor(s, !first);
    tabs.forEach(function (b, i) { b.classList.toggle("on", i === s - 1); if (i === s - 1) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    /* com o 3D ligado: o texto anterior sai logo e o novo entra pouco depois (a câmara segue o deslize, sem esperas) */
    intro.classList.remove("on"); caps.forEach(function (c) { c.classList.remove("on"); });
    clearTimeout(showT);
    if (first || !sec.classList.contains("gl-on")) showText(s); else showT = setTimeout(function () { showText(s); }, 140);
  }

  /* mesma conta que o pacote 3D usa, para o texto e a câmara andarem sempre juntos */
  function span() { return Math.max(1, sec.offsetHeight - window.innerHeight); }
  function progress() { return Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / span())); }
  function render() {
    if (!live) return;
    var p = progress(), idx = p > INTRO ? Math.min(N - 1, Math.floor((p - INTRO) / (1 - INTRO) * N)) : -1;
    if (idx === cur) return;
    var first = cur === -2;
    cur = idx;
    setState(idx + 1, first);
  }
  document.addEventListener("evox:lang", function () { coreFor(S, false); });

  /* ---------- arranque: os anéis desenham-se ao entrar ---------- */
  setState(0, true);
  cur = -1;
  if (live) {
    dash(arcA, 0, 100); dash(arcC, 0, 100); arcB.forEach(function (el) { dash(el, 0, 100); });
    setTimeout(function () { apply(0); }, 700);
  } else apply(0);
  window.addEventListener("scroll", render, { passive: true });
  window.addEventListener("resize", render);
  render();

  /* botões e separadores: levam mesmo ao passo pedido */
  function go(n) {
    var i = Math.max(1, Math.min(N, n)) - 1, y;
    if (live) {
      var top = sec.getBoundingClientRect().top + window.scrollY;
      y = top + (INTRO + (i + 0.5) / N * (1 - INTRO)) * span();
    } else {
      y = caps[i].getBoundingClientRect().top + window.scrollY - 100;
    }
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }
  $$("[data-disc-go]").forEach(function (b) { b.addEventListener("click", function () { go(+b.getAttribute("data-disc-go")); }); });

  /* faixa de baixo: deslizar, tocar ou clicar ali salta a animação e vai logo ao resto do site */
  var peek = $("[data-disc-skip]"), skipRaf = 0;
  function stopSkip() { if (skipRaf) { cancelAnimationFrame(skipRaf); skipRaf = 0; } }
  function skipToSite() {
    if (skipRaf) return;
    var y0 = window.scrollY, y1 = sec.getBoundingClientRect().bottom + y0 - 8, d = y1 - y0;
    if (d < 4) return;
    if (window.__lenis) { window.__lenis.scrollTo(y1, { duration: 1.1 }); return; }
    var t0 = performance.now(), D = Math.max(650, Math.min(1400, d / 2.4));
    (function step(now) {
      var p = Math.min(1, (now - t0) / D), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo({ top: y0 + d * e, behavior: "instant" });
      skipRaf = p < 1 ? requestAnimationFrame(step) : 0;
    })(t0);
  }
  if (peek && live) {
    var ty = null;
    peek.addEventListener("click", function (e) { e.preventDefault(); skipToSite(); });
    peek.addEventListener("wheel", function (e) { if (e.deltaY > 0) { e.preventDefault(); skipToSite(); } }, { passive: false });
    peek.addEventListener("touchstart", function (e) { ty = e.touches[0].clientY; }, { passive: true });
    peek.addEventListener("touchmove", function (e) {
      if (ty === null) return;
      if (ty - e.touches[0].clientY > 14) { ty = null; if (e.cancelable) e.preventDefault(); skipToSite(); }
    }, { passive: false });
    peek.addEventListener("touchend", function () { ty = null; }, { passive: true });
    /* o utilizador pode interromper: toque, tecla ou roda para trás (a inércia da roda para a frente não interrompe) */
    window.addEventListener("touchstart", function (e) { if (!peek.contains(e.target)) stopSkip(); }, { passive: true });
    window.addEventListener("keydown", stopSkip);
    window.addEventListener("wheel", function (e) { if (e.deltaY < 0) stopSkip(); }, { passive: true });
  }
  document.addEventListener("keydown", function (e) {
    if (!live || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/input|textarea|select/i.test((e.target.tagName || ""))) return;
    var r = sec.getBoundingClientRect();
    if (r.top > 2 || r.bottom < window.innerHeight * 0.6) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(Math.min(N, S + 1)); }
    else if (e.key === "ArrowLeft" && S > 1) { e.preventDefault(); go(S - 1); }
  });
})();
