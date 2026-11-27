(() => {
  const launcher = document.createElement("button");
  launcher.className = "gr-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Abrir asistente virtual");
  launcher.setAttribute("aria-expanded", "false");
  launcher.innerHTML = '<span aria-hidden="true">✦</span><span>¿Te ayudo?</span>';

  const panel = document.createElement("section");
  panel.className = "gr-chat-panel";
  panel.setAttribute("aria-label", "Asistente virtual de Gandhy Rivera");
  panel.hidden = true;
  panel.innerHTML = `
    <header class="gr-chat-head">
      <div class="gr-chat-avatar" aria-hidden="true">✦</div>
      <div><strong>Asistente de Gandhy</strong><span><i></i> Orientación sobre servicios y soluciones</span></div>
      <button class="gr-chat-close" type="button" aria-label="Cerrar asistente">×</button>
    </header>
    <div class="gr-chat-body" role="log" aria-live="polite" aria-relevant="additions">
      <div class="gr-chat-message gr-chat-bot">¡Hola! Soy el asistente virtual de Gandhy Rivera. Puedo orientarte sobre seguridad digital, seguimiento comercial y organización de procesos. ¿Qué necesitas resolver?</div>
      <div class="gr-chat-suggestions" aria-label="Temas frecuentes">
        <button type="button" data-prompt="Quiero conocer los servicios de seguridad digital.">Seguridad digital</button>
        <button type="button" data-prompt="Necesito organizar el seguimiento de clientes y oportunidades.">Seguimiento comercial</button>
        <button type="button" data-prompt="Quiero automatizar un proceso de mi empresa.">Automatización</button>
        <button type="button" data-prompt="Quiero hablar directamente con Gandhy.">Hablar con Gandhy</button>
      </div>
    </div>
    <nav class="gr-chat-links" aria-label="Accesos rápidos">
      <a href="/enfoque.html">Enfoque</a><a href="/herramientas.html">Panel</a><a href="/contacto.html">Contacto</a>
    </nav>
    <form class="gr-chat-form">
      <label class="gr-chat-sr" for="gr-chat-input">Escribe tu pregunta</label>
      <input id="gr-chat-input" name="message" maxlength="1200" autocomplete="off" placeholder="Escribe tu pregunta…" required>
      <button type="submit" aria-label="Enviar mensaje">Enviar</button>
    </form>
    <p class="gr-chat-footnote">Respuestas automáticas basadas en la información publicada. No compartas claves ni datos sensibles.</p>
  `;

  document.body.append(launcher, panel);

  const close = panel.querySelector(".gr-chat-close");
  const form = panel.querySelector(".gr-chat-form");
  const input = panel.querySelector("#gr-chat-input");
  const body = panel.querySelector(".gr-chat-body");
  const suggestions = panel.querySelector(".gr-chat-suggestions");
  const history = [];
  let pending = false;

  function toggle(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    launcher.innerHTML = open ? '<span aria-hidden="true">×</span><span>Cerrar</span>' : '<span aria-hidden="true">✦</span><span>¿Te ayudo?</span>';
    if (open) input.focus();
    else launcher.focus();
  }

  function addMessage(text, who) {
    const el = document.createElement("div");
    el.className = "gr-chat-message " + (who === "user" ? "gr-chat-user" : "gr-chat-bot");
    if (who === "bot") {
      const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*|mailto:[^\s)]+)\)/g;
      let cursor = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        el.append(document.createTextNode(text.slice(cursor, match.index)));
        const link = document.createElement("a");
        link.textContent = match[1];
        link.href = match[2];
        if (/^https?:/.test(link.href)) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        el.append(link);
        cursor = pattern.lastIndex;
      }
      el.append(document.createTextNode(text.slice(cursor)));
    } else {
      el.textContent = text;
    }
    body.append(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function setBusy(busy) {
    pending = busy;
    input.disabled = busy;
    form.querySelector("button").disabled = busy;
    form.querySelector("button").textContent = busy ? "…" : "Enviar";
  }

  async function send(text) {
    const message = String(text || "").trim();
    if (!message || pending) return;
    suggestions.hidden = true;
    addMessage(message, "user");
    history.push({ role: "user", content: message });
    input.value = "";
    setBusy(true);
    const waiting = addMessage("Estoy revisando la información del sitio…", "bot");
    waiting.classList.add("gr-chat-waiting");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-10) })
      });
      const data = await response.json().catch(() => ({}));
      waiting.remove();
      if (!response.ok || !data.answer) {
        addMessage(data.error || "No pude procesar la consulta. Puedes escribirnos a corporativo@securitypro.com.co.", "bot");
      } else {
        history.push({ role: "assistant", content: data.answer });
        addMessage(data.answer, "bot");
      }
    } catch {
      waiting.remove();
      addMessage("No logré conectar con el asistente. Revisa tu conexión o escríbenos a corporativo@securitypro.com.co.", "bot");
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  launcher.addEventListener("click", () => toggle(panel.hidden));
  close.addEventListener("click", () => toggle(false));
  form.addEventListener("submit", event => {
    event.preventDefault();
    send(input.value);
  });
  suggestions.addEventListener("click", event => {
    const button = event.target.closest("button[data-prompt]");
    if (button) send(button.dataset.prompt);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) toggle(false);
  });
})();
