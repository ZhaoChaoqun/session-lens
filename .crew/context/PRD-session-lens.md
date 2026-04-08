# Session Lens — 产品需求规格书 (PRD)

> Claude Code 的 SourceTree：一个桌面端会话管理应用

---

## 1. 产品愿景

**一句话**：Session Lens 是 Claude Code 的 SourceTree——让你像管理 Git 仓库一样，可视化地浏览、搜索、预览和管理所有 Claude Code 会话。

**为什么需要它**：
- Claude Code 是终端工具，没有 ChatGPT/Gemini 那样的侧边栏来浏览历史对话
- 用户积累了数千个会话（128 个项目、4687 个会话文件、1GB 数据），却只能通过 `claude --resume` 在单个目录下盲选
- 现有社区工具要么是 CLI 脚本（功能太弱），要么是 MCP Server（无可视化），要么是早期 Web UI（体验粗糙），没有一个达到"让人想推荐"的水平

**类比**：
| 领域 | 命令行 | 桌面端可视化 |
|------|--------|-------------|
| Git | `git log` / `git branch` | **SourceTree** / GitKraken |
| Docker | `docker ps` / `docker logs` | Docker Desktop |
| K8s | `kubectl` | Lens |
| Claude Code | `claude --resume` | **Session Lens** ← 我们要做的 |

---

## 2. 目标用户

**主要用户**：重度 Claude Code 用户
- 每天使用 Claude Code 完成多个编程任务
- 跨多个项目工作（5-50 个活跃项目）
- 累积了数百到数千个会话
- 经常需要回溯："上次那个 bug 是怎么修的？"、"上周那个方案 Claude 给的建议是什么？"

**用户画像**：全栈工程师 / 独立开发者 / 技术管理者，macOS 或 Linux，熟悉终端但也欢迎可视化工具。

---

## 3. 核心场景

### 场景 1：快速查找历史对话
> "上周我让 Claude 帮我重构了认证模块，具体改了什么来着？"

用户打开 Session Lens → 在搜索栏输入 "认证" → 看到按项目分组的匹配会话 → 点击查看完整对话 → 找到关键信息

### 场景 2：恢复中断的工作
> "昨天的 Claude Code 会话被我不小心关了，想继续。"

用户打开 Session Lens → 看到按时间排序的最近会话 → 点击 "Resume" → 自动在终端中恢复会话

### 场景 3：跨项目浏览
> "最近一周我都用 Claude 做了什么？"

用户打开 Session Lens → 切换到"时间线"视图 → 按天浏览所有项目的会话活动 → 快速掌握全局

### 场景 4：会话审计与知识沉淀
> "我想回顾这个项目所有关键的架构决策对话。"

用户打开 Session Lens → 选中项目 → 浏览该项目所有会话 → 收藏/导出重要对话

---

## 4. 功能定义

### 4.1 P0 — 核心功能（MVP）

#### 4.1.1 项目总览（Sidebar）
| 项目 | 说明 |
|------|------|
| 项目列表 | 左侧边栏展示所有项目，按最近活跃排序 |
| 项目信息 | 项目名（从路径提取可读名称）、会话数量、最后活跃时间 |
| 项目分组 | 支持按 Git 目录自动分组 |
| 快速折叠 | 可折叠/展开项目下的会话列表 |

#### 4.1.2 会话列表（Master View）
| 项目 | 说明 |
|------|------|
| 会话行 | 显示：日期、首条用户消息摘要（去除 XML 标签）、消息数量 |
| 排序 | 默认按时间倒序（最新在上），支持切换排序方式 |
| 选中预览 | 点击/选中会话时，右侧显示预览 |
| 视觉层级 | 今天的会话 / 本周 / 更早，用分隔线区分 |

#### 4.1.3 会话预览/详情（Detail View）
| 项目 | 说明 |
|------|------|
| 对话气泡 | 用户消息和助手消息用不同样式展示，类似 ChatGPT |
| 消息折叠 | tool_use / tool_result 折叠显示（点击展开细节） |
| 代码高亮 | 代码块语法高亮 |
| Thinking 折叠 | assistant 的 thinking 内容默认折叠，可展开 |
| Markdown 渲染 | assistant 回复的 Markdown 正确渲染 |
| 文件 diff | Edit/Write 工具调用的文件变更以 diff 视图展示 |

