/* EVOXFIT Fitness Health Club Maia — comportamento partilhado (idioma, menu, cabeçalho, transições, mapa, galeria) */
(function () {
  "use strict";
  var doc = document.documentElement, body = document.body;
  doc.classList.remove("no-js");
  var C = window.EVOX || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.EVOXLANG = "pt";

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function sstore(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Idioma PT / EN ---------- */
  function swap(sel, attrKey, getter, setter) {
    document.querySelectorAll(sel).forEach(function (el) { setter(el); });
  }
  function applyLang(lang) {
    window.EVOXLANG = lang;
    doc.lang = lang === "en" ? "en" : "pt-PT";
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (el.dataset.pt === undefined) el.dataset.pt = el.innerHTML;
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.pt;
    });
    [["data-en-ph", "placeholder", "enPh", "ptPh"], ["data-en-aria", "aria-label", "enAria", "ptAria"], ["data-en-alt", "alt", "enAlt", "ptAlt"], ["data-en-title", "title", "enTitle", "ptTitle"]].forEach(function (a) {
      document.querySelectorAll("[" + a[0] + "]").forEach(function (el) {
        if (el.dataset[a[3]] === undefined) el.dataset[a[3]] = el.getAttribute(a[1]) || "";
        el.setAttribute(a[1], lang === "en" ? el.dataset[a[2]] : el.dataset[a[3]]);
      });
    });
    var t = doc.dataset[lang === "en" ? "titleEn" : "titlePt"];
    if (t) document.title = t;
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false"); });
    document.querySelectorAll("[data-wa]").forEach(setWa);
    document.dispatchEvent(new CustomEvent("evox:lang", { detail: lang }));
  }
  function setWa(a) {
    var msg = window.EVOXLANG === "en" ? a.dataset.waEn : a.dataset.wa;
    a.href = "https://wa.me/" + (C.wa || "351961382108") + "?text=" + encodeURIComponent(msg);
  }
  doc.dataset.titlePt = document.title;
  var saved = store("evox-lang");
  applyLang(saved === "en" ? "en" : "pt");
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { store("evox-lang", b.dataset.lang); applyLang(b.dataset.lang); });
  });

  /* ---------- Menu móvel ---------- */
  var menu = document.querySelector(".mobile-menu");
  var openBtn = document.querySelector(".menu-btn");
  var closeBtn = document.querySelector(".close-btn");
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("open", open);
    body.classList.toggle("menu-open", open);
    if (openBtn) openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    body.style.overflow = open ? "hidden" : "";
    if (window.__lenis) { if (open) window.__lenis.stop(); else window.__lenis.start(); }
    if (open && closeBtn) closeBtn.focus(); else if (!open && openBtn && openBtn.offsetParent) openBtn.focus();
  }
  if (openBtn) openBtn.addEventListener("click", function () { setMenu(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
  if (menu) menu.querySelectorAll("nav a").forEach(function (a) { a.addEventListener("click", function () { if (a.getAttribute("href").charAt(0) === "#") setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu && menu.classList.contains("open")) setMenu(false); });

  /* ---------- Cabeçalho, barra de progresso e botões fixos ---------- */
  var header = document.querySelector(".site-header");
  var dock = document.querySelector(".dock");
  var bar = document.querySelector("[data-vs]");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY, dy = y - lastY;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    doc.style.setProperty("--p", Math.min(1, y / max).toFixed(4));
    var heroEnd = bar ? bar.offsetTop + bar.offsetHeight - window.innerHeight * 0.9 : 0;
    var past = !bar || y > heroEnd;
    if (header && bar) header.classList.toggle("solid", past);
    if (header) {
      if (y < 80 || dy < -4 || (bar && !past)) header.classList.remove("away");
      else if (dy > 6 && y > 300 && !(menu && menu.classList.contains("open"))) header.classList.add("away");
    }
    if (dock) dock.classList.toggle("show", y > 260);
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Transições entre páginas (cortina amarela) ---------- */
  if (!reduce && "animate" in document.body) {
    var veil = document.createElement("div");
    veil.className = "page-veil"; veil.setAttribute("aria-hidden", "true");
    veil.innerHTML = "<span>EVOXFIT</span>";
    body.appendChild(veil);
    var EASE = "cubic-bezier(.7,0,.2,1)";
    if (sstore("evox-nav") === "1") {
      sstore("evox-nav", null);
      veil.style.transform = "translateY(0)";
      var out = veil.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], { duration: 650, easing: EASE, delay: 120, fill: "forwards" });
      out.onfinish = function () { veil.style.display = "none"; };
    }
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      sstore("evox-nav", "1");
      veil.style.display = ""; veil.style.transform = "translateY(100%)";
      veil.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], { duration: 480, easing: EASE, fill: "forwards" });
      setTimeout(function () { location.href = a.href; }, 500);
    });
    window.addEventListener("pageshow", function (e) { if (e.persisted) { veil.style.display = "none"; } });
  }

  /* ---------- Botões grandes: brilho que segue o rato ---------- */
  document.addEventListener("pointermove", function (e) {
    var el = e.target.closest && e.target.closest(".btn--big");
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (e.clientX - r.left) + "px");
    el.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });

  /* ---------- Mapa: só fica interativo depois de tocar ---------- */
  document.querySelectorAll(".real-map").forEach(function (m) {
    var lock = m.querySelector(".map-lock");
    if (lock) lock.addEventListener("click", function () { m.classList.add("live"); });
  });

  /* ---------- Galeria (só existe se houver fotografias) ---------- */
  var grid = document.querySelector("[data-photos]"), lb = document.querySelector(".lightbox");
  if (grid && lb) {
    var items = Array.prototype.slice.call(grid.querySelectorAll("button[data-full]")), cur = 0, last = null;
    var im = lb.querySelector("img");
    var show = function (i) { cur = (i + items.length) % items.length; im.src = items[cur].dataset.full; im.alt = items[cur].querySelector("img").alt; };
    var close = function () { lb.classList.remove("open"); body.style.overflow = ""; im.removeAttribute("src"); if (last) last.focus(); };
    items.forEach(function (b, i) { b.addEventListener("click", function () { last = b; show(i); lb.classList.add("open"); body.style.overflow = "hidden"; lb.querySelector(".lb-close").focus(); }); });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(cur - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  /* ---------- Fotografias: setas que deslizam a tira ---------- */
  var strip = document.querySelector("[data-strip]");
  if (strip) {
    var prev = document.querySelector("[data-strip-prev]"), next = document.querySelector("[data-strip-next]");
    var step = function () { var c = strip.children[0]; return c ? c.getBoundingClientRect().width + 14 : 300; };
    var sync = function () {
      if (prev) prev.disabled = strip.scrollLeft < 8;
      if (next) next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 8;
    };
    if (prev) prev.addEventListener("click", function () { strip.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { strip.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }); });
    strip.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
