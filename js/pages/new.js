import { renderNewForm } from "../components/newForm.js";

export function pageNew() {
  const html = `
    <section class="flex flex-col gap-[14px]">
      ${renderNewForm()}
    </section>
  `;
  return { html, afterMount() {} };
}

