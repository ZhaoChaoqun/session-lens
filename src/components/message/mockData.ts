import type { Message } from "../../types/session";

export const mockMessages: Message[] = [
  {
    role: "user",
    content: "帮我调研一下业界是否已有类似的 Claude Code 会话管理工具，他们的完成度如何，交互流程是怎么样的？",
    timestamp: "2:30 PM",
  },
  {
    role: "assistant",
    content: [
      { type: "text", text: "我来调研一下现有的 Claude Code 会话管理工具。" },
      {
        type: "tool_use",
        id: "tool_1",
        name: "WebSearch",
        input: { query: "claude code session manager 2026" },
      },
      {
        type: "tool_use",
        id: "tool_2",
        name: "WebSearch",
        input: { query: "claude code conversation history browser" },
      },
      {
        type: "tool_use",
        id: "tool_3",
        name: "Read file",
        input: { path: "package.json" },
      },
    ],
    timestamp: "2:30 PM",
  },
  {
    role: "assistant",
    content: `调研完成，以下是我找到的几个相关工具：

## 1. claude-history (Rust CLI)
- **GitHub**: 已有 200+ stars
- **完成度**: 高 — 支持会话列表、搜索、预览
- **交互**: 纯 CLI，使用 \`fzf\` 风格的模糊搜索

## 2. claude-session-viewer (Web UI)
- **完成度**: 中等 — 基础的 Web 界面
- **技术栈**: Node.js + React

## 3. cchat (MCP Server)
- **完成度**: 早期 — 作为 MCP Server 运行
- **限制**: 需要在 Claude Code 内部使用

### 差异化机会
没有一个工具达到了 **SourceTree 级别**的桌面端体验。这是我们的切入点。`,
    timestamp: "2:31 PM",
  },
  {
    role: "user",
    content:
      "不错的分析。我们的产品定位就是做成桌面端 App，类似 SourceTree。请帮我评估一下用 Tauri v2 + React 的技术可行性。",
    timestamp: "2:35 PM",
  },
  {
    role: "assistant",
    content: [
      { type: "thinking", thinking: "用户想评估 Tauri v2 + React 的技术可行性。我需要从以下几个维度分析：\n\n1. Tauri v2 的成熟度和社区支持\n2. 与 React 的集成情况\n3. 性能对比（vs Electron）\n4. 文件系统访问能力\n5. 跨平台支持\n\n这是一个很务实的选择，让我详细分析一下。" },
      {
        type: "text",
        text: `Tauri v2 是一个很好的选择，以下是技术评估：

\`\`\`toml
# Cargo.toml
[dependencies]
tauri = { version = "2", features = ["shell-open"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
\`\`\`

**优势**：包体积小（~15MB vs Electron ~150MB），原生性能，Rust 后端可以高效解析 JSONL 文件。

**评估结论**：推荐使用 Tauri v2 + React 19 + TypeScript + Tailwind CSS v4 的技术栈。`,
      },
    ],
    timestamp: "2:35 PM",
  },
  {
    role: "user",
    content: "好的，那我们就用这个技术栈。请帮我初始化项目。",
    timestamp: "2:40 PM",
  },
];
