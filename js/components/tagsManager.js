export function renderTagsManager() {
  return `
    <section class="flex flex-col gap-[14px]">
      <div class="dd-card" style="padding: 16px;">
        <div class="flex flex-col gap-3">
          <div class="dd-card flex items-center justify-between px-[14px]" style="height: var(--control-h); border-radius: var(--r-pill); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 66%, var(--card));">
            <span style="color: var(--text-sub);">父级</span>
            <button class="dd-icon-btn" type="button" aria-label="编辑父级" data-dd-modal-open="tag-edit"><span style="width: 16px; height: 16px; border-radius: 999px; border: 2px solid var(--accent); display:block;"></span></button>
          </div>
          <div class="dd-card flex items-center justify-between px-[14px]" style="height: var(--control-h); border-radius: var(--r-pill); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 66%, var(--card));">
            <span style="color: var(--text-sub);">子级</span>
            <button class="dd-icon-btn" type="button" aria-label="新增子级" data-dd-modal-open="tag-new"><i data-lucide="plus" class="w-[18px] h-[18px]"></i></button>
          </div>
          <div class="text-[12px]" style="color: var(--text-sub);">支持两级：父级/子级。父级颜色会被子级继承用于展示。</div>
        </div>
      </div>

      <div class="dd-card" style="padding: 14px;">
        <div class="flex items-center gap-2 px-2 pb-3">
          <i data-lucide="search" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>
          <div class="text-[14px]" style="font-weight: 800;">标签列表</div>
        </div>
        <div class="dd-card px-[14px]" style="height: var(--control-h); border-radius: var(--r-pill); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 66%, var(--card)); display:flex; align-items:center; gap:10px;">
          <i data-lucide="search" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>
          <input class="w-full h-full bg-transparent outline-none" placeholder="搜索标签…" />
        </div>

        <div class="pt-4 flex flex-col gap-3">
          ${tagRow({ name: "月经", parent: "健康", count: 1, tint: "#B48AA8" })}
          ${tagRow({ name: "换洗睡衣", parent: "清洁", count: 2, tint: "#7FA7B8" })}
        </div>
      </div>
    </section>

    <div class="hidden" data-dd-template="tag-new">
      ${tagModalTemplate({ title: "新建标签" })}
    </div>
    <div class="hidden" data-dd-template="tag-edit">
      ${tagModalTemplate({ title: "编辑标签" })}
    </div>
  `;
}

function tagRow({ name, parent, count, tint }) {
  const bg = `color-mix(in srgb, ${tint} 18%, var(--card))`;
  const pText = `color-mix(in srgb, ${tint} 68%, var(--text))`;
  return `
    <div class="dd-card flex items-center justify-between px-4 py-3" style="border-radius: var(--r-card); box-shadow:none; background:${bg}; border: 1px solid color-mix(in srgb, var(--border) 55%, transparent);">
      <div class="text-[16px]" style="color: var(--text); font-weight: 700;">${name}</div>
      <div class="flex items-center gap-3">
        <span class="dd-pill" style="background: color-mix(in srgb, ${tint} 22%, var(--card)); color:${pText};">${parent}</span>
        <span class="text-[12px]" style="color: var(--text-sub);">${count}</span>
      </div>
    </div>
  `;
}

function tagModalTemplate({ title }) {
  return `
    <div class="flex items-center justify-between pb-3">
      <div class="text-[16px]" style="font-weight: 800; color: var(--text);">${title}</div>
      <button class="dd-icon-btn" type="button" aria-label="关闭" data-dd-modal-close><i data-lucide="x" class="w-[18px] h-[18px]"></i></button>
    </div>

    <div class="flex flex-col gap-[12px]">
      <div class="dd-card flex items-center justify-between px-[14px]" style="height: var(--control-h); border-radius: var(--r-pill); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 66%, var(--card));">
        <span style="color: var(--text-sub);">父级</span>
        <span style="width: 16px; height: 16px; border-radius: 999px; display:block; border: 2px solid var(--accent);"></span>
      </div>

      <div class="dd-card flex items-center px-[14px]" style="height: var(--control-h); border-radius: var(--r-pill); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 66%, var(--card));">
        <input class="w-full bg-transparent outline-none" placeholder="子级名称" />
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--bg) 78%, var(--card)); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);" data-dd-modal-close>取消</button>
        <button class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 92%, #3b332e); color: var(--card); box-shadow:none;">保存</button>
      </div>
    </div>
  `;
}

