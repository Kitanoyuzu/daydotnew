import { renderComboSearch } from "../components/comboSearch.js";
import { renderRecordWall } from "../components/recordWall.js";

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

      ${renderRecordWall()}
    </section>
  `;

  return { html, afterMount() {} };
}

