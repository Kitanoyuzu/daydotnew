import { getParentTag, mockTags } from "../mockData.js";

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
  const tag = record.tagId ? mockTags.find((t) => t.id === record.tagId) : null;
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
  const cards = () => Array.from(document.querySelectorAll("[data-dd-record-card]"));

  const closeAll = () => {
    for (const c of cards()) delete c.dataset.ddActive;
  };

  document.addEventListener("pointerdown", (e) => {
    const card = e.target.closest?.("[data-dd-record-card]");
    if (!card) closeAll();
  });

  document.querySelectorAll("[data-dd-record-card]").forEach((card) => {
    if (card.dataset.ddBound === "1") return;
    card.dataset.ddBound = "1";
    card.addEventListener("click", (e) => {
      const action = e.target.closest?.("[data-dd-record-action],[data-dd-modal-open]");
      if (action) return; // actions click handled elsewhere (modal) or noop

      const isActive = card.dataset.ddActive === "1";
      closeAll();
      if (!isActive) card.dataset.ddActive = "1";
    });
  });
}

