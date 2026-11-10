/* EVOXFIT Maia — pedido de primeiro treino. Monta a mensagem e abre o WhatsApp (nada é guardado no site). */
(function () {
  "use strict";
  var form = document.getElementById("treino-form");
  if (!form) return;
  var C = window.EVOX || {};
  var hora = form.querySelector("#hora"), dataIn = form.querySelector("#data");
  var outH = form.querySelector("[data-hora-out]"), hint = form.querySelector("[data-hora-hint]"), prev = form.querySelector("[data-preview]");
  var toast = document.querySelector("[data-toast]");

  function en() { return window.EVOXLANG === "en"; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtHora(v) { var h = Math.floor(v), m = Math.round((v - h) * 60); return pad(h) + ":" + pad(m); }
  function bucket(v) {
    var pt = ["Madrugada", "Manhã cedo", "Manhã", "Hora de almoço", "Tarde", "Fim de tarde", "Noite"];
    var us = ["Small hours", "Early morning", "Morning", "Lunchtime", "Afternoon", "Evening", "Night"];
    var i = v < 5 ? 0 : v < 8 ? 1 : v < 12 ? 2 : v < 14 ? 3 : v < 18 ? 4 : v < 21 ? 5 : 6;
    return (en() ? us : pt)[i];
  }
  function label(name) { var i = form.querySelector('input[name="' + name + '"]:checked'); return i ? i.nextElementSibling.textContent.trim() : ""; }
  function checked(name) { var i = form.querySelector('input[name="' + name + '"]:checked'); return i ? i.value : ""; }

  var d = new Date(); dataIn.min = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());

  function quando() {
    var h = fmtHora(+hora.value), dia = label("dia");
    if (checked("dia") === "outro" && dataIn.value) {
      var p = dataIn.value.split("-"); dia = p[2] + "/" + p[1] + "/" + p[0];
    }
    return en() ? dia + ", at " + h : dia + ", às " + h;
  }
  function message() {
    var nome = form.nome.value.trim(), tel = form.tel.value.trim(), obj = label("objetivo"), exp = label("exp");
    var L = en()
      ? { hi: "Hello! I'd like to book my first workout at EVOXFIT Maia.", n: "Name", w: "When", g: "Goal", e: "Experience", p: "Phone" }
      : { hi: "Olá! Quero marcar o meu primeiro treino no EVOXFIT Maia.", n: "Nome", w: "Quando", g: "Objetivo", e: "Experiência", p: "Telemóvel" };
    var lines = [L.hi, L.n + ": " + (nome || "…"), L.w + ": " + quando()];
    if (obj) lines.push(L.g + ": " + obj);
    if (exp) lines.push(L.e + ": " + exp);
    if (tel) lines.push(L.p + ": " + tel);
    return lines.join("\n");
  }
  function update() {
    var v = +hora.value;
    hora.style.setProperty("--fill", (v / 23.5 * 100).toFixed(1) + "%");
    outH.textContent = fmtHora(v); hint.textContent = bucket(v);
    dataIn.style.display = checked("dia") === "outro" ? "" : "none";
    prev.textContent = message();
  }
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  document.addEventListener("evox:lang", update);
  update();

  function say(t) {
    if (!toast) return;
    toast.textContent = t; toast.classList.add("show");
    clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove("show"); }, 3200);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var field = form.querySelector("#f-nome");
    if (!form.nome.value.trim()) { field.classList.add("bad"); form.nome.focus(); return; }
    field.classList.remove("bad");
    var url = "https://wa.me/" + (C.wa || "351961382108") + "?text=" + encodeURIComponent(message());
    say(en() ? "Opening WhatsApp…" : "A abrir o WhatsApp…");
    var w = window.open(url, "_blank", "noopener");
    if (!w) location.href = url;
  });
  form.nome.addEventListener("input", function () { form.querySelector("#f-nome").classList.remove("bad"); });
})();
