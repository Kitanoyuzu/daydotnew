import { renderGlobalTemplates } from "./templates.js";

export function renderAppShell({ contentHtml, bottomNavHtml }) {
  return `
    <main class="dd-shell">
      ${contentHtml}
    </main>
    ${bottomNavHtml}
    ${renderGlobalTemplates()}
  `;
}