#### 4.1.4 搜索
| 项目 | 说明 |
|------|------|
| 全局搜索 | 搜索框，搜索范围覆盖：用户消息内容、项目名 |
| 实时过滤 | 输入即过滤会话列表 |
| 搜索结果 | 匹配的会话高亮显示，搜索词在预览中高亮 |

#### 4.1.5 恢复会话
| 项目 | 说明 |
|------|------|
| Resume 按钮 | 每个会话有"恢复"操作 |
| 执行方式 | 调用终端执行 `claude --resume <session-id> -p <project-path>` |
| 终端检测 | 自动检测用户终端（iTerm2 / Terminal.app / Warp / Kitty / Alacritty 等） |

### 4.2 P1 — 体验增强

#### 4.2.1 时间线视图
| 项目 | 说明 |
|------|------|
| 活动日历 | 类似 GitHub Contribution Graph 的活动热力图 |
| 日视图 | 按天展示所有项目的会话活动 |
| 统计面板 | 会话总数、活跃项目数、token 使用量（从 usage 字段提取） |

#### 4.2.2 会话管理
| 项目 | 说明 |
|------|------|
| 删除会话 | 删除不需要的会话文件（带确认） |
| 导出 | 将会话导出为 Markdown / HTML |
| 收藏/标记 | 给重要会话加星标，方便后续查找 |

#### 4.2.3 高级搜索
| 项目 | 说明 |
|------|------|
| 全文搜索 | 搜索范围扩展到助手消息内容 |
| 过滤器 | 按时间范围、项目、消息类型过滤 |
| 正则搜索 | 支持正则表达式搜索 |

#### 4.2.4 Sub-agent 支持
| 项目 | 说明 |
|------|------|
| Sub-agent 检测 | 识别会话中的 sub-agent 调用 |
| 嵌套展示 | 点击 sub-agent 工具调用 → 弹窗显示完整的子会话 |

### 4.3 P2 — 差异化功能

#### 4.3.1 多 Agent 支持
| 项目 | 说明 |
|------|------|
| Codex CLI | 支持 OpenAI Codex CLI 的会话数据 |
| Gemini CLI | 支持 Google Gemini CLI 的会话数据 |
| 统一视图 | 不同 agent 的会话在同一界面浏览，用图标区分 |

#### 4.3.2 会话洞察
| 项目 | 说明 |
|------|------|
| Token 分析 | 每个会话的 token 消耗统计和趋势 |
| 工具使用分析 | 哪些工具被使用最多（Read / Edit / Bash 等） |
| 项目活跃度 | 项目维度的使用趋势 |

---

## 5. 技术规格

### 5.1 技术栈

| 层 | 选型 | 理由 |
|----|------|------|
| 框架 | **Tauri v2** | 原生性能、小包体积（~10MB vs Electron ~150MB）、Rust 安全性 |
| 后端 | **Rust** | 高性能 JSONL 解析、内存安全、与 Tauri 无缝集成 |
| 前端 | **React 19 + TypeScript** | 生态成熟、组件丰富、开发效率高 |
| 样式 | **Tailwind CSS v4** | 快速开发、一致性好 |
| 代码高亮 | **Shiki** | VS Code 同款引擎，支持所有主流语言 |
| Markdown | **react-markdown + remark-gfm** | 支持 GFM 扩展 |
| 状态管理 | **Zustand** | 轻量、简单、TypeScript 友好 |

### 5.2 数据源

所有数据来自本地文件系统，**不需要网络请求，不需要 API Key**。

#### 5.2.1 Claude Code 数据目录结构

```
~/.claude/
├── history.jsonl                    # 命令历史（每次用户输入一行）
├── sessions/                        # 会话元数据
│   └── {pid}.json                   # {pid, sessionId, cwd, startedAt, kind, entrypoint}
├── projects/                        # 会话详情（核心数据）
│   └── {project-path-encoded}/      # 项目目录名（路径用 - 分隔）
│       ├── {uuid}.jsonl             # 会话对话记录
│       └── {uuid}/                  # 会话附属数据
│           └── subagents/           # Sub-agent 会话
│               └── agent-*.jsonl
└── plans/                           # 实现计划文件
    └── *.md
```

