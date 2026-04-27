import { createRecord, deleteRecord, getRecordById, getTagById, updateRecord } from "../store.js";

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

export function openModal(html, { ariaLabel = "弹窗", variant = "float" } = {}) {
  const portal = ensurePortal();
  if (!portal) return;

  const overlay = portal.querySelector("[data-dd-overlay]");
  const slot = portal.querySelector("[data-dd-modal-slot]");
  if (!overlay || !slot) return;

  if (variant === "drawerLeft") {
    slot.innerHTML = `
      <aside class="dd-drawer" role="dialog" aria-label="${ariaLabel}">
        ${html}
      </aside>
    `;
  } else {
    slot.innerHTML = `
      <div class="dd-float" role="dialog" aria-label="${ariaLabel}" style="top: 18svh; padding: 18px;">
        ${html}
      </div>
    `;
  }

  requestAnimationFrame(() => {
    overlay.classList.add("is-open");
    const drawer = slot.querySelector(".dd-drawer");
    if (drawer) drawer.classList.add("is-in");
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

  const latest = (selector) => {
    const nodes = Array.from(document.querySelectorAll(selector));
    return nodes.length ? nodes[nodes.length - 1] : null;
  };

  const getPortal = () => document.getElementById("portal");

  const syncEditModalFromRecord = (recordId) => {
    const r = getRecordById(recordId);
    if (!r) return;

    const dateInput = latest('[data-dd-cal-input="modal-edit-date"]');
    const tagRoot = latest('[data-dd-combo-root="modal-edit-tag"]');
    const tagInput = latest('[data-dd-combo-input="modal-edit-tag"]');
    const noteInput = latest('[data-dd-input="modal-edit-note"]');

    if (dateInput) dateInput.value = r.eventDate || "";
    if (noteInput) noteInput.value = r.note || "";

    if (tagRoot) {
      if (r.tagId != null) tagRoot.dataset.ddValue = String(r.tagId);
      else delete tagRoot.dataset.ddValue;
    }
    if (tagInput) {
      const t = r.tagId != null ? getTagById(r.tagId) : null;
      tagInput.value = t?.name || "";
    }
  };

  document.addEventListener("click", (e) => {
    const treePick = e.target.closest?.("[data-dd-tag-tree-value]");
    if (treePick) {
      e.preventDefault();
      const v = String(treePick.getAttribute("data-dd-tag-tree-value") || "").trim();
      const hidden = latest("[data-dd-vaultall-tagfilter]");
      if (hidden) hidden.value = v;
      document.dispatchEvent(new CustomEvent("dd:vaultallFilterChanged"));
      closeModal();
      return;
    }

    const action = e.target.closest?.("[data-dd-action]");
    if (action) {
      const type = action.getAttribute("data-dd-action");
      if (type === "new-record-save") {
        e.preventDefault();
        // modal 新增记录
        const tagRoot = latest('[data-dd-combo-root="modal-new-tag"]');
        const dateInput = latest('[data-dd-cal-input="modal-new-date"]');
        const noteInput = latest('[data-dd-modal-slot] input[placeholder="写点什么…"]');

        const tagIdRaw = String(tagRoot?.dataset?.ddValue || "").trim();
        const tagId = tagIdRaw ? Number(tagIdRaw) : null;
        const eventDate = String(dateInput?.value || "").trim();
        const note = String(noteInput?.value || "");

        const r = createRecord({ tagId: Number.isFinite(tagId) ? tagId : null, eventDate, note });
        if (!r.ok) return toast(r.error || "保存失败");

        toast("已保存");
        closeModal();
        return;
      }

      if (type === "edit-record-save") {
        e.preventDefault();
        const portal = getPortal();
        const recordId = Number(portal?.dataset?.ddEditingRecordId || "");
        if (!Number.isFinite(recordId)) return toast("记录无效");

        const tagRoot = latest('[data-dd-combo-root="modal-edit-tag"]');
        const dateInput = latest('[data-dd-cal-input="modal-edit-date"]');
        const noteInput = latest('[data-dd-input="modal-edit-note"]');

        const tagIdRaw = String(tagRoot?.dataset?.ddValue || "").trim();
        const tagId = tagIdRaw ? Number(tagIdRaw) : null;
        const eventDate = String(dateInput?.value || "").trim();
        const note = String(noteInput?.value || "");

        const r = updateRecord({ id: recordId, tagId: Number.isFinite(tagId) ? tagId : null, eventDate, note });
        if (!r.ok) return toast(r.error || "保存失败");
        toast("已保存");
        closeModal();
        return;
      }

      if (type === "record-delete-confirm") {
        e.preventDefault();
        const recordId = Number(action.getAttribute("data-dd-record-id") || "");
        const r = deleteRecord(recordId);
        if (!r.ok) return toast(r.error || "删除失败");
        toast("已删除");
        closeModal();
        return;
      }

      if (type === "page-new-save") {
        e.preventDefault();
        // 录入页在 DOM 内可能同时存在模板/历史节点，统一取“最后一个”
        const tagRoot = latest('[data-dd-combo-root="new-tag"]');
        const tagInput = latest('[data-dd-combo-input="new-tag"]');
        const dateInput = latest('[data-dd-cal-input="new-date"]');
        const noteInput = latest('[data-dd-input="new-note"]');

        const tagIdRaw = String(tagRoot?.dataset?.ddValue || "").trim();
        const tagId = tagIdRaw ? Number(tagIdRaw) : null;
        const eventDate = String(dateInput?.value || "").trim();
        const note = String(noteInput?.value || "");

        const r = createRecord({ tagId: Number.isFinite(tagId) ? tagId : null, eventDate, note });
        if (!r.ok) return toast(r.error || "保存失败");

        toast("已记录");

        // 清空（PRD：保存后清空 tag 与备注；日期保留为当前）
        if (tagInput) tagInput.value = "";
        if (tagRoot) delete tagRoot.dataset.ddValue;
        if (noteInput) noteInput.value = "";
        return;
      }

      if (type === "vaultall-filter-clear") {
        e.preventDefault();
        // 清除 vault/all 的筛选状态（关键词/日期/标签）
        const q = latest("[data-dd-vaultall-q]");
        if (q) q.value = "";

        const date = latest('[data-dd-cal-input="vaultall-datefilter"]');
        if (date) date.value = "";
        const dateLabel = latest('[data-dd-cal-trigger="vaultall-datefilter"]')?.querySelector?.("[data-dd-cal-display-text]");
        if (dateLabel) dateLabel.textContent = "日期";

        const tagHidden = latest("[data-dd-vaultall-tagfilter]");
        if (tagHidden) tagHidden.value = "";

        // 同步弹窗内 combobox（如果存在）
        const tagRoot = latest('[data-dd-combo-root="vaultall-tag-any"]');
        const tagInput = latest('[data-dd-combo-input="vaultall-tag-any"]');
        if (tagRoot) delete tagRoot.dataset.ddValue;
        if (tagInput) tagInput.value = "";

        document.dispatchEvent(new CustomEvent("dd:vaultallFilterChanged"));
        toast("已清除");
        return;
      }

      if (type === "vaultall-filter-close") {
        e.preventDefault();
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

      // 编辑记录：记住 recordId，并在打开后把当前值同步进弹窗
      if (target === "edit-record") {
        const recordId = Number(openBtn.closest?.("[data-record-id]")?.getAttribute?.("data-record-id") || "");
        const portal = getPortal();
        if (portal) portal.dataset.ddEditingRecordId = Number.isFinite(recordId) ? String(recordId) : "";
      }

      const variant = target === "vaultall-filter" ? "drawerLeft" : "float";
      openModal(template.innerHTML, { ariaLabel: openBtn.getAttribute("aria-label") || "弹窗", variant });
      lucide?.createIcons?.();

      if (target === "new-record") {
        // 从不同入口打开：尽量预填 tag / date（不改变 UI，仅写默认值）
        const tagRoot = latest('[data-dd-combo-root="modal-new-tag"]');
        const tagInput = latest('[data-dd-combo-input="modal-new-tag"]');
        const dateInput = latest('[data-dd-cal-input="modal-new-date"]');

        const raw = String(openBtn.getAttribute("data-dd-new-tag-id") || openBtn.dataset.ddNewTagId || "").trim();
        const tagId = raw ? Number(raw) : null;

        if (tagRoot) {
          if (tagId != null && Number.isFinite(tagId)) tagRoot.dataset.ddValue = String(tagId);
          else delete tagRoot.dataset.ddValue;
        }
        if (tagInput) {
          const t = tagId != null && Number.isFinite(tagId) ? getTagById(tagId) : null;
          tagInput.value = t?.name || "";
        }

        const iso = String(openBtn.dataset.ddNewDateIso || "").trim();
        if (dateInput && iso) dateInput.value = iso;
      }

      if (target === "vaultall-filter") {
        // 打开筛选抽屉：把当前筛选状态同步进抽屉（高亮 + 搜索框清空）
        const tagHidden = latest("[data-dd-vaultall-tagfilter]");
        const tagValue = String(tagHidden?.value || "").trim();
        const q = latest("[data-dd-tag-tree-q]");
        if (q) q.value = "";

        // 高亮选中项
        const items = Array.from(document.querySelectorAll("[data-dd-tag-tree-value]"));
        for (const el of items) {
          const v = String(el.getAttribute("data-dd-tag-tree-value") || "");
          el.classList.toggle("is-active", (tagValue ? v === tagValue : v === ""));
        }
      }

      if (target === "edit-record") {
        const portal = getPortal();
        const recordId = Number(portal?.dataset?.ddEditingRecordId || "");
        if (Number.isFinite(recordId)) syncEditModalFromRecord(recordId);
      }
      return;
    }

    const closeBtn = e.target.closest?.("[data-dd-modal-close]");
    if (closeBtn) {
      e.preventDefault();
      closeModal();
    }
  });

  document.addEventListener("input", (e) => {
    const q = e.target?.closest?.("[data-dd-tag-tree-q]");
    if (!q) return;
    const query = String(q.value || "").trim().toLowerCase();
    const items = Array.from(document.querySelectorAll("[data-dd-tag-tree-value]"));
    if (!query) {
      for (const el of items) el.classList.remove("hidden");
      return;
    }
    for (const el of items) {
      const label = String(el.textContent || "").trim().toLowerCase();
      el.classList.toggle("hidden", !label.includes(query));
    }
  });
}

