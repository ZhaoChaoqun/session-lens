# Session Lens — 技术可行性分析报告

> 开发者-托瓦兹-1 | 2026-04-08

---

## 1. JSONL 数据结构分析

### 1.1 实际数据规模

| 指标 | 数值 |
|------|------|
| 项目数 | 103 |
| 主会话文件数 | 2,974 |
| Sub-agent 文件数 | 1,726 |
| 总文件数 | 4,700 |
| 总数据量 | ~1 GB |
| 文件大小中位数 | 3.2 KB |
| P90 文件大小 | 4.0 KB |
| P99 文件大小 | 4.9 MB |
| 最大文件 | 73.2 MB |
| >1MB 的文件 | 68 个 |

**结论**：绝大多数文件很小（90% < 4KB），但有少量巨型文件（73MB），需要流式解析，不能一次性读入内存。

### 1.2 JSONL 记录类型

每行是一个独立 JSON 对象，`type` 字段标识类型：

| type | 说明 | 关键字段 |
|------|------|----------|
| `user` | 用户消息 | `message.content`（string 或 ContentBlock[]）、`timestamp`、`cwd`、`gitBranch`、`sessionId` |
| `assistant` | 助手回复 | `message.content`（text / thinking / tool_use）、`message.usage`（token 统计）、`message.model` |
| `system` | 系统消息 | `subtype`（如 `stop_hook_summary`、`compact_boundary`） |
| `queue-operation` | 队列操作 | `operation`（enqueue/dequeue）、`content` |
| `pr-link` | PR 关联 | `prNumber`、`prUrl` |
| `last-prompt` | 最后 prompt | `lastPrompt` |

### 1.3 消息内容结构

**user 消息**：
```json
{
  "type": "user",
  "message": { "role": "user", "content": "用户文本..." },
  "timestamp": "2026-04-07T19:08:42.492Z",
  "cwd": "/Users/.../project",
  "sessionId": "uuid",
  "gitBranch": "main"
}
```

**assistant 消息**的 `content` 是数组，包含：
- `{ type: "text", text: "..." }` — 文本回复
- `{ type: "thinking", thinking: "..." }` — 思考过程
- `{ type: "tool_use", name: "Read", input: {...} }` — 工具调用

**tool_result** 嵌在后续 `user` 消息的 `content` 数组中：
```json
{ "type": "tool_result", "tool_use_id": "...", "content": "文件内容..." }
```

### 1.4 解析注意事项

1. **tool_result 可能非常大**：包含完整文件内容，单条记录可达数 MB
2. **assistant 消息是流式追加的**：同一个 `message.id` 可能出现多行（每次 tool_call 追加），需要按 `parentUuid` 构建消息链
3. **content 类型不一致**：user 的 content 可能是 string 也可能是 array，需要两种处理路径
4. **XML 标签**：用户消息中含 `<system-reminder>` 等标签，摘要提取时需要清除
5. **Sub-agent 文件**：在 `{sessionId}/subagents/agent-*.jsonl`，需要和主会话关联
6. **空会话/废弃会话**：部分文件只有几行（queue-operation），没有实际对话内容

---

## 2. 技术栈对比

### 方案 A：Tauri v2 (Rust + React) ← **推荐**

| 维度 | 评价 |
|------|------|
| 性能 | ⭐⭐⭐⭐⭐ Rust 后端解析 JSONL 极快（rayon 并行），前端 WebView 渲染 |
| 包体积 | ⭐⭐⭐⭐⭐ ~10-15MB（vs Electron ~150MB） |
| 原生感 | ⭐⭐⭐⭐ 使用系统 WebView，内存占用低 |
| 开发效率 | ⭐⭐⭐ Rust 学习曲线较陡，但前端部分和 Web 开发一致 |
| 生态 | ⭐⭐⭐⭐ Tauri v2 已稳定，serde_json / rayon 等 Rust 生态成熟 |
| 跨平台 | ⭐⭐⭐⭐ macOS / Linux / Windows 均支持 |

**优势**：PRD 指定的技术栈，JSONL 解析性能最优，竞品 claude-history 证明 Rust 做这类工具非常合适。小包体积对分发友好。
**劣势**：Rust 开发/调试周期较长，团队需要 Rust 能力。

### 方案 B：Electron (TypeScript/Node.js)

| 维度 | 评价 |
|------|------|
| 性能 | ⭐⭐⭐ Node.js 解析 JSONL 足够快（line-reader + JSON.parse），但大文件内存占用高 |
| 包体积 | ⭐⭐ ~150MB+，用户感知差 |
| 原生感 | ⭐⭐⭐ Chromium 渲染，略重 |
| 开发效率 | ⭐⭐⭐⭐⭐ 纯 TS 全栈，上手最快，调试工具完善 |
| 生态 | ⭐⭐⭐⭐⭐ npm 生态无敌，各种 UI 库随意选 |
| 跨平台 | ⭐⭐⭐⭐⭐ 最成熟的跨平台方案 |

