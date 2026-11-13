/* EVOXFIT Fitness Health Club Maia — marcação do primeiro treino só nas horas em que a receção está aberta.
   O horário vem de window.EVOX.rececao (gerado a partir de _fonte/site.json): { "0": [], "1": [["08:00","21:00"]], ... } (0 = domingo). */
(function () {
  "use strict";
  var widgets = [].slice.call(document.querySelectorAll("[data-book]"));
  if (!widgets.length) return;
  var C = window.EVOX || {}, REC = C.rececao || {};
  var DAYS = 14, STEP = 0.5, LEAD = 0.25;

  function en() { return window.EVOXLANG === "en"; }
  function loc() { return en() ? "en-GB" : "pt-PT"; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function parse(t) { var p = String(t).split(":"); return (+p[0]) + (+p[1] || 0) / 60; }
  function fmt(h) { var H = Math.floor(h + 1e-6), m = Math.round((h - H) * 60); return pad(H) + ":" + pad(m); }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function strip(s) { return s.replace(/\.$/, ""); }
  function windows(d) { return REC[String(d.getDay())] || []; }
  function slotsFor(d, now) {
    var out = [], today = iso(d) === iso(now), nowH = now.getHours() + now.getMinutes() / 60;
    windows(d).forEach(function (w) {
      var a = parse(w[0]), b = parse(w[1]);
      for (var t = a; t <= b - STEP + 1e-6; t += STEP) if (!today || t > nowH + LEAD) out.push(t);
    });
    return out;
  }
  var WD = { pt: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"], en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] };
  var MO = { pt: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"], en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] };
  function dayLabel(d, long) {
    if (!long) return WD[en() ? "en" : "pt"][d.getDay()];
    return new Intl.DateTimeFormat(loc(), { weekday: "long", day: "numeric", month: "long" }).format(d);
  }

  function Widget(root) {
    var daysEl = root.querySelector("[data-days]"), slotsEl = root.querySelector("[data-slots]"), noteEl = root.querySelector("[data-note]");
    var barEl = root.querySelector("[data-bar]"), track = barEl ? barEl.parentNode : null, go = root.querySelector("[data-go]");
    var goText = root.querySelector("[data-go-text]"), mode = root.getAttribute("data-mode");
    var mark = null, days = [], sel = { d: null, t: null }, now = new Date();
    if (track) { mark = document.createElement("b"); mark.className = "mark"; track.appendChild(mark); }

    function build() {
      now = new Date(); days = [];
      var base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      for (var k = 0; k < DAYS; k++) {
        var d = new Date(base); d.setDate(base.getDate() + k);
        days.push({ date: d, slots: slotsFor(d, now) });
      }
    }
    function firstOpen() { for (var i = 0; i < days.length; i++) if (days[i].slots.length) return i; return -1; }
    function dayIdx(date) { for (var i = 0; i < days.length; i++) if (iso(days[i].date) === iso(date)) return i; return -1; }
    function defaultTime(slots) { for (var i = 0; i < slots.length; i++) if (slots[i] >= 10) return slots[i]; return slots[0]; }

    function renderDays() {
      daysEl.innerHTML = "";
      days.forEach(function (o, i) {
        var b = document.createElement("button"), isToday = i === 0, open = o.slots.length > 0;
        b.type = "button"; b.className = "book-day"; b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", sel.d && iso(sel.d) === iso(o.date) ? "true" : "false");
        b.tabIndex = b.getAttribute("aria-checked") === "true" ? 0 : -1;
        var wd = isToday ? (en() ? "Today" : "Hoje") : strip(dayLabel(o.date, false));
        var mo = MO[en() ? "en" : "pt"][o.date.getMonth()];
        b.innerHTML = "<small>" + wd + "</small><b>" + o.date.getDate() + "</b><em>" + (open ? mo : (en() ? "closed" : "fechada")) + "</em>";
        b.setAttribute("aria-label", dayLabel(o.date, true) + (open ? "" : (en() ? ", reception closed" : ", receção fechada")));
        if (!open) b.disabled = true;
        b.addEventListener("click", function () { pickDay(i); });
        b.addEventListener("keydown", function (e) {
          var dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
          if (!dir) return;
          e.preventDefault();
          for (var j = i + dir; j >= 0 && j < days.length; j += dir) if (days[j].slots.length) { pickDay(j, true); break; }
        });
        daysEl.appendChild(b);
      });
    }
    function renderSlots() {
      slotsEl.innerHTML = "";
      var i = sel.d ? dayIdx(sel.d) : -1, slots = i >= 0 ? days[i].slots : [];
      if (!slots.length) {
        var p = document.createElement("p"); p.className = "book-empty";
        p.textContent = en() ? "No times available on this day." : "Sem horas disponíveis neste dia.";
        slotsEl.appendChild(p); return;
      }
      slots.forEach(function (t, k) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "book-slot"; b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", t === sel.t ? "true" : "false");
        b.tabIndex = t === sel.t ? 0 : -1;
        b.textContent = fmt(t);
        b.addEventListener("click", function () { pickTime(t); });
        b.addEventListener("keydown", function (e) {
          var dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
          if (!dir) return;
          e.preventDefault();
          var n = slots[(k + dir + slots.length) % slots.length];
          pickTime(n, true);
        });
        slotsEl.appendChild(b);
      });
    }
    function windowText(d) {
      var w = windows(d);
      return w.map(function (x) { return (en() ? x[0] + " to " + x[1] : x[0] + " às " + x[1]); }).join(en() ? " and " : " e ");
    }
    function summary() { return sel.d && sel.t != null ? dayLabel(sel.d, true) + (en() ? " at " : ", às ") + fmt(sel.t) : ""; }
    function renderInfo() {
      var i = sel.d ? dayIdx(sel.d) : -1;
      if (track && barEl) {
        var w = i >= 0 ? windows(days[i].date) : [];
        if (w.length) {
          var a = parse(w[0][0]), b = parse(w[w.length - 1][1]);
          barEl.style.left = (a / 24 * 100).toFixed(2) + "%"; barEl.style.width = ((b - a) / 24 * 100).toFixed(2) + "%";
        } else { barEl.style.width = "0%"; }
        if (mark) { mark.style.opacity = sel.t != null ? "1" : "0"; if (sel.t != null) mark.style.left = (sel.t / 24 * 100).toFixed(2) + "%"; }
      }
      if (noteEl) {
        if (i < 0 || sel.t == null) { noteEl.textContent = en() ? "The reception is closed for the next days. Please call." : "A receção está fechada nos próximos dias. Contacte-nos por telefone."; }
        else {
          var ex = C.rececaoExemplo && C.rececaoNota ? " " + (en() ? C.rececaoNota.en : C.rececaoNota.pt) : "";
          noteEl.innerHTML = "<b>" + (en() ? "Reception open " : "Receção aberta ") + (en() ? "from " : "das ") + windowText(sel.d).replace(" e ", en() ? " and " : " e ") + "</b> · " + summary() + ". " +
            (en() ? "The gym is open 24 hours; the first workout is welcomed by the reception." : "O ginásio abre 24 horas; o primeiro treino é recebido pela receção.") + ex;
        }
      }
      if (go) {
        if (sel.d && sel.t != null) {
          go.classList.remove("is-off");
          go.setAttribute("href", "primeiro-treino.html?d=" + iso(sel.d) + "&t=" + fmt(sel.t));
          if (goText) goText.textContent = (en() ? "Continue: " : "Continuar: ") + dayLabel(sel.d, false) + " " + sel.d.getDate() + " " + MO[en() ? "en" : "pt"][sel.d.getMonth()] + " · " + fmt(sel.t);
        } else { go.classList.add("is-off"); }
      }
    }
    function emit() {
      var detail = { iso: sel.d ? iso(sel.d) : "", time: sel.t != null ? fmt(sel.t) : "", text: summary() };
      window.EVOXBOOK = { get: function () { return { date: sel.d, time: sel.t, iso: detail.iso, hhmm: detail.time }; }, text: summary };
      document.dispatchEvent(new CustomEvent("evox:book", { detail: detail }));
    }
    function pickDay(i, focus) {
      sel.d = days[i].date;
      if (sel.t == null || days[i].slots.indexOf(sel.t) < 0) sel.t = defaultTime(days[i].slots);
      renderDays(); renderSlots(); renderInfo(); emit();
      if (focus) { var b = daysEl.children[i]; if (b) b.focus(); }
    }
    function pickTime(t, focus) {
      sel.t = t; renderSlots(); renderInfo(); emit();
      if (focus) { var i = [].indexOf.call(slotsEl.children, slotsEl.querySelector('[aria-checked="true"]')); if (i >= 0) slotsEl.children[i].focus(); }
    }
    function init() {
      build();
      var i = firstOpen(), q = new URLSearchParams(location.search), qd = q.get("d"), qt = q.get("t");
      if (mode === "form" && qd && /^\d{4}-\d{2}-\d{2}$/.test(qd)) {
        for (var k = 0; k < days.length; k++) if (iso(days[k].date) === qd && days[k].slots.length) { i = k; break; }
      }
      if (i < 0) { sel = { d: null, t: null }; renderDays(); renderSlots(); renderInfo(); emit(); return; }
      sel.d = days[i].date; sel.t = defaultTime(days[i].slots);
      if (mode === "form" && qt && /^\d{2}:\d{2}$/.test(qt) && days[i].slots.indexOf(parse(qt)) >= 0) sel.t = parse(qt);
      renderDays(); renderSlots(); renderInfo(); emit();
      var b = daysEl.children[i]; if (b && b.scrollIntoView && daysEl.scrollWidth > daysEl.clientWidth) daysEl.scrollLeft = Math.max(0, b.offsetLeft - 8);
    }
    document.addEventListener("evox:lang", function () { renderDays(); renderSlots(); renderInfo(); emit(); });
    init();
  }
  widgets.forEach(Widget);
})();
