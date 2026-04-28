import { renderComboSearch } from "../components/comboSearch.js";
import { renderRecordWall } from "../components/recordWall.js";
import { renderBackupPanel } from "../components/backupPanel.js";
import { initVaultPageAll } from "../components/vaultPage.js";

export function pageVault() {
  const html = `
    <section class="flex flex-col gap-[14px]">
      ${renderComboSearch({
        id: "vault-search",
        placeholder: "搜索记录…",
        rightIcon: "home",
        rightHref: "#/vault/all",
        mode: "search",
      })}

      <div data-dd-vault-wall>
        ${renderRecordWall()}
      </div>

      ${renderBackupPanel()}
    </section>
  `;

  return { html, afterMount() { initVaultPageAll(); } };
}

