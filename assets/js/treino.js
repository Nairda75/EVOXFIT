/* EVOXFIT Fitness Health Club Maia — pedido de primeiro treino. Monta a mensagem e abre o WhatsApp (nada é guardado no site).
   O dia e a hora vêm do widget de marcação (agendar.js), limitado ao horário da receção. */
(function () {
  "use strict";
  var form = document.getElementById("treino-form");
  if (!form) return;
  var C = window.EVOX || {};
  var prev = form.querySelector("[data-preview]"), toast = document.querySelector("[data-toast]");

  function en() { return window.EVOXLANG === "en"; }
  function label(name) { var i = form.querySelector('input[name="' + name + '"]:checked'); return i ? i.nextElementSibling.textContent.trim() : ""; }
  function quando() { return window.EVOXBOOK && window.EVOXBOOK.text ? window.EVOXBOOK.text() : ""; }

  function message() {
    var nome = form.nome.value.trim(), tel = form.tel.value.trim(), obj = label("objetivo"), exp = label("exp");
    var L = en()
      ? { hi: "Hello, I would like to book my first workout at EVOXFIT Fitness Health Club Maia.", n: "Name", w: "When", g: "Goal", e: "Experience", p: "Phone" }
      : { hi: "Olá! Gostaria de marcar o meu primeiro treino no EVOXFIT Fitness Health Club Maia.", n: "Nome", w: "Quando", g: "Objetivo", e: "Experiência", p: "Telemóvel" };
    var lines = [L.hi, L.n + ": " + (nome || "…"), L.w + ": " + (quando() || "…")];
    if (obj) lines.push(L.g + ": " + obj);
    if (exp) lines.push(L.e + ": " + exp);
    if (tel) lines.push(L.p + ": " + tel);
    return lines.join("\n");
  }
  function update() { prev.textContent = message(); }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  document.addEventListener("evox:lang", update);
  document.addEventListener("evox:book", update);
  update();

  function say(t) {
    if (!toast) return;
    toast.textContent = t; toast.classList.add("show");
    clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove("show"); }, 3200);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!quando()) { say(en() ? "Please choose a day and a time." : "Escolha um dia e uma hora."); return; }
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
