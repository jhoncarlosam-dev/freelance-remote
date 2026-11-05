(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  const CAFE = [
    { hold: 2000, bg: "#ff3b1f", fg: "#fff8f4", brand: "Café Norte · ejemplo", chip: "Gancho · 0:00", time: "0:00", name: "Gancho", lines: ["¿Haces fila", "por un café?"] },
    { hold: 2000, bg: "#f4efe6", fg: "#1c1612", brand: "Café Norte · ejemplo", chip: "Corte · 0:02", time: "0:02", name: "Corte", lines: ["Tres minutos.", "Sin fila."] },
    { hold: 2000, bg: "#dff25a", fg: "#1a2003", brand: "Café Norte · ejemplo", chip: "Prueba · 0:04", time: "0:04", name: "Prueba", lines: ["El de la casa,", "para llevar."] },
    { hold: 2000, bg: "#171513", fg: "#f6f1e8", brand: "Café Norte · ejemplo", chip: "Pedido · 0:06", time: "0:06", name: "Pedido", lines: ["Pídelo hoy."] }
  ];

  const ANTES = [
    {
      hold: 8000,
      bg: "#7a736a",
      fg: "#f3ece3",
      brand: "El mismo aviso",
      chip: "Sin cortar · 0:00 a 0:08",
      time: "0:00",
      name: "Toma larga",
      tone: "raw",
      lines: ["Bueno, entonces les cuento que ya se puede pedir y que está disponible más o menos cuando puedan pasar, si quieren, claro."]
    }
  ];

  const DESPUES = [
    { hold: 2000, bg: "#ff3b1f", fg: "#fff8f4", brand: "El mismo aviso", chip: "Gancho · 0:00", time: "0:00", name: "Gancho", lines: ["Ya se puede", "pedir."] },
    { hold: 2000, bg: "#f4efe6", fg: "#1c1612", brand: "El mismo aviso", chip: "Dato · 0:02", time: "0:02", name: "Dato", lines: ["Esta semana."] },
    { hold: 2000, bg: "#dff25a", fg: "#1a2003", brand: "El mismo aviso", chip: "Prueba · 0:04", time: "0:04", name: "Prueba", lines: ["Quedan pocas."] },
    { hold: 2000, bg: "#171513", fg: "#f6f1e8", brand: "El mismo aviso", chip: "Pedido · 0:06", time: "0:06", name: "Pedido", lines: ["Escríbeme hoy."] }
  ];

  function boot(run) {
    try {
      run();
    } catch (error) {
      console.error(error);
    }
  }

  function createPlayer(root, scenes) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const screen = $(".screen", root);
    const brandEl = $(".shot-brand", screen);
    const linesEl = $(".shot-lines", screen);
    const chipEl = $(".shot-chip", screen);
    const track = $(".track", root);
    const playBtn = $(".play", root);
    const clock = $(".clock", root);
    const groupLabel = root.getAttribute("aria-label") || "la muestra";
    const total = scenes.reduce((sum, scene) => sum + scene.hold, 0);
    const elapsedBefore = [];
    let acc = 0;
    scenes.forEach((scene) => {
      elapsedBefore.push(acc);
      acc += scene.hold;
    });

    let index = 0;
    let playing = false;
    let userPaused = false;
    let timer = 0;
    let frameToken = 0;
    const head = document.createElement("span");
    head.className = "playhead";
    head.setAttribute("aria-hidden", "true");

    track.replaceChildren();
    scenes.forEach((scene, sceneIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "clip";
      button.style.flexGrow = String(scene.hold);
      button.style.background = scene.bg;
      button.style.color = scene.fg;
      button.textContent = scene.name;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => show(sceneIndex, true));
      track.appendChild(button);
    });
    track.appendChild(head);

    function placeHead() {
      const token = ++frameToken;
      const start = (elapsedBefore[index] / total) * 100;
      const end = ((elapsedBefore[index] + scenes[index].hold) / total) * 100;
      head.style.transition = "none";
      head.style.left = start + "%";
      if (reduced || !playing) return;
      window.requestAnimationFrame(() => {
        if (token !== frameToken) return;
        window.requestAnimationFrame(() => {
          if (token !== frameToken) return;
          head.style.transition = "left " + scenes[index].hold + "ms linear";
          head.style.left = end + "%";
        });
      });
    }

    function paint() {
      const scene = scenes[index];
      screen.style.background = scene.bg;
      screen.style.color = scene.fg;
      screen.classList.toggle("is-raw", scene.tone === "raw");
      brandEl.textContent = scene.brand;
      chipEl.textContent = scene.chip;
      linesEl.replaceChildren();
      scene.lines.forEach((line) => {
        const span = document.createElement("span");
        span.className = "shot-line";
        span.textContent = line;
        linesEl.appendChild(span);
      });
      if (clock) clock.textContent = scene.time + "  " + scene.name;
      track.querySelectorAll(".clip").forEach((button, clipIndex) => {
        button.setAttribute("aria-pressed", clipIndex === index ? "true" : "false");
      });
      if (root.id === "hero-player") {
        document.querySelectorAll("[data-jump]").forEach((button) => {
          button.setAttribute("aria-pressed", Number(button.getAttribute("data-jump")) === index ? "true" : "false");
        });
      }
      placeHead();
    }

    function schedule() {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        show((index + 1) % scenes.length, false);
      }, scenes[index].hold);
    }

    function show(next, fromUser) {
      window.clearTimeout(timer);
      index = (next + scenes.length) % scenes.length;
      if (fromUser) {
        userPaused = true;
        playing = false;
        setPlayState(false);
      }
      paint();
      if (playing) schedule();
    }

    function setPlayState(isPlaying) {
      playBtn.textContent = isPlaying ? "Pausar" : "Reproducir";
      playBtn.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      playBtn.setAttribute("aria-label", (isPlaying ? "Pausar " : "Reproducir ") + groupLabel);
    }

    function play(fromUser) {
      if (fromUser) userPaused = false;
      if (!fromUser && userPaused) return;
      if (playing) return;
      playing = true;
      setPlayState(true);
      paint();
      schedule();
    }

    function halt() {
      playing = false;
      window.clearTimeout(timer);
      setPlayState(false);
      placeHead();
    }

    playBtn.addEventListener("click", () => {
      if (playing) {
        userPaused = true;
        halt();
      } else {
        play(true);
      }
    });

    root.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      show(index + delta, true);
    });

    if (!reduced) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) play(false);
          else if (playing) halt();
        });
      }, { threshold: 0.45 });
      observer.observe(root);
    }

    setPlayState(false);
    paint();
    return { show: (next) => show(next, true) };
  }

  boot(() => {
    const hero = $("#hero-player");
    const antes = $("#antes-player");
    const despues = $("#despues-player");
    const heroApi = hero ? createPlayer(hero, CAFE) : null;
    if (antes) createPlayer(antes, ANTES);
    if (despues) createPlayer(despues, DESPUES);
    if (!heroApi) return;
    document.querySelectorAll("[data-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = Number(button.getAttribute("data-jump"));
        heroApi.show(next);
        const phone = $(".phone", hero);
        const rect = phone.getBoundingClientRect();
        const visible = rect.top >= 64 && rect.bottom <= window.innerHeight - 8;
        if (!visible) phone.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  });

  function safeHttp(value) {
    try {
      const url = new URL(String(value || "").trim());
      if (url.protocol === "https:" || url.protocol === "http:") return url.href;
    } catch (error) {
      return "";
    }
    return "";
  }

  boot(() => {
    const videos = ((window.PERFIL || {}).videos || []).filter((item) => item && safeHttp(item.url).startsWith("https:"));
    const section = $("#trabajos");
    const list = $("#trabajos-lista");
    if (!section || !list || videos.length === 0) return;
    videos.forEach((video) => {
      const card = document.createElement("article");
      card.className = "work-card";
      const title = document.createElement("h3");
      title.textContent = String(video.titulo || "Video").slice(0, 140);
      card.appendChild(title);
      if (video.nota) {
        const note = document.createElement("p");
        note.textContent = String(video.nota).slice(0, 400);
        card.appendChild(note);
      }
      const url = safeHttp(video.url);
      const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
      if (youtube) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-red";
        button.textContent = "Reproducir video";
        const holder = document.createElement("div");
        holder.className = "embed";
        button.addEventListener("click", () => {
          const frame = document.createElement("iframe");
          frame.src = "https://www.youtube-nocookie.com/embed/" + youtube[1];
          frame.title = title.textContent;
          frame.allowFullscreen = true;
          frame.referrerPolicy = "strict-origin-when-cross-origin";
          frame.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
          holder.replaceChildren(frame);
          button.remove();
        });
        card.append(button, holder);
      } else if (/\.mp4(?:$|\?)/i.test(url)) {
        const player = document.createElement("video");
        player.controls = true;
        player.playsInline = true;
        player.preload = "metadata";
        player.src = url;
        card.appendChild(player);
      } else {
        const link = document.createElement("a");
        link.className = "btn btn-ghost";
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Abrir el video";
        card.appendChild(link);
      }
      list.appendChild(card);
    });
    section.hidden = false;
  });

  boot(() => {
    const form = $("#brief");
    if (!form) return;
    const preview = $("#preview");
    const status = $("#copy-status");
    const select = $("#pieza");
    const wa = $("#wa-link");
    const mail = $("#mail-link");
    const perfil = window.PERFIL || {};
    const digits = String(perfil.whatsapp || "").replace(/\D/g, "");
    const validWa = /^\d{8,15}$/.test(digits);
    const email = String(perfil.email || "").trim();
    const validMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const field = (name) => String((form.elements[name] && form.elements[name].value) || "").trim();

    function message() {
      const nombre = field("nombre");
      const pieza = field("pieza");
      const fecha = field("fecha");
      const tema = field("tema");
      const link = safeHttp(field("link"));
      return [
        "Hola.",
        nombre ? "Soy " + nombre + "." : "Vi el portafolio de edición.",
        "Quiero " + pieza + ".",
        "Lo necesito para: " + (fecha || "una fecha por acordar") + ".",
        "Trata de: " + (tema || "te lo cuento en el siguiente mensaje") + ".",
        "Material: " + (link || "te lo paso en este chat") + "."
      ].join("\n");
    }

    function refresh() {
      const text = message();
      preview.textContent = text;
      if (wa) {
        wa.hidden = !validWa;
        if (validWa) wa.href = "https://wa.me/" + digits + "?text=" + encodeURIComponent(text);
      }
      if (mail) {
        mail.hidden = !validMail;
        if (validMail) {
          mail.href = "mailto:" + email + "?subject=" + encodeURIComponent("Video para redes") + "&body=" + encodeURIComponent(text);
        }
      }
      return text;
    }

    async function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    }

    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);
    $("#copiar").addEventListener("click", async () => {
      if (!field("nombre")) {
        status.textContent = "Escribe tu nombre para que el mensaje salga completo.";
        form.elements.nombre.focus();
        return;
      }
      const text = refresh();
      try {
        const copied = await copyText(text);
        status.textContent = copied
          ? "Mensaje copiado. Pégalo en el chat donde recibiste este enlace."
          : "Selecciona el recuadro y cópialo.";
      } catch (error) {
        status.textContent = "Selecciona el recuadro y cópialo.";
      }
    });

    document.querySelectorAll("[data-pieza]").forEach((button) => {
      button.addEventListener("click", () => {
        select.value = button.getAttribute("data-pieza");
        refresh();
        const destino = $("#escribir");
        if (destino) destino.scrollIntoView({ behavior: "smooth", block: "start" });
        window.setTimeout(() => form.elements.nombre.focus(), 350);
      });
    });

    refresh();
  });
})();
