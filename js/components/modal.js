function ensurePortal() {
  const portal = document.getElementById("portal");
  if (!portal) return null;
  portal.className = "dd-portal";
  if (!portal.querySelector("[data-dd-overlay]")) {
    portal.innerHTML = `
      <div class="dd-overlay" data-dd-overlay></div>
      <div data-dd-modal-slot></div>
      <div class="dd-toast-wrap" data-dd-toast-wrap aria-live="polite" aria-atomic="true"></div>
    `;
  }
  return portal;
}

export function openModal(html, { ariaLabel = "弹窗" } = {}) {
  const portal = ensurePortal();
  if (!portal) return;

  const overlay = portal.querySelector("[data-dd-overlay]");
  const slot = portal.querySelector("[data-dd-modal-slot]");
  if (!overlay || !slot) return;

  slot.innerHTML = `
    <div class="dd-float" role="dialog" aria-label="${ariaLabel}" style="top: 18svh; padding: 18px;">
      ${html}
    </div>
  `;

  requestAnimationFrame(() => {
    overlay.classList.add("is-open");
  });

  const close = () => closeModal();
  overlay.addEventListener("click", close, { once: true });

  document.dispatchEvent(new CustomEvent("dd:modalOpened"));
}

export function closeModal() {
  const portal = ensurePortal();
  if (!portal) return;
  const overlay = portal.querySelector("[data-dd-overlay]");
  const slot = portal.querySelector("[data-dd-modal-slot]");
  if (!overlay || !slot) return;

  overlay.classList.remove("is-open");
  slot.innerHTML = "";
}

export function toast(message) {
  const portal = ensurePortal();
  if (!portal) return;
  const wrap = portal.querySelector("[data-dd-toast-wrap]");
  if (!wrap) return;

  const id = `t_${Math.random().toString(16).slice(2)}`;
  const el = document.createElement("div");
  el.className = "dd-toast";
  el.dataset.ddToast = id;
  el.textContent = message;
  wrap.appendChild(el);

  requestAnimationFrame(() => el.classList.add("is-in"));
  setTimeout(() => {
    el.classList.remove("is-in");
    setTimeout(() => el.remove(), 220);
  }, 1400);
}

export function initModalAll() {
  ensurePortal();
  if (document.documentElement.dataset.ddModalDelegated === "1") return;
  document.documentElement.dataset.ddModalDelegated = "1";

  document.addEventListener("click", (e) => {
    const action = e.target.closest?.("[data-dd-action]");
    if (action) {
      const type = action.getAttribute("data-dd-action");
      if (type === "new-record-save") {
        e.preventDefault();
        toast("已保存（原型）");
        closeModal();
        return;
      }
    }

    const openBtn = e.target.closest?.("[data-dd-modal-open]");
    if (openBtn) {
      e.preventDefault();
      const target = openBtn.getAttribute("data-dd-modal-open");
      const nodes = target ? Array.from(document.querySelectorAll(`[data-dd-template="${target}"]`)) : [];
      const template = nodes.length ? nodes[nodes.length - 1] : null; // 优先使用全局模板（最后注入）
      if (!template) {
        toast("原型未接入：弹窗模板缺失");
        return;
      }
      openModal(template.innerHTML, { ariaLabel: openBtn.getAttribute("aria-label") || "弹窗" });
      lucide?.createIcons?.();
      return;
    }

    const closeBtn = e.target.closest?.("[data-dd-modal-close]");
    if (closeBtn) {
      e.preventDefault();
      closeModal();
    }
  });
}

