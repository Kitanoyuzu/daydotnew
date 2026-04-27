import { getParentTag, getTagById } from "../store.js";
import { openModal, closeModal, toast } from "./modal.js";

function pill({ text, tint, isParent = false }) {
  const bg = isParent ? `color-mix(in srgb, ${tint} 22%, var(--card))` : `color-mix(in srgb, ${tint} 16%, var(--card))`;
  const fg = `color-mix(in srgb, ${tint} 68%, var(--text))`;
  return `<span class="dd-pill" style="background:${bg}; color:${fg};">${text}</span>`;
}

export function renderRecordList({ id, records }) {
  return `
    <div class="dd-record-list" data-dd-record-list="${id}">
      ${records.map((r) => renderRecordItem(r)).join("")}
    </div>
  `;
}

export function renderRecordItem(record) {
  const tag = record.tagId ? getTagById(record.tagId) : null;
  const parent = getParentTag(tag);
  const tint = parent?.color || "#C4A882";

  const left = tag
    ? `${pill({ text: tag.name, tint, isParent: false })}${pill({ text: parent?.name ?? "", tint, isParent: true })}`
    : `<span class="dd-pill" style="background: var(--secondary); color: var(--text-sub);">未分类</span>`;

  const note = record.note ? `<div class="dd-record-note">${record.note}</div>` : `<div class="dd-record-note dd-record-note--empty"> </div>`;

  return `
    <div class="dd-record-card" data-dd-record-card data-record-id="${record.id}">
      <div class="dd-record-row dd-record-row--top">
        <div class="dd-record-pills">${left}</div>
        <div class="dd-record-date">${record.eventDate}</div>
      </div>

      <div class="dd-record-row dd-record-row--bottom">
        ${note}
        <div class="dd-record-actions" aria-hidden="true">
          <button class="dd-icon-btn" type="button" aria-label="编辑" data-dd-modal-open="edit-record"><i data-lucide="pencil" class="w-[18px] h-[18px]"></i></button>
          <button class="dd-icon-btn" type="button" aria-label="删除" data-dd-record-action="delete"><i data-lucide="trash-2" class="w-[18px] h-[18px]"></i></button>
          <button class="dd-icon-btn" type="button" aria-label="保存" data-dd-record-action="save"><i data-lucide="check" class="w-[18px] h-[18px]"></i></button>
        </div>
      </div>
    </div>
  `;
}

export function initRecordListAll() {
  if (document.documentElement.dataset.ddRecordListDelegated === "1") return;
  document.documentElement.dataset.ddRecordListDelegated = "1";

  const cards = () => Array.from(document.querySelectorAll("[data-dd-record-card]"));
  const closeAll = () => {
    for (const c of cards()) delete c.dataset.ddActive;
  };

  // 点击卡片外部：隐藏所有操作按钮
  document.addEventListener("pointerdown", (e) => {
    const card = e.target.closest?.("[data-dd-record-card]");
    if (!card) closeAll();
  });

  // 事件委托：动态渲染的卡片也能展开操作按钮
  document.addEventListener("click", (e) => {
    const actionBtn = e.target.closest?.("[data-dd-record-action]");
    if (actionBtn) {
      e.preventDefault();
      const action = actionBtn.getAttribute("data-dd-record-action");
      const recordId = Number(actionBtn.closest?.("[data-record-id]")?.getAttribute?.("data-record-id") || "");
      if (action === "save") {
        toast("已保存");
        return;
      }
      if (action === "delete") {
        openModal(
          `
            <div class="flex items-center justify-between pb-3">
              <div class="text-[16px]" style="font-weight: 800; color: var(--text);">确认删除？</div>
              <button class="dd-icon-btn" type="button" aria-label="关闭" data-dd-modal-close><i data-lucide="x" class="w-[18px] h-[18px]"></i></button>
            </div>
            <div class="text-[13px]" style="color: var(--text-sub); padding-bottom: 14px;">删除后不可恢复。</div>
            <div class="flex items-center gap-3">
              <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--bg) 78%, var(--card)); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);" data-dd-modal-close>取消</button>
              <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, #6D4C45 76%, #2E2A28); color: var(--card); box-shadow:none;" data-dd-action="record-delete-confirm" data-dd-record-id="${Number.isFinite(recordId) ? recordId : ""}">删除</button>
            </div>
          `,
          { ariaLabel: "删除确认" },
        );
        lucide?.createIcons?.();
        return;
      }
    }

    const card = e.target.closest?.("[data-dd-record-card]");
    if (!card) return;

    // 点击按钮本身：不触发卡片展开/收起逻辑
    const action = e.target.closest?.("[data-dd-record-action],[data-dd-modal-open]");
    if (action) return;

    const isActive = card.dataset.ddActive === "1";
    closeAll();
    if (!isActive) card.dataset.ddActive = "1";
  });
}