**优势**：开发效率最高，团队能力覆盖面最广。
**劣势**：包体积大是硬伤（和"秒开"理念矛盾），内存占用高。对于一个"看一眼就走"的工具来说太重了。

### 方案 C：Swift (原生 macOS)

| 维度 | 评价 |
|------|------|
| 性能 | ⭐⭐⭐⭐⭐ 原生性能，启动最快 |
| 包体积 | ⭐⭐⭐⭐⭐ < 5MB |
| 原生感 | ⭐⭐⭐⭐⭐ 100% 原生 macOS UI |
| 开发效率 | ⭐⭐⭐⭐ SwiftUI 开发效率不错 |
| 生态 | ⭐⭐⭐ macOS 专属，JSON 解析库偏少 |
| 跨平台 | ⭐ 仅 macOS |

**优势**：macOS 上体验最好，启动最快，安装包最小。
**劣势**：不跨平台。PRD 要求支持 Linux 和 Windows（P1/P2）。一旦需要跨平台就全部推翻重来。

### 结论

**推荐方案 A：Tauri v2 (Rust + React)**，理由：
1. PRD 已指定此技术栈
2. 竞品 claude-history 用 Rust（ratatui）证明了 Rust 做 JSONL 解析的高效性
3. 包体积小、性能好、跨平台——三个核心优势完美匹配"秒开工具"定位
4. Rust 后端可以复用 claude-history 的部分解析逻辑（MIT 协议）

---

## 3. 性能考量

### 3.1 文件扫描

| 操作 | 耗时 | 备注 |
|------|------|------|
| stat 2974 个文件（获取 mtime/size） | **43ms** | 极快，可用于增量缓存判断 |
| 读取首行 JSON（Python） | **7.1s** | 太慢，Rust 会快 10x+ |
| 解析单个 1286 行文件（Python） | **13ms** | ~10 万行/秒 |

### 3.2 推荐的分层加载策略

```
第 0 层：stat 目录（43ms）
  → 构建文件列表 + mtime/size → 与缓存比对 → 确定需要刷新的文件

第 1 层：缓存命中（<50ms）
  → 从 bincode 缓存读取元信息 → 立即渲染会话列表

第 2 层：增量解析缓存未命中的文件（并行，<500ms）
  → rayon 并行解析新增/变更的 JSONL → 提取元信息和摘要 → 更新缓存

第 3 层：按需加载（用户点击时）
  → 流式读取完整 JSONL → 构建对话视图 → 虚拟滚动渲染
```

### 3.3 关键优化点

1. **bincode 缓存**：仿 claude-history 的做法，用 bincode 序列化元信息缓存，避免重复解析 JSONL。mtime + size 作为缓存 key。
2. **rayon 并行解析**：初次扫描 2974 个文件可利用多核并行，Rust + rayon 可在 <1s 内完成。
3. **虚拟滚动**：2974 个会话列表必须用虚拟滚动（`react-virtuoso` 或 `@tanstack/virtual`），否则 DOM 爆炸。
4. **大文件流式解析**：73MB 的文件不能一次性读入，用 BufReader 逐行解析。
5. **Markdown 渲染懒加载**：对话气泡中的 Markdown/代码高亮是重计算，只渲染可视区域。

### 3.4 性能目标可行性评估

| 指标 | 目标 | 预估 | 可行性 |
|------|------|------|--------|
| 冷启动 | < 2s | ~1-1.5s（并行解析 + 缓存写入） | ✅ 可达成 |
| 热启动 | < 500ms | ~200ms（缓存读取 + stat 比对） | ✅ 轻松 |
| 会话切换预览 | < 200ms | 小文件 <50ms，大文件 <200ms（流式） | ✅ 可达成 |
| 搜索响应 | < 300ms | 内存中过滤 <50ms，全文搜索需索引 | ✅ 可达成 |
| 内存占用 | < 200MB | 元信息 ~50MB，当前会话 ~10-50MB | ✅ 可达成 |
| 安装包 | < 30MB | Tauri ~10-15MB | ✅ 远超目标 |

---

## 4. 竞品分析：claude-history

在用户本地发现已克隆的竞品 `claude-history`（github: raine/claude-history）。

### 4.1 基本信息

| 项目 | 说明 |
|------|------|
| 语言 | Rust |
| TUI 框架 | ratatui + crossterm |
| 版本 | v0.1.51（活跃维护） |
| 协议 | MIT |
| 安装方式 | cargo install / brew / curl 脚本 |

### 4.2 功能覆盖

