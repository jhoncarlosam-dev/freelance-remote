(function () {
  const perfil = window.PERFIL || {};
  const nombre = String(perfil.nombre || "").trim();
  const ciudad = String(perfil.ciudad || "Bogotá").trim() || "Bogotá";

  document.querySelectorAll("[data-nombre]").forEach((node) => {
    node.textContent = nombre || node.getAttribute("data-fallback") || "Edición";
  });
  document.querySelectorAll("[data-ciudad]").forEach((node) => {
    node.textContent = ciudad;
  });
  if (nombre) document.title = nombre + " · Edición de video para redes";

  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#site-nav");
  if (toggle && menu) {
    const close = () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  const bar = document.querySelector("#progreso");
  if (bar) {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = "scaleX(" + value + ")";
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  const digits = String(perfil.whatsapp || "").replace(/\D/g, "");
  const email = String(perfil.email || "").trim();
  const instagram = String(perfil.instagram || "").replace(/^@/, "").trim();
  const validWa = /^\d{8,15}$/.test(digits);
  const validMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validIg = /^[A-Za-z0-9._]{1,30}$/.test(instagram);

  const setLink = (selector, ok, href) => {
    document.querySelectorAll(selector).forEach((node) => {
      if (!ok) {
        node.hidden = true;
        return;
      }
      node.hidden = false;
      node.href = href;
    });
  };
  setLink("[data-wa-footer]", validWa, "https://wa.me/" + digits);
  setLink("[data-mail-footer]", validMail, "mailto:" + email);
  setLink("[data-ig-footer]", validIg, "https://instagram.com/" + instagram);

  const any = validWa || validMail || validIg;
  document.querySelectorAll("[data-channels]").forEach((node) => {
    node.hidden = !any;
  });
  document.querySelectorAll("[data-sin-canal]").forEach((node) => {
    node.hidden = any;
  });
})();
