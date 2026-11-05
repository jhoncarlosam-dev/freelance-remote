(function () {
  const perfil = window.PERFIL || {};
  const form = document.querySelector("#generador");
  if (!form) return;

  const nombre = form.elements.nombre;
  const persona = form.elements.persona;
  const donde = form.elements.donde;
  const gusto = form.elements.gusto;
  const enlace = form.elements.enlace;
  const salida = document.querySelector("#mensaje");
  const estado = document.querySelector("#mensaje-estado");
  const cuenta = document.querySelector("#mensaje-cuenta");
  const avisoEnlace = document.querySelector("#aviso-enlace");

  if (perfil.nombre && !nombre.value) nombre.value = String(perfil.nombre).trim();

  function enlacePublico() {
    const configured = String(perfil.portafolioUrl || "").trim();
    if (configured) {
      try {
        const url = new URL(configured);
        if (url.protocol === "https:" || url.protocol === "http:") return url.href;
      } catch (error) {
        return "";
      }
    }
    const host = location.hostname;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return new URL("./", location.href).href;
    }
    return "";
  }

  const publico = enlacePublico();
  if (publico) enlace.value = publico;
  if (avisoEnlace) avisoEnlace.hidden = Boolean(enlace.value.trim());

  function lista(items) {
    if (items.length <= 1) return items[0] || "";
    if (items.length === 2) return items[0] + " y " + items[1];
    return items.slice(0, -1).join(", ") + " y " + items[items.length - 1];
  }

  function redactar() {
    const ofertas = Array.from(form.querySelectorAll('input[name="oferta"]:checked')).map((item) => item.value);
    const link = enlace.value.trim() || "[pega aquí el enlace del portafolio]";
    const firma = (nombre.value.trim() || "tu nombre") + (perfil.ciudad ? "\n" + String(perfil.ciudad).trim() : "");
    return [
      "Hola " + (persona.value.trim() || "[nombre]") + ". Soy " + (nombre.value.trim() || "[tu nombre]") + ". Edito videos cortos para redes.",
      "",
      "Vi tu " + (donde.value.trim() || "contenido") + " y me quedé con esto: " + (gusto.value.trim() || "[qué te gustó, en concreto]") + ".",
      "",
      "Ese contenido puede llegar más lejos con un corte más claro. Te puedo ayudar con " + (lista(ofertas) || "[una mejora concreta]") + ".",
      "",
      "Te dejo el portafolio, con ejemplos de estilo, el proceso y las tarifas:",
      link,
      "",
      "Si ahora no lo necesitas, aquí quedo por si más adelante quieres publicar con otra edición.",
      "",
      "Un saludo,",
      firma
    ].join("\n");
  }

  function pintar() {
    const texto = redactar();
    salida.textContent = texto;
    if (cuenta) cuenta.textContent = texto.length + " caracteres";
    return texto;
  }

  async function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }

  form.addEventListener("input", pintar);
  form.addEventListener("change", pintar);
  document.querySelector("#copiar-mensaje").addEventListener("click", async () => {
    if (!persona.value.trim() || !gusto.value.trim()) {
      estado.textContent = "Escribe el nombre y qué te gustó, en concreto. Un mensaje genérico se pierde entre los demás.";
      (persona.value.trim() ? gusto : persona).focus();
      return;
    }
    if (!form.querySelector('input[name="oferta"]:checked')) {
      estado.textContent = "Elige al menos una ayuda concreta.";
      return;
    }
    try {
      const ok = await copiar(pintar());
      estado.textContent = ok
        ? "Mensaje copiado. Léelo una vez antes de enviarlo: tú conoces a esa persona."
        : "Selecciona el mensaje y cópialo.";
    } catch (error) {
      estado.textContent = "Selecciona el mensaje y cópialo.";
    }
  });
  pintar();

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const node = document.querySelector(button.getAttribute("data-copy"));
      if (!node) return;
      try {
        const ok = await copiar(node.innerText.trim());
        button.textContent = ok ? "Copiado" : "Selecciona el texto";
      } catch (error) {
        button.textContent = "Selecciona el texto";
      }
      window.setTimeout(() => {
        button.textContent = "Copiar texto";
      }, 1800);
    });
  });
})();
