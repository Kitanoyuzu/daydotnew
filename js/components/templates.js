import { renderComboSearch } from "./comboSearch.js";
import { renderCalendarField } from "./calendarPopover.js";
import { formatISO } from "./calendarCore.js";

export function renderGlobalTemplates() {
  return `
    <div class="hidden" data-dd-template="edit-record">
      ${editRecordTemplate()}
    </div>

    <div class="hidden" data-dd-template="new-record">
      ${newRecordTemplate()}
    </div>

    <div class="hidden" data-dd-template="vaultall-filter">
      ${vaultAllFilterTemplate()}
    </div>
  `;
}

function editRecordTemplate() {
  const todayISO = formatISO(new Date());
  return `
    <div class="flex items-center justify-between pb-3">
      <div class="text-[16px]" style="font-weight: 800; color: var(--text);">编辑记录</div>
      <button class="dd-icon-btn" type="button" aria-label="关闭" data-dd-modal-close><i data-lucide="x" class="w-[18px] h-[18px]"></i></button>
    </div>

    <div class="flex flex-col gap-[12px]">
      <div class="text-[13px]" style="color: var(--text-sub); font-weight: 700;">日期</div>
      ${renderCalendarField({ id: "modal-edit-date", value: todayISO, placeholder: "选择日期" })}

      <div class="text-[13px]" style="color: var(--text-sub); font-weight: 700;">标签</div>
      ${renderComboSearch({
        id: "modal-edit-tag",
        placeholder: "选择标签…",
        rightIcon: "settings",
        rightHref: "#/tags",
        mode: "tag",
        variant: "bar",
      })}

      <div class="text-[13px]" style="color: var(--text-sub); font-weight: 700;">备注</div>
      <div class="dd-card dd-combo-input flex items-center gap-3 px-[14px]">
        <i data-lucide="pencil" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>
        <input class="flex-1 bg-transparent outline-none" data-dd-input="modal-edit-note" value="" />
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--bg) 78%, var(--card)); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);" data-dd-modal-close>取消</button>
        <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 92%, #3b332e); color: var(--card); box-shadow:none;" data-dd-action="edit-record-save">保存</button>
      </div>
    </div>
  `;
}

function newRecordTemplate() {
  const todayISO = formatISO(new Date());
  return `
    <div class="flex items-center justify-between pb-3">
      <div class="text-[16px]" style="font-weight: 800; color: var(--text);">新增记录</div>
      <button class="dd-icon-btn" type="button" aria-label="关闭" data-dd-modal-close><i data-lucide="x" class="w-[18px] h-[18px]"></i></button>
    </div>

    <div class="flex flex-col gap-[12px]">
      <div class="text-[13px]" style="color: var(--text-sub); font-weight: 700;">标签</div>
      ${renderComboSearch({
        id: "modal-new-tag",
        placeholder: "添加标签…",
        rightIcon: "settings",
        rightHref: "#/tags",
        mode: "tag",
        variant: "bar",
      })}

      <div class="text-[13px]" style="color: var(--text-sub); font-weight: 700;">日期</div>
      ${renderCalendarField({ id: "modal-new-date", value: todayISO, placeholder: "选择日期" })}

      <div class="text-[13px]" style="color: var(--text-sub); font-weight: 700;">备注</div>
      <div class="dd-card dd-combo-input flex items-center gap-3 px-[14px]">
        <i data-lucide="pencil" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>
        <input class="flex-1 bg-transparent outline-none" placeholder="写点什么…" />
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--bg) 78%, var(--card)); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);" data-dd-modal-close>取消</button>
        <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 92%, #3b332e); color: var(--card); box-shadow:none;" data-dd-action="new-record-save">保存</button>
      </div>
    </div>
  `;
}

function vaultAllFilterTemplate() {
  return `
    <div class="flex items-center justify-between pb-3">
      <div class="text-[16px]" style="font-weight: 800; color: var(--text);">筛选</div>
      <button class="dd-icon-btn" type="button" aria-label="关闭" data-dd-modal-close><i data-lucide="x" class="w-[18px] h-[18px]"></i></button>
    </div>

    <div class="flex flex-col gap-[12px]">
      <div class="text-[13px]" style="color: var(--text-sub); font-weight: 700;">标签</div>
      ${renderComboSearch({
        id: "vaultall-tag-any",
        placeholder: "全部",
        mode: "tagAnyFilter",
        variant: "bar",
      })}

      <div class="flex items-center gap-3 pt-2">
        <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--bg) 78%, var(--card)); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);" data-dd-action="vaultall-filter-clear">清除筛选</button>
        <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 92%, #3b332e); color: var(--card); box-shadow:none;" data-dd-modal-close>完成</button>
      </div>
    </div>
  `;
}