#### 5.2.2 JSONL 记录类型

| type | 说明 | 关键字段 |
|------|------|----------|
| `user` | 用户消息 | `message.content`（string 或 ContentBlock[]）、`timestamp`、`cwd`、`gitBranch` |
| `assistant` | 助手回复 | `message.content`（ContentBlock[]，含 text / tool_use）、`message.usage`（token 统计） |
| `progress` | 工具执行进度 | `data.type`（tool_progress / hook_progress）|
| `system` | 系统消息 | 权限、配置变更等 |
| `file-history-snapshot` | 文件版本快照 | `snapshot.trackedFileBackups` |
| `queue-operation` | 队列操作 | 用户消息排队 |

#### 5.2.3 ContentBlock 类型（assistant 消息内部）

```typescript
type ContentBlock =
  | { type: 'text'; text: string }                    // 文本回复
  | { type: 'thinking'; thinking: string }            // 思考过程
  | { type: 'tool_use'; name: string; input: object } // 工具调用
  | { type: 'tool_result'; content: string }          // 工具结果
```

#### 5.2.4 数据提取规则

**项目名提取**：
- `-Users-zhaochaoqun-Github-typeless` → `typeless`
- `-Users-zhaochaoqun-Github-claude-web-chat` → `claude-web-chat`
- `-Users-zhaochaoqun` → `~ (home)`
- 去除 `--crew-roles-*` 后缀

**会话摘要提取**：
1. 逐行读取 JSONL
2. 找到第一条 `type === 'user' && !isMeta` 的记录
3. 提取 `message.content`：如果是 string 直接用，如果是 array 找第一个 `type === 'text'` 的元素
4. 去除 XML 标签（`<system-reminder>` 等），取前 200 字符
5. 如果内容以命令开头（如 `/cost`、`/help`），跳过继续找下一条

**会话元信息**：
```typescript
interface SessionMeta {
  id: string;           // UUID（文件名）
  project: string;      // 项目名（可读格式）
  projectPath: string;  // 原始项目路径
  timestamp: Date;      // 文件 mtime 
  summary: string;      // 首条用户消息摘要
  messageCount: number; // user + assistant 消息数
  branch: string;       // gitBranch 字段
  cwd: string;          // 工作目录
  fileSize: number;     // 文件字节大小
  tokenUsage?: {        // 从 assistant message.usage 累加
    input: number;
    output: number;
  };
}
```

### 5.3 性能要求

| 指标 | 目标 | 说明 |
|------|------|------|
| 冷启动 | < 2 秒 | 打开应用到看到会话列表 |
| 热启动 | < 500ms | 有缓存时 |
| 会话切换预览 | < 200ms | 点击会话到看到预览内容 |
| 搜索响应 | < 300ms | 输入到结果更新 |
| 内存占用 | < 200MB | 加载所有元信息后 |
| 安装包大小 | < 30MB | Tauri 的优势 |

### 5.4 性能策略

1. **分层加载**：
   - 第一层：扫描目录结构 + 文件 mtime → 构建项目/会话树（毫秒级）
   - 第二层：读取每个 JSONL 前 50 行 → 提取元信息和摘要（并行，秒级）
   - 第三层：按需加载会话完整内容（用户点击时才触发）

2. **索引缓存**：
   - 首次扫描的元信息缓存到 `~/.session-lens/cache.json`
   - 使用文件 mtime 判断缓存有效性
   - 增量更新：只重新解析 mtime 变化的文件

3. **虚拟滚动**：
   - 会话列表和消息列表使用虚拟滚动
   - 只渲染可视区域内的 DOM 节点

4. **流式解析**：
   - JSONL 文件使用流式读取 + 逐行解析
   - 不将整个文件加载到内存

---

## 6. 界面布局

