import { daysSince } from "../mockData.js";

export function renderVaultTag({ id }) {
  const tagId = Number(id || 12);
  const isWash = tagId === 12;
  const title = isWash ? "换洗睡衣" : "月经";
  const parent = isWash ? "清洁" : "健康";
  const tint = isWash ? "#7FA7B8" : "#B48AA8";
  const d = isWash ? "2026-04-25" : "2026-04-23";
  const ds = daysSince(d);

  return `
    <section class="flex flex-col gap-[14px]">
      <div class="flex items-center justify-between">
        <a href="#/vault" class="dd-icon-btn" aria-label="返回"><i data-lucide="chevron-left" class="w-[18px] h-[18px]"></i></a>
        <span class="dd-pill" style="background: color-mix(in srgb, ${tint} 18%, var(--card)); color: color-mix(in srgb, ${tint} 68%, var(--text));">${parent}</span>
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
        <button class="dd-icon-btn" type="button" aria-label="新增"><i data-lucide="plus" class="w-[18px] h-[18px]"></i></button>
      </div>

      <div class="relative pl-[16px] flex flex-col gap-4">
        <div style="position:absolute; left: 6px; top: 2px; bottom: 2px; width: 2px; background: color-mix(in srgb, var(--border) 70%, transparent); border-radius: 99px;"></div>

        ${timelineItem({ title, date: "2026-04-25", note: "米白长袖长裤", tint })}
        ${timelineItem({ title, date: "2026-04-25", note: "米白长袖长裤", tint })}
      </div>
    </section>

    <div class="hidden" data-dd-template="edit-record">
      ${editModalTemplate()}
    </div>
  `;
}

function timelineItem({ title, date, note, tint }) {
  const pBg = `color-mix(in srgb, ${tint} 16%, var(--card))`;
  const pText = `color-mix(in srgb, ${tint} 68%, var(--text))`;
  return `
    <div class="relative">
      <div style="position:absolute; left: -14px; top: 14px; width: 10px; height: 10px; border-radius: 999px; background: var(--bg); border: 2px solid color-mix(in srgb, var(--border) 80%, transparent);"></div>

      <div class="dd-card" style="padding: 14px 14px 12px; background: color-mix(in srgb, var(--bg) 70%, var(--card));">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <span class="dd-pill" style="background: ${pBg}; color: ${pText};">${title}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-[12px]" style="color: var(--text-sub);">${date}</div>
            <button class="dd-icon-btn" type="button" aria-label="编辑" data-dd-modal-open="edit-record"><i data-lucide="pencil" class="w-[18px] h-[18px]"></i></button>
            <button class="dd-icon-btn" type="button" aria-label="删除"><i data-lucide="trash-2" class="w-[18px] h-[18px]"></i></button>
          </div>
        </div>
        <div class="pt-2 text-[16px]" style="color: var(--text); font-weight: 700;">${note}</div>
      </div>
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