| 功能 | claude-history | Session Lens |
|------|---------------|--------------|
| 会话列表 | ✅ 模糊搜索列表 | ✅ 三栏布局 |
| 搜索 | ✅ 模糊搜索 + 字段感知 | ✅ 全局搜索 |
| 预览 | ✅ 终端内查看 | ✅ 图形化气泡 |
| Resume | ✅ | ✅ |
| 跨项目 | ✅ cross-project fork | ✅ 项目侧边栏 |
| 代码高亮 | ✅ syntect | ✅ Shiki |
| Markdown 渲染 | ✅ pulldown-cmark | ✅ react-markdown |
| 导出 | ✅ clipboard | ✅ 文件导出 |
| 缓存 | ✅ bincode | ✅ JSON/bincode |
| 性能 | ✅ rayon 并行 | ✅ 同样策略 |
| **GUI** | ❌ TUI only | ✅ 桌面 App |
| **项目分组视图** | ❌ 单项目视角 | ✅ 全局视角 |
| **时间线/统计** | ❌ | ✅ 热力图 + token 分析 |
| **暗色/亮色主题** | 部分 | ✅ 完整 |

### 4.3 Session Lens 的差异化

1. **GUI vs TUI**：Session Lens 提供真正的图形界面——消息气泡、代码高亮、diff 视图，视觉体验不在一个维度
2. **全局视角**：claude-history 是单项目视角（从项目目录启动），Session Lens 是全项目视角（侧边栏浏览 103 个项目）
3. **时间线和统计**：活动热力图、token 消耗分析——这些 TUI 做不了
4. **目标用户不同**：claude-history 给 CLI 极客用，Session Lens 给"想要 SourceTree 体验"的用户用

### 4.4 可复用的经验

1. **JSONL 解析逻辑**：claude-history 的 parser.rs 已解决了大量边界情况（content 类型不一致、流式消息重组等），可以参考
2. **缓存策略**：bincode 缓存 + mtime/size 校验是经过验证的方案
3. **搜索文本构建**：搜索文本归一化（normalize_for_search）的处理经验

---

## 5. 关键技术风险

| 风险 | 级别 | 说明 | 应对 |
|------|------|------|------|
| Rust 开发效率 | 🟡 中 | Rust 编译慢、调试难度高，可能影响迭代速度 | 后端逻辑边界清晰，前端迭代不受影响 |
| 大文件处理 | 🟢 低 | 73MB 的 JSONL 需要流式解析 | BufReader + 逐行解析，已有成熟方案 |
| JSONL 格式变更 | 🟡 中 | Claude Code 更新可能改变 JSONL 结构 | 宽松解析（unknown type skip），定期跟进上游 |
| Tauri WebView 一致性 | 🟡 中 | 不同平台 WebView 渲染可能有差异（尤其 Linux） | MVP 只做 macOS，后续逐步适配 |
| macOS 签名/公证 | 🟡 中 | 需要 Apple Developer 账号（$99/年） | 初期可以不签名（用户手动允许），后续付费 |
| Sub-agent 关联 | 🟢 低 | 需要将 subagent 文件和主会话正确关联 | 目录结构清晰（`{sessionId}/subagents/`），直接根据路径关联 |

---

## 6. 开发环境现状

| 工具 | 状态 | 需要安装 |
|------|------|----------|
| Rust (rustc + cargo) | ❌ 未安装 | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Node.js | ❌ 未配置（nvm lazy load 失败） | 修复 nvm 配置或直接安装 |
| pnpm | ❌ 未安装 | `npm install -g pnpm` |
| Tauri CLI | ❌ 未安装 | `cargo install tauri-cli` |

**首要任务**：搭建开发环境。预计 30 分钟。

---

## 7. 工作量预估

### 按 PRD 里程碑细化

| 阶段 | 内容 | 预估人天 |
|------|------|----------|
| **M0: 环境搭建** | Rust + Node + Tauri 安装，项目脚手架创建 | 0.5 天 |
| **M1: 骨架 & 数据层** | Rust JSONL 解析器 + bincode 缓存 + Tauri IPC + 三栏布局骨架 + 项目/会话列表 | 3 天 |
| **M2: 核心体验** | 对话详情视图 + 消息气泡 + 代码高亮 + tool_use 折叠 + 搜索 + Resume | 4 天 |
| **M3: 打磨 & 发布** | 主题 + 快捷键 + DMG 打包 + README | 2 天 |
| **总计** | | **~10 人天** |

### 风险调整

- 如果团队不熟悉 Rust：+2-3 天学习曲线
- 如果同时做 Linux/Windows：+2 天适配
- 如果 macOS 签名/公证：+1 天

---

## 8. 结论和建议

### 技术可行性：✅ 完全可行

1. **数据层**：JSONL 结构清晰、可解析，有竞品代码可参考，解析难度低
2. **性能**：分层加载 + bincode 缓存可以轻松达到 PRD 的性能目标
3. **技术栈**：Tauri v2 + Rust + React 是这类工具的最优选择
4. **差异化**：和 claude-history (TUI) 定位不同，互为补充而非竞争

### 建议

1. **先搭环境，先跑通 Hello World**：确认 Tauri v2 在当前机器上能编译运行
2. **JSONL 解析器优先**：这是核心模块，先做数据层，再做 UI
3. **参考但不 fork claude-history**：它是 TUI，架构差异太大，但解析逻辑和缓存策略值得参考
4. **MVP 只做 macOS**：跨平台适配放到后面
