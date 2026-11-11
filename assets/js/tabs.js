/* EVOXFIT Maia — abas: indicador que desliza, avanço automático opcional (data-auto="ms"),
   teclado (setas, Home, End), deslizar com o dedo e ARIA. Sem JS todos os painéis aparecem em lista. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init(root) {
    var list = root.querySelector('[role="tablist"]');
    if (!list) return;
    var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    var ink = list.querySelector(".tabs-ink");
    var vertical = root.classList.contains("tabs--v");
    var auto = reduce ? 0 : parseInt(root.getAttribute("data-auto") || "0", 10);
    var cur = -1, raf = 0, t0 = 0, spent = 0, paused = false, stopped = false, visible = true;

    root.classList.add("tabs-on");

    function moveInk() {
      if (!ink || cur < 0) return;
      var t = tabs[cur];
      if (vertical) { ink.style.transform = "translateY(" + t.offsetTop + "px)"; ink.style.height = t.offsetHeight + "px"; }
      else { ink.style.transform = "translateX(" + t.offsetLeft + "px)"; ink.style.width = t.offsetWidth + "px"; }
    }

    function select(i, user) {
      i = (i + tabs.length) % tabs.length;
      if (i === cur) return;
      root.setAttribute("data-dir", i > cur ? "next" : "prev");
      cur = i;
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        t.style.setProperty("--prog", on && auto && !stopped ? "0" : "0");
        if (panels[k]) { panels[k].classList.toggle("is-active", on); panels[k].setAttribute("aria-hidden", on ? "false" : "true"); }
      });
      moveInk();
      if (user && !reduce) {
        var t = tabs[i], box = list.getBoundingClientRect(), r = t.getBoundingClientRect();
        if (!vertical && (r.left < box.left || r.right > box.right)) list.scrollTo({ left: t.offsetLeft - 12, behavior: "smooth" });
      } else if (!vertical && tabs[i].offsetLeft + tabs[i].offsetWidth > list.clientWidth) {
        list.scrollLeft = Math.max(0, tabs[i].offsetLeft - 12);
      }
      spent = 0; t0 = 0;
      root.dispatchEvent(new CustomEvent("tabs:change", { detail: i }));
    }

    function tick(now) {
      raf = requestAnimationFrame(tick);
      if (!auto || stopped || paused || !visible || document.hidden) { t0 = 0; return; }
      if (!t0) t0 = now - spent;
      spent = now - t0;
      var p = Math.min(1, spent / auto);
      tabs[cur].style.setProperty("--prog", p.toFixed(4));
      if (p >= 1) { tabs[cur].style.setProperty("--prog", "0"); select(cur + 1, false); }
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { stopAuto(); select(i, true); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, to = -1;
        var fw = k === "ArrowRight" || (vertical && k === "ArrowDown"), bw = k === "ArrowLeft" || (vertical && k === "ArrowUp");
        if (fw) to = i + 1; else if (bw) to = i - 1; else if (k === "Home") to = 0; else if (k === "End") to = tabs.length - 1; else return;
        e.preventDefault(); stopAuto(); select(to, true); tabs[cur].focus();
      });
    });

    function stopAuto() { if (!auto) return; stopped = true; tabs.forEach(function (t) { t.style.setProperty("--prog", "0"); }); root.classList.add("tabs-manual"); }

    /* Deslizar com o dedo nos painéis */
    var panelBox = root.querySelector(".tabs-panels"), sx = 0, sy = 0, sid = null;
    if (panelBox) {
      panelBox.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse") return; sx = e.clientX; sy = e.clientY; sid = e.pointerId; });
      panelBox.addEventListener("pointerup", function (e) {
        if (sid !== e.pointerId) return; sid = null;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.6) { stopAuto(); select(cur + (dx < 0 ? 1 : -1), true); }
      });
      panelBox.addEventListener("pointercancel", function () { sid = null; });
    }

    /* Pausa ao pôr o rato/foco, e quando não está visível */
    root.addEventListener("mouseenter", function () { paused = true; });
    root.addEventListener("mouseleave", function () { paused = false; });
    root.addEventListener("focusin", function () { paused = true; });
    root.addEventListener("focusout", function () { paused = false; });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.35 }).observe(root);

    window.addEventListener("resize", moveInk);
    document.addEventListener("evox:lang", function () { setTimeout(moveInk, 30); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);

    var start = Math.max(0, tabs.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; }));
    select(start, false);
    if (ink) { ink.style.transition = "none"; moveInk(); requestAnimationFrame(function () { requestAnimationFrame(function () { ink.style.transition = ""; }); }); }
    if (auto) raf = requestAnimationFrame(tick);
    root.__tabs = { select: function (i) { stopAuto(); select(i, true); }, get index() { return cur; } };
  }

  document.querySelectorAll("[data-tabs]").forEach(init);
})();
