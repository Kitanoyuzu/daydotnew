import { getState, setState } from "../store.js";
import { toast } from "./modal.js";

function downloadText({ filename, text }) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export function renderBackupPanel() {
  return `
    <div class="dd-card" style="padding: 14px;">
      <div class="text-[14px]" style="color: var(--text); font-weight: 900;">数据备份</div>
      <div class="pt-2 text-[12px]" style="color: var(--text-sub); line-height: 1.5;">
        本地数据仅保存在浏览器。导入会先自动导出一份当前备份，避免误覆盖。
      </div>

      <div class="pt-4 flex items-center gap-3">
        <button type="button" class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--bg) 78%, var(--card)); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);" data-dd-backup-export>
          导出备份
        </button>
        <button type="button" class="flex-1 dd-card" style="height: 46px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 92%, #3b332e); color: var(--card); box-shadow:none;" data-dd-backup-import>
          导入恢复
        </button>
        <input type="file" accept="application/json" class="hidden" data-dd-backup-file />
      </div>
    </div>
  `;
}

export function initBackupPanelAll() {
  if (document.documentElement.dataset.ddBackupDelegated === "1") return;
  document.documentElement.dataset.ddBackupDelegated = "1";

  const pickFile = () => {
    const input = document.querySelector("[data-dd-backup-file]");
    input?.click?.();
  };

  document.addEventListener("click", (e) => {
    if (e.target?.closest?.("[data-dd-backup-export]")) {
      const state = getState();
      const ts = new Date().toISOString().replaceAll(":", "-").slice(0, 19);
      downloadText({ filename: `daydot-backup-${ts}.json`, text: JSON.stringify(state, null, 2) });
      toast("已导出");
    }
    if (e.target?.closest?.("[data-dd-backup-import]")) pickFile();
  });

  document.addEventListener("change", async (e) => {
    const input = e.target?.closest?.("[data-dd-backup-file]");
    if (!input) return;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    // 导入前自动备份当前
    try {
      const state = getState();
      const ts = new Date().toISOString().replaceAll(":", "-").slice(0, 19);
      downloadText({ filename: `daydot-backup-before-import-${ts}.json`, text: JSON.stringify(state, null, 2) });
    } catch {}

    try {
      const text = await file.text();
      const next = JSON.parse(text);
      setState(next);
      toast("已导入");
    } catch {
      toast("导入失败：文件格式不正确");
    }
  });
}

