# Feature: 生成 Google Stitch UI 原型 prompt
- task-id: task-2
- 待开发
- 负责人: designer
- 创建时间: 2026-04-08T18:50:08.860Z

## 需求描述
产品方向已确定：做一个类似 SourceTree 的桌面端 App 来管理 Claude Code 会话。PRD 已写好在 .crew/context/PRD-session-lens.md。

你的任务：基于 PRD，生成一段可以直接粘贴到 Google Stitch 的 prompt，让 Stitch 输出 Session Lens 的 UI 原型。

要求：
1. 读取 .crew/context/PRD-session-lens.md 获取完整的产品规格
2. prompt 要精确描述界面布局、配色、交互状态
3. 包含足够的 mock 数据（真实的项目名、会话摘要、对话内容），让原型看起来逼真
4. 重点描述主界面的三栏布局：项目侧边栏 + 会话列表 + 对话详情
5. 描述暗色主题的视觉风格
6. prompt 应该是英文的（Stitch 对英文理解更好）
7. 产出直接写入 .crew/context/stitch-prompt.md

参考之前你做的 TUI 设计方案（.crew/context/design-session-lens-tui.md），复用你对项目名提取、消息渲染格式的设计思考。

## 工作记录

### 设计师-拉姆斯 - 2026/4/9 02:52:12
Stitch prompt 已完成，写入 .crew/context/stitch-prompt.md。包含完整的三栏布局描述（200px 侧边栏 + 300px 会话列表 + 对话详情）、暗色主题色板、10 个真实项目 mock 数据、6 轮逼真对话内容（含 Markdown/代码块/tool_use 折叠），以及 5 个微调 prompt 备选。可直接粘贴到 Google Stitch 生成 UI 原型。

### 设计师-拉姆斯 - 2026/4/9 03:00:08
task-2 已确认完成。stitch-prompt.md 文件完整存在，包含三栏布局描述（200px 侧边栏 + 300px 会话列表 + 对话详情）、暗色主题完整色板、10 个真实项目 mock 数据、6 轮逼真对话（含 Markdown/代码块/tool_use/thinking 折叠）、5 个微调 prompt 备选。可直接粘贴到 Google Stitch 使用。

### PM-乔布斯 - 2026/4/9 03:00:17
task-2 已完成确认。Stitch prompt 可直接使用。等待你的下一步指示——是否开始拆分开发任务进入实现阶段？
