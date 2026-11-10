/* EVOXFIT Maia — relógio de 24 horas animado pelo scroll */
(function () {
  "use strict";
  var sec = document.querySelector("[data-clock]");
  if (!sec) return;
  var arc = sec.querySelector("[data-arc]"), hand = sec.querySelector("[data-hand]");
  var timeEl = sec.querySelector("[data-time]"), ticks = sec.querySelector("[data-ticks]");
  var slots = [].slice.call(sec.querySelectorAll(".clock-slot"));
  var NS = "http://www.w3.org/2000/svg", R = 135, CIRC = 2 * Math.PI * R;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  arc.style.strokeDasharray = CIRC.toFixed(2);
  arc.style.strokeDashoffset = CIRC.toFixed(2);

  for (var i = 0; i < 24; i++) {
    var a = (i / 24) * Math.PI * 2 - Math.PI / 2, big = i % 6 === 0;
    var r1 = big ? 152 : 154, r2 = big ? 172 : 164;
    var ln = document.createElementNS(NS, "line");
    ln.setAttribute("x1", (200 + Math.cos(a) * r1).toFixed(2)); ln.setAttribute("y1", (200 + Math.sin(a) * r1).toFixed(2));
    ln.setAttribute("x2", (200 + Math.cos(a) * r2).toFixed(2)); ln.setAttribute("y2", (200 + Math.sin(a) * r2).toFixed(2));
    ln.setAttribute("class", "tick" + (big ? " big" : ""));
    ticks.appendChild(ln);
    if (big) {
      var tx = document.createElementNS(NS, "text");
      tx.setAttribute("x", (200 + Math.cos(a) * 190).toFixed(2)); tx.setAttribute("y", (200 + Math.sin(a) * 190 + 7).toFixed(2));
      tx.textContent = (i < 10 ? "0" : "") + i;
      ticks.appendChild(tx);
    }
  }

  var target = 0, cur = 0, lastSlot = -1, lastTime = "";
  function clamp(v) { return Math.min(1, Math.max(0, v)); }
  function read() { var r = sec.getBoundingClientRect(); target = clamp(-r.top / Math.max(1, sec.offsetHeight - window.innerHeight)); }
  window.addEventListener("scroll", read, { passive: true });
  window.addEventListener("resize", read);
  read(); cur = target;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function render(p) {
    arc.style.strokeDashoffset = (CIRC * (1 - p)).toFixed(2);
    hand.setAttribute("transform", "rotate(" + (p * 360).toFixed(2) + " 200 200)");
    var mins = Math.round(p * 24 * 60), t = p >= 0.999 ? "24:00" : pad(Math.floor(mins / 60) % 24) + ":" + pad(mins % 60);
    if (t !== lastTime) { lastTime = t; timeEl.textContent = t; }
    var hour = p * 24, idx = 0;
    slots.forEach(function (s, i) { if (hour >= +s.dataset.at) idx = i; });
    if (idx !== lastSlot) {
      lastSlot = idx;
      slots.forEach(function (s, i) { s.classList.toggle("on", i === idx); });
      sec.dataset.phase = String(idx);
    }
  }

  var running = false, raf = 0;
  function loop() {
    if (!running) return;
    cur += (target - cur) * (reduce ? 1 : 0.12);
    if (Math.abs(target - cur) < 0.0001) cur = target;
    render(cur);
    raf = requestAnimationFrame(loop);
  }
  new IntersectionObserver(function (es) {
    if (es[0].isIntersecting) { if (!running) { running = true; raf = requestAnimationFrame(loop); } }
    else { running = false; cancelAnimationFrame(raf); }
  }, { rootMargin: "100px 0px" }).observe(sec);
  render(cur);
})();