### 6.1 主界面（三栏布局）

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Session Lens                                              ─  □  ×         │
├──────────┬──────────────────────────┬────────────────────────────────────────┤
│          │ 🔍 Search sessions...    │                                       │
│ PROJECTS │──────────────────────────│                                       │
│          │                          │                                       │
│ typeless │ Today                    │   👤 User                             │
│   18     │ ┌──────────────────────┐ │   Rust修复了长音频截断问题，            │
│          │ │ 10:30 benchmark重新.. │ │   请重新运行一次benchmark              │
│ ai-pr    │ │  9:15 代码清理...     │ │                                       │
│    7     │ └──────────────────────┘ │   🤖 Assistant                        │
│          │                          │   我先了解一下当前的 benchmark          │
│ claude-  │ Yesterday                │   测试文件和构建状态。                  │
│ web-chat │ ┌──────────────────────┐ │                                       │
│   13     │ │ 16:20 项目结构优化... │ │   ▶ 🔧 Read file                     │
│          │ │ 14:05 测试新feature.. │ │     src/benchmark/runner.rs           │
│ Synapse  │ └──────────────────────┘ │                                       │
│    5     │                          │   ▶ 🔧 Bash                           │
│          │ This Week                │     cargo test --release               │
│ babys-   │ ┌──────────────────────┐ │                                       │
│ food     │ │ Mar 04 Rust修复了... │ │   👤 User                             │
│    3     │ │ Mar 03 以下参数使用.. │ │   目前Swift中使用的一些超参数           │
│          │ └──────────────────────┘ │   是如何设置的                         │
│          │                          │                                       │
│ ──────── │                          │                                       │
│ All (128)│ 548 messages · 59MB      │   Session: 5b0b..  │ Mar 04 14:03    │
│          │ branch: main             │   Resume ▶  │  Export  │  Delete     │
└──────────┴──────────────────────────┴────────────────────────────────────────┘
```

### 6.2 布局说明

| 区域 | 位置 | 宽度 | 内容 |
|------|------|------|------|
| 项目侧边栏 | 左 | 160px 固定 | 项目列表 + 会话数 + 活跃指示 |
| 会话列表 | 中 | 弹性（30%） | 搜索栏 + 按时间分组的会话列表 |
| 对话详情 | 右 | 弹性（70%） | 消息流 + 操作栏 |

### 6.3 暗色主题（默认）

遵循 macOS 原生暗色风格：
- 背景色：`#1E1E1E`（窗口）/ `#252526`（侧边栏）/ `#1E1E1E`（内容区）
- 文字色：`#CCCCCC`（主要）/ `#808080`（次要）
- 强调色：`#007ACC`（蓝色，选中/链接）
- 用户消息背景：`#2D2D2D`
- 助手消息背景：透明
- 代码块背景：`#1A1A1A`
- 分隔线：`#333333`

支持亮色主题切换。

---

## 7. 交互规格

### 7.1 项目侧边栏

- 点击项目 → 中栏只显示该项目的会话
- 点击 "All" → 显示所有项目的会话
- 项目名旁显示未读/新增指示（自上次打开后有新会话）
- 右键项目 → 弹出菜单：打开目录、在终端中打开、复制路径

### 7.2 会话列表

- 按时间分组：Today / Yesterday / This Week / This Month / Earlier
- 单击会话 → 右栏显示预览
- 双击或按 Enter → 触发 Resume
- 右键 → 弹出菜单：Resume / Export / Copy ID / Delete
- 搜索时分组消失，结果扁平展示，前缀显示项目名

### 7.3 对话详情

- 滚动浏览消息流
- tool_use 块默认折叠为一行摘要（如 `🔧 Read file: src/main.rs`），点击展开
- thinking 块默认折叠（如 `💭 Thinking... (点击展开)`），点击展开
- 代码块右上角有复制按钮
- 底部操作栏：Resume / Export / Delete

### 7.4 键盘快捷键

