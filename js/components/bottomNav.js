function navItem({ href, icon, label, activeKey }) {
  const isActive = activeKey === href;
  return `
    <a class="dd-nav-item ${isActive ? "is-active" : ""}" href="#${href}">
      <i data-lucide="${icon}" class="w-[18px] h-[18px]"></i>
      <span>${label}</span>
    </a>
  `;
}

export function renderBottomNav({ active }) {
  const fabDark = active === "new" ? "is-dark" : "";
  return `
    <nav class="dd-bottom-nav" aria-label="底部导航">
      ${navItem({ href: "/vault", icon: "archive", label: "记录", activeKey: active === "vault" ? "/vault" : "" })}
      <a class="dd-fab ${fabDark}" href="#/new" aria-label="新增记录">
        <i data-lucide="plus" class="w-[20px] h-[20px]"></i>
      </a>
      ${navItem({ href: "/calendar", icon: "calendar", label: "日历", activeKey: active === "calendar" ? "/calendar" : "" })}
    </nav>
  `;
}

