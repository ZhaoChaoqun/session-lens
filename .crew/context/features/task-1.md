# Feature: TUI 会话浏览器交互设计
- task-id: task-1
- 待开发
- 负责人: designer
- 创建时间: 2026-04-08T18:05:12.894Z

## 需求描述
我们要做一个 Claude Code 的终端内会话浏览器（TUI 工具）。用户痛点：Claude Code 没有像 ChatGPT 侧边栏那样的会话预览和管理功能。

核心约束：
1. 纯终端 TUI，不开浏览器，不依赖 tmux/zellij
2. 秒开——"看一眼就走"的工具
3. 零配置——读取 ~/.claude/ 目录即可

需要你设计：
1. 整体布局方案（分栏？全屏？弹出层？）
2. 会话列表的信息展示（显示什么、隐藏什么、排序逻辑）
3. 会话预览的交互方式（如何快速预览一个会话的内容）
4. 搜索/过滤的交互
5. 核心操作流程（浏览→预览→恢复会话的完整 flow）
6. 键盘操作映射

数据来源：~/.claude/projects/**/*.jsonl，包含完整的对话记录（user/assistant/tool_use 等）

请参考 lazygit、k9s、fzf 等优秀 TUI 工具的交互范式，给出你的设计方案。

## 工作记录

### 开发者-托瓦兹-1 - 2026/4/9 02:09:34
技术可行性分析完成。核心发现：1) JSONL 结构已摸清，4654 个文件共 976MB，解析无难度；2) 推荐 Rust + Ratatui 技术栈；3) 已发现成熟竞品 claude-history（Rust，功能几乎完全覆盖）；4) 预估 9 人天。关键决策点：自建 vs fork 竞品。

### 设计师-拉姆斯 - 2026/4/9 02:10:19
Session Lens TUI 设计方案完成。包含：双栏 Master-Detail 布局、项目分组列表、即时预览、fzf 式搜索、Vi 键位映射、三档响应式适配、完整的数据提取规格和边界场景处理。方案已写入 .crew/context/design-session-lens-tui.md，请审阅。

### 开发者-托瓦兹-1 - 2026/4/9 03:03:44
技术可行性分析完成。核心发现：1) JSONL 结构已摸清，4700 个文件共 1GB，解析无难度；2) 推荐 Tauri v2 (Rust + React) 技术栈；3) 已发现成熟竞品 claude-history（Rust TUI），Session Lens 做桌面端 GUI 是差异化定位；4) 性能目标可达成（stat 43ms，缓存可实现 <2s 冷启动）；5) 预估 ~10 人天；6) 当前机器需安装 Rust/Node/Tauri。报告在 .crew/context/tech-feasibility-analysis.md。请审阅并决定下一步。