| 快捷键 | 操作 |
|--------|------|
| `⌘+F` / `Ctrl+F` | 聚焦搜索框 |
| `⌘+K` / `Ctrl+K` | 快速命令面板（类 VS Code） |
| `↑` / `↓` | 在会话列表中导航 |
| `Enter` | 恢复选中会话 |
| `⌘+E` | 导出当前会话 |
| `⌘+Delete` | 删除当前会话（带确认） |
| `Esc` | 清除搜索 / 关闭弹窗 |
| `⌘+1/2/3` | 切换视图（列表/时间线/分析） |

---

## 8. 平台支持

### 8.1 MVP 平台

| 平台 | 优先级 | 说明 |
|------|--------|------|
| **macOS** (Apple Silicon + Intel) | P0 | 主要用户群 |
| **Linux** (x86_64) | P1 | .deb + .AppImage |
| **Windows** (x86_64) | P2 | .msi + .exe |

### 8.2 分发方式

- **macOS**: `.dmg` 安装包 + Homebrew Cask（`brew install --cask session-lens`）
- **Linux**: `.deb` / `.AppImage` + AUR
- **Windows**: `.msi` / `.exe`
- **Auto-update**: Tauri 内置更新机制

---

## 9. 非功能需求

### 9.1 安全
- **100% 本地**：不联网，不上传数据，不需要 API Key
- **只读默认**：默认只读取数据，删除操作需要显式确认
- **macOS 签名**：发布前进行代码签名（避免 Gatekeeper 拦截）

### 9.2 隐私
- 不收集任何遥测数据
- 不缓存会话内容到应用目录之外
- 缓存文件（`~/.session-lens/cache.json`）只包含元信息，不含对话内容

### 9.3 可访问性
- 支持键盘完整操作
- 高对比度模式
- 适配系统字体缩放

---

## 10. 不做的事情 (Non-Goals)

| 不做 | 原因 |
|------|------|
| 编辑/修改会话内容 | 这是原始记录，不应被篡改 |
| 在应用内发起新 Claude 会话 | 那是 Claude Code 的工作，我们只做查看和恢复 |
| 云同步 | 增加复杂度，隐私风险，不是核心痛点 |
| AI 总结会话 | 需要 API Key，增加成本和依赖，V1 不做 |
| 移动端 | 桌面端优先，CLI 用户不在手机上编程 |

---

## 11. 成功指标

| 指标 | 目标 |
|------|------|
| 冷启动时间 | < 2 秒 |
| 搜到目标会话 | < 5 秒（从打开应用到找到特定对话） |
| GitHub Stars | 发布 1 个月内 > 100 |
| 安装包大小 | < 30MB |
| 崩溃率 | < 0.1% |

---

## 12. 里程碑

### M1: 骨架 & 数据层（Week 1）
- [ ] Tauri + React 项目脚手架
- [ ] Rust 后端：JSONL 解析器 + 会话元信息提取
- [ ] 前端：三栏布局骨架 + 项目/会话列表渲染

### M2: 核心体验（Week 2）
- [ ] 对话详情视图（消息气泡、代码高亮、tool_use 折叠）
- [ ] 搜索功能
- [ ] Resume 会话功能
- [ ] 索引缓存

### M3: 打磨 & 发布（Week 3）
- [ ] 暗色/亮色主题
- [ ] 键盘快捷键
- [ ] macOS DMG 打包 + 签名
- [ ] README + 文档 + 截图
- [ ] GitHub Release v0.1.0

### M4: 增强功能（Week 4+）
- [ ] 时间线视图 + 活动热力图
- [ ] 会话管理（删除、导出、收藏）
- [ ] Sub-agent 支持
- [ ] 高级搜索

---

## 13. 开放问题

| # | 问题 | 当前倾向 | 状态 |
|---|------|----------|------|
| 1 | 产品名用 "Session Lens" 还是其他？ | Session Lens（延续已有仓库名） | 待确认 |
| 2 | 是否第一版就支持 Codex/Gemini CLI？ | 不，MVP 专注 Claude Code | 已决定 |
| 3 | 是否需要 Homebrew 分发？ | 是，但可以 M3 之后再做 | 待定 |
| 4 | 会话"收藏"数据存在哪里？ | `~/.session-lens/favorites.json` | 待定 |

---

*文档状态：DRAFT — 等待产品负责人审阅*
*最后更新：2026-04-08*
