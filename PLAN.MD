# PLAN — DayDot v2

## 技术栈

- 原生 HTML + CSS + JS（无框架）
- Tailwind CSS（CDN）
- Lucide Icons（CDN）
- 数据存 localStorage
- PWA（Service Worker + manifest）
- 部署：GitHub Pages

## 文件结构

daydot-v2/
├── index.html
├── style.css
├── js/
│   ├── app.js              # hash 路由 + 初始化
│   ├── store.js            # localStorage 数据读写
│   ├── pages/
│   │   ├── new.js          # 录入页
│   │   ├── vault.js        # 记录页
│   │   ├── vaultAll.js     # 全部记录页（原型）
│   │   ├── vaultTag.js     # 标签详情页（原型）
│   │   ├── calendar.js     # 日历页
│   │   └── tags.js         # 标签管理页
│   ├── components/
│   │   ├── bottomNav.js    # 底部导航
│   │   ├── daysSince.js    # "已过去 XX 天"卡片
│   │   ├── confirm.js      # 确认弹窗
│   │   ├── tagPill.js      # Tag 胶囊
│   │   ├── recordCard.js   # 记录卡片（统一模组）
│   │   ├── recordList.js   # 记录列表（统一模组）
│   │   ├── dropdown.js     # 下拉层（锚定控件 + 外部点击隐藏）
│   │   └── combobox.js     # 组合下拉（输入 + 选择 + 过滤）
│   └── backup.js           # 导入导出
│   ├── pwa.js              # SW 注册（Step5 完善策略）
├── sw.js
└── manifest.json

## 数据结构

localStorage key: "daydot"
{
  tags: [{ id, name, parentId, color, createdAt }],
  records: [{ id, eventDate, tagId, note, createdAt, updatedAt }],
  nextTagId: 1,
  nextRecordId: 1
}
约束：同父级下 tag name 唯一。

## 关键决策

- hash 路由：#/vault（默认）| #/new | #/calendar | #/tags
  - [实现调整: 为贴近截图的信息架构] 增加：`#/vault/all`（全部记录）、`#/vault/tag/:id`（标签详情）
- [实现调整: 为实现 1:1 复刻截图交互] 日期选择：使用**自定义月历弹层**，不使用系统原生日期选择器
- 一级 Tag 筛选自动包含其所有二级 Tag
- SW 策略：cache-first + 版本号检测，发现新版本时页面顶部提示刷新
- 导入数据前自动备份当前数据，防覆盖

## 色系

--bg: #FAF6F1  --card: #FDF9F4  --secondary: #F5EDE4
--accent: #C4A882  --text: #4A4543  --text-sub: #9B918A  --border: #E8E0D8
Tag 10 色：延续 v1 莫兰迪色谱

## 实现步骤

1. **UI 原型**：全页面假数据 + 完整样式 + 底部导航 + 路由切换 → 手机上确认视觉
2. **数据层 + 标签管理 + 录入**：store.js → 标签 CRUD → 录入页功能 → 手机上跑通录入流程
3. **记录页**：卡片墙 + 时间线 + 全部记录 + 搜索筛选编辑删除 → 手机上跑通查看流程
4. **日历 + 备份**：月历 + Tag 筛选 + 导入导出 → 手机上跑通日历和备份
5. **PWA + 部署**：SW + manifest + 版本更新提示 → GitHub Pages 部署 → 手机添加桌面验收