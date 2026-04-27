import { renderRecordList } from "./recordList.js";

export function renderVaultAll() {
  return `
    <section class="flex flex-col gap-[14px]">
      <div class="flex items-center justify-between">
        <a href="#/vault" class="dd-icon-btn" aria-label="返回"><i data-lucide="chevron-left" class="w-[18px] h-[18px]"></i></a>
        <button class="dd-icon-btn" type="button" aria-label="筛选"><i data-lucide="sliders-horizontal" class="w-[18px] h-[18px]"></i></button>
      </div>

      <div class="dd-card flex items-center gap-3 px-[14px]" style="height: var(--control-h); border-radius: var(--r-pill); box-shadow: var(--shadow-card);">
        <i data-lucide="search" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>
        <input class="flex-1 bg-transparent outline-none" placeholder="搜索记录…" />
        <span class="dd-pill" style="height: 30px; background: color-mix(in srgb, var(--bg) 70%, var(--card)); border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); color: var(--text);">
          <i data-lucide="calendar" class="w-[14px] h-[14px]" style="margin-right: 6px;"></i>日期
        </span>
        <span class="dd-pill" style="height: 30px; background: color-mix(in srgb, var(--bg) 70%, var(--card)); border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); color: var(--text);">
          <i data-lucide="funnel" class="w-[14px] h-[14px]" style="margin-right: 6px;"></i>今天
        </span>
      </div>

      ${renderRecordList({
        id: "vault-all-records",
        records: [
          { id: 1004, tagId: null, eventDate: "2026-04-26", note: "" },
          { id: 1001, tagId: 12, eventDate: "2026-04-25", note: "米白长袖长裤" },
          { id: 1002, tagId: 12, eventDate: "2026-04-25", note: "米白长袖长裤" },
          { id: 1003, tagId: 11, eventDate: "2026-04-23", note: "" },
        ],
      })}
    </section>

    <div class="hidden" data-dd-template="edit-record">
      ${editModalTemplate()}
    </div>
  `;
}

function editModalTemplate() {
  return `
    <div class="flex items-center justify-between pb-3">
      <div class="text-[16px]" style="font-weight: 800; color: var(--text);">编辑记录</div>
      <button class="dd-icon-btn" type="button" aria-label="关闭" data-dd-modal-close><i data-lucide="x" class="w-[18px] h-[18px]"></i></button>
    </div>

    <div class="flex flex-col gap-[12px]">
      <div class="text-[13px]" style="color: var(--text-sub); font-weight: 700;">日期</div>
      <div class="dd-card flex items-center px-[14px]" style="height: var(--control-h); border-radius: var(--r-pill); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 66%, var(--card));">
        <i data-lucide="calendar" class="w-[18px] h-[18px]" style="color: var(--text-sub); margin-right: 10px;"></i>
        <input class="flex-1 bg-transparent outline-none" value="2026-04-25" />
      </div>

      <div class="text-[13px]" style="color: var(--text-sub); font-weight: 700;">Tag</div>
      <div class="dd-card flex items-center justify-between px-[14px]" style="height: var(--control-h); border-radius: var(--r-pill); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 66%, var(--card));">
        <div class="text-[14px]" style="color: var(--text);">换洗睡衣</div>
        <div class="flex items-center gap-3">
          <span class="dd-pill" style="background: color-mix(in srgb, #7FA7B8 18%, var(--card)); color: color-mix(in srgb, #7FA7B8 70%, var(--text));">清洁</span>
          <span class="text-[12px]" style="color: var(--text-sub);">选择</span>
        </div>
      </div>

      <div class="text-[13px]" style="color: var(--text-sub); font-weight: 700;">备注</div>
      <div class="dd-card flex items-center px-[14px]" style="height: var(--control-h); border-radius: var(--r-pill); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 66%, var(--card));">
        <input class="flex-1 bg-transparent outline-none" value="米白长袖长裤" />
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--bg) 78%, var(--card)); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);" data-dd-modal-close>取消</button>
        <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 92%, #3b332e); color: var(--card); box-shadow:none;">保存</button>
      </div>
    </div>
  `;
}

