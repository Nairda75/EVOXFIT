/* EVOXFIT Fitness Health Club Maia — início: o disco de ginásio que é também um relógio de 24 h.
   Ao deslizar, o disco roda e transforma-se em cada passo (24 h, equipamento, receção, avaliações, primeiro treino).
   Sem JS ou com "reduzir movimento": o disco fica estático e os passos aparecem em lista. */
(function () {
  "use strict";
  var sec = document.querySelector("[data-disc]");
  if (!sec) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var C = window.EVOX || {};
  function en() { return window.EVOXLANG === "en"; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hh(t) { var p = String(t).split(":"); return (+p[0]) + (+p[1] || 0) / 60; }
  function $(s) { return sec.querySelector(s); }
  function $$(s) { return [].slice.call(sec.querySelectorAll(s)); }

  var stick = $(".disc-stick"), intro = $(".disc-intro"), caps = $$(".disc-cap"), tabs = $$(".disc-tabs button");
  var core = $(".disc-core"), coreB = $(".disc-core b"), coreL = $(".disc-core span");
  var arcA = $(".arcA"), arcR = $(".arcR"), arcC = $(".arcC"), arcB = $$(".arcB");
  var hand = $(".d-hand"), textring = $(".d-textring"), orbit = $(".d-orbit"), d3 = $(".disc-3d"), tilt = $(".disc-tilt"), viz = $(".disc-viz");
  var N = caps.length, INTRO = parseFloat(sec.getAttribute("data-intro") || "0.1"), live = !reduce, cur = -2, S = 0, showT = 0;
  if (live) sec.classList.add("disc-live");

  /* ---------- geometria vinda dos dados ---------- */
  var NS = "http://www.w3.org/2000/svg";
  function ang(h) { return h / 24 * 2 * Math.PI - Math.PI / 2; }
  var rec = (C.rececao || {})["1"] || [];
  if (!rec.length) { for (var k in (C.rececao || {})) { if ((C.rececao[k] || []).length) { rec = C.rececao[k]; break; } } }
  var rs = rec.length ? hh(rec[0][0]) : 8, re = rec.length ? hh(rec[rec.length - 1][1]) : 21;
  arcR.style.strokeDashoffset = String(-rs);
  [["rl-a", rs], ["rl-b", re]].forEach(function (x) {
    var t = $("." + x[0]); if (!t) return;
    t.setAttribute("x", (Math.cos(ang(x[1])) * 214).toFixed(1)); t.setAttribute("y", (Math.sin(ang(x[1])) * 214 + 5).toFixed(1));
    t.textContent = pad(Math.round(x[1]));
  });
  var eq = C.equip || [], tot = eq.reduce(function (a, g) { return a + g.n; }, 0) || 1, GAP = 1.8, acc = 0, bLen = [], bOff = [];
  arcB.forEach(function (el, i) {
    var n = eq[i] ? eq[i].n : tot / 4, len = Math.max(0.5, n / tot * (100 - GAP * arcB.length));
    bLen.push(len); bOff.push(-acc); acc += len + GAP;
    el.style.strokeDashoffset = String(-acc + len + GAP);
  });
  var rate = (C.nota || 4.7) / 5 * 100;

  function dash(el, len, total) { el.style.strokeDasharray = len.toFixed(2) + " " + (total - len).toFixed(2); }
  function nowH() { var d = new Date(); return d.getHours() + d.getMinutes() / 60; }

  /* ---------- estados do disco ---------- */
  var TILT = [[9, -15, 1], [0, 0, 1], [-7, 13, 1], [8, -10, 1], [-6, 10, 1], [0, 0, 1.04]];
  function apply(s) {
    var t = nowH();
    dash(arcA, s === 0 ? t / 24 * 100 : 100, 100);
    dash(arcR, s === 3 ? Math.max(0.1, re - rs) : 0, 24);
    var showB = s === 0 || s === 2 || s === 5;
    arcB.forEach(function (el, i) { el.style.transitionDelay = showB ? (i * 0.12) + "s" : "0s"; dash(el, showB ? bLen[i] : 0, 100); });
    dash(arcC, s === 0 || s === 4 || s === 5 ? rate : 0, 100);
    hand.style.transform = "rotate(" + (t / 24 * 360 + (s === 5 ? 360 : 0)).toFixed(2) + "deg)";
    var tl = TILT[s] || TILT[0];
    d3.style.setProperty("--rx", tl[0] + "deg"); d3.style.setProperty("--ry", tl[1] + "deg"); d3.style.setProperty("--sc", tl[2]);
  }

  /* ---------- número no centro ---------- */
  var cntRaf = 0, swapT = 0;
  function setCore(text, label, animate) {
    cancelAnimationFrame(cntRaf); clearTimeout(swapT);
    coreB.classList.toggle("l5", String(text).length > 3);
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
    if (s === 0) {
      var d = new Date();
      setCore(pad(d.getHours()) + ":" + pad(d.getMinutes()), en() ? "now · open" : "agora · aberto", animate);
      return;
    }
    var c = caps[s - 1];
    setCore(c.getAttribute("data-core"), en() ? c.getAttribute("data-core-l-en") : c.getAttribute("data-core-l"), animate);
  }

  /* ---------- mudança de passo ---------- */
  function setState(s, first) {
    S = s;
    sec.setAttribute("data-s", String(s));
    apply(s);
    coreFor(s, !first);
    tabs.forEach(function (b, i) { b.classList.toggle("on", i === s - 1); if (i === s - 1) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    intro.classList.toggle("on", s === 0);
    caps.forEach(function (c, i) { c.classList.toggle("on", i === s - 1); c.setAttribute("aria-hidden", i === s - 1 || !live ? "false" : "true"); });
    if (!first && !reduce) {
      sec.classList.remove("ripple-go"); void sec.offsetWidth; sec.classList.add("ripple-go");
    }
  }

  function span() { return Math.max(1, sec.offsetHeight - stick.offsetHeight); }
  function top0() { return parseFloat(getComputedStyle(stick).top) || 0; }
  var prog = 0;
  function progress() { return Math.min(1, Math.max(0, (top0() - sec.getBoundingClientRect().top) / span())); }
  function render() {
    if (!live) return;
    prog = progress();
    var idx = prog > INTRO ? Math.min(N - 1, Math.floor((prog - INTRO) / (1 - INTRO) * N)) : -1;
    if (idx === cur) return;
    var first = cur === -2;
    cur = idx;
    setState(idx + 1, first);
  }

  /* relógio vivo no estado inicial e rotação suave com o deslize */
  var rot = 0, rotT = 0, last = 0, visible = true, px = 0, py = 0, tpx = 0, tpy = 0;
  function loop(now) {
    if (visible) {
      var dt = Math.min(64, now - (last || now)); last = now;
      rotT = prog * 540;
      rot += (rotT - rot) * 0.1;
      var idle = (now / 1000) * 5;
      textring.style.transform = "rotate(" + (rot + idle).toFixed(2) + "deg)";
      orbit.style.transform = "rotate(" + (-(rot * 0.5) - idle * 1.6).toFixed(2) + "deg)";
      px += (tpx - px) * 0.08; py += (tpy - py) * 0.08;
      tilt.style.setProperty("--px", px.toFixed(2) + "deg"); tilt.style.setProperty("--py", py.toFixed(2) + "deg");
    } else last = 0;
    requestAnimationFrame(loop);
  }
  if (!reduce) {
    requestAnimationFrame(loop);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { rootMargin: "100px" }).observe(sec);
    if (window.matchMedia("(pointer:fine)").matches) {
      viz.addEventListener("pointermove", function (e) {
        var r = viz.getBoundingClientRect();
        tpx = ((e.clientX - r.left) / r.width - 0.5) * 12; tpy = -((e.clientY - r.top) / r.height - 0.5) * 10;
      });
      viz.addEventListener("pointerleave", function () { tpx = 0; tpy = 0; });
    }
  }
  setInterval(function () {
    if (S === 0) { arcA.style.transition = "none"; dash(arcA, nowH() / 24 * 100, 100); arcA.getBoundingClientRect(); arcA.style.transition = ""; hand.style.transform = "rotate(" + (nowH() / 24 * 360).toFixed(2) + "deg)"; coreFor(0, false); }
  }, 20000);
  document.addEventListener("evox:lang", function () { coreFor(S, false); });

  /* ---------- arranque: o disco desenha-se ao entrar ---------- */
  setState(0, true);
  cur = -1;
  if (live) { dash(arcA, 0, 100); dash(arcC, 0, 100); arcB.forEach(function (el) { dash(el, 0, 100); }); }
  if (live) { setTimeout(function () { apply(0); }, 650); } else { apply(0); }
  window.addEventListener("scroll", render, { passive: true });
  window.addEventListener("resize", render);
  render();

  /* botões e separadores: levam mesmo ao passo pedido */
  function go(n) {
    var i = Math.max(1, Math.min(N, n)) - 1, y;
    if (live) {
      var top = sec.getBoundingClientRect().top + window.scrollY;
      y = top - top0() + (INTRO + (i + 0.5) / N * (1 - INTRO)) * span();
    } else {
      y = caps[i].getBoundingClientRect().top + window.scrollY - 100;
    }
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }
  $$("[data-disc-go]").forEach(function (b) { b.addEventListener("click", function () { go(+b.getAttribute("data-disc-go")); }); });
  document.addEventListener("keydown", function (e) {
    if (!live || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/input|textarea|select/i.test((e.target.tagName || ""))) return;
    var r = sec.getBoundingClientRect();
    if (r.top > top0() + 2 || r.bottom < window.innerHeight * 0.6) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(Math.min(N, S + 1)); }
    else if (e.key === "ArrowLeft" && S > 1) { e.preventDefault(); go(S - 1); }
  });
})();
