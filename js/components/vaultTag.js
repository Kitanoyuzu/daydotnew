import { daysSince, getParentTag, getTagById, listRecords } from "../store.js";
import { renderRecordList } from "./recordList.js";

export function renderVaultTag({ id }) {
  const tagId = Number(id || "");
  const tag = Number.isFinite(tagId) ? getTagById(tagId) : null;
  const parentTag = getParentTag(tag);
  const tint = parentTag?.color || "#C4A882";
  const title = tag?.name || "标签";

  const records = listRecords()
    .filter((r) => String(r.tagId) === String(tagId))
    .slice()
    .sort((a, b) => {
      if (b.eventDate !== a.eventDate) return b.eventDate > a.eventDate ? 1 : -1;
      const ua = a.updatedAt || a.createdAt || "";
      const ub = b.updatedAt || b.createdAt || "";
      if (ub !== ua) return ub > ua ? 1 : -1;
      return b.id - a.id;
    });

  const lastISO = records[0]?.eventDate || "";
  const ds = daysSince(lastISO);

  return `
    <section class="flex flex-col gap-[14px]">
      <div class="flex items-center justify-between">
        <a href="#/vault" class="dd-icon-btn" aria-label="返回"><i data-lucide="chevron-left" class="w-[18px] h-[18px]"></i></a>
        <span class="dd-pill" style="background: color-mix(in srgb, ${tint} 18%, var(--card)); color: color-mix(in srgb, ${tint} 68%, var(--text));">${parentTag?.name ?? ""}</span>
      </div>

      <div class="dd-card" style="padding: 18px; background: color-mix(in srgb, var(--bg) 70%, var(--card));">
        <div class="text-center" style="color: color-mix(in srgb, var(--accent) 88%, var(--text));">
          <span class="text-[44px]" style="font-weight: 300; letter-spacing: -0.04em;">${ds}</span>
          <span class="text-[16px]" style="color: var(--text-sub); margin-left: 6px;">天</span>
        </div>
        <div class="pt-1 text-center text-[13px]" style="color: var(--text-sub);">距上次 · ${title}</div>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-[15px]" style="font-weight: 800; color: var(--text);">历史记录</div>
        <button class="dd-icon-btn" type="button" aria-label="新增记录" data-dd-modal-open="new-record" data-dd-new-tag-id="${Number.isFinite(tagId) ? tagId : ""}"><i data-lucide="plus" class="w-[18px] h-[18px]"></i></button>
      </div>

      ${renderRecordList({
        id: "vault-tag-records",
        records,
      })}
    </section>
  `;
}
