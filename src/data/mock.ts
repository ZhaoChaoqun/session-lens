import type { ProjectInfo, SessionMeta, Message } from "../types/session";

export const mockProjects: ProjectInfo[] = [
  { name: "session-lens", path: "/Users/demo/.claude/projects/session-lens", sessionCount: 7, lastActive: Date.now() },
  { name: "typeless", path: "/Users/demo/.claude/projects/typeless", sessionCount: 18, lastActive: Date.now() - 3600000 },
  { name: "claude-web-chat", path: "/Users/demo/.claude/projects/claude-web-chat", sessionCount: 13, lastActive: Date.now() - 7200000 },
  { name: "ai-pr", path: "/Users/demo/.claude/projects/ai-pr", sessionCount: 6, lastActive: Date.now() - 86400000 },
  { name: "cc-statistics", path: "/Users/demo/.claude/projects/cc-statistics", sessionCount: 2, lastActive: Date.now() - 86400000 * 2 },
  { name: "claude-island", path: "/Users/demo/.claude/projects/claude-island", sessionCount: 5, lastActive: Date.now() - 86400000 * 3 },
  { name: "bilibili-subtitle-blocker", path: "/Users/demo/.claude/projects/bilibili-subtitle-blocker", sessionCount: 1, lastActive: Date.now() - 86400000 * 5 },
  { name: "QwenASR", path: "/Users/demo/.claude/projects/QwenASR", sessionCount: 3, lastActive: Date.now() - 86400000 * 7 },
  { name: "Synapse", path: "/Users/demo/.claude/projects/Synapse", sessionCount: 5, lastActive: Date.now() - 86400000 * 10 },
  { name: "babys-food", path: "/Users/demo/.claude/projects/babys-food", sessionCount: 3, lastActive: Date.now() - 86400000 * 14 },
];

export interface SessionGroup {
  label: string;
  sessions: SessionMeta[];
}

const now = Date.now();
const hour = 3600000;
const day = 86400000;

export const mockSessions: SessionGroup[] = [
  {
    label: "TODAY",
    sessions: [
      {
        id: "78573ac2",
        project: "session-lens",
        projectPath: "/Users/demo/.claude/projects/session-lens",
        timestamp: now - 2 * hour,
        summary: "帮我调研一下业界是否已有类似的 Claude Code 会话管理工具",
        messageCount: 48,
        branch: "main",
        cwd: "/Users/demo/session-lens",
        fileSize: 2.3 * 1024 * 1024,
      },
      {
        id: "a3f9b1c4",
        project: "session-lens",
        projectPath: "/Users/demo/.claude/projects/session-lens",
        timestamp: now - 5 * hour,
        summary: "请输出一份完整的产品需求规格书 PRD",
        messageCount: 32,
        branch: "main",
        cwd: "/Users/demo/session-lens",
        fileSize: 1.1 * 1024 * 1024,
      },
    ],
  },
  {
    label: "YESTERDAY",
    sessions: [
      {
        id: "d7e2f8a1",
        project: "session-lens",
        projectPath: "/Users/demo/.claude/projects/session-lens",
        timestamp: now - day - 3 * hour,
        summary: "我想给 Claude Code 增加一个 conversation 预览功能",
        messageCount: 156,
        branch: "main",
        cwd: "/Users/demo/session-lens",
        fileSize: 5.2 * 1024 * 1024,
      },
      {
        id: "b4c6d9e2",
        project: "session-lens",
        projectPath: "/Users/demo/.claude/projects/session-lens",
        timestamp: now - day - 6 * hour,
        summary: "帮我分析 ~/.claude 目录下的数据结构",
        messageCount: 24,
        branch: "main",
        cwd: "/Users/demo/session-lens",
        fileSize: 0.8 * 1024 * 1024,
      },
    ],
  },
  {
    label: "THIS WEEK",
    sessions: [
      {
        id: "e5f1a2b3",
        project: "session-lens",
        projectPath: "/Users/demo/.claude/projects/session-lens",
        timestamp: now - 3 * day,
        summary: "Setup Tauri v2 project scaffolding with React",
        messageCount: 89,
        branch: "main",
        cwd: "/Users/demo/session-lens",
        fileSize: 3.1 * 1024 * 1024,
      },
      {
        id: "f6a2b3c4",
        project: "session-lens",
        projectPath: "/Users/demo/.claude/projects/session-lens",
        timestamp: now - 4 * day,
        summary: "请评估 Rust + Ratatui 的技术可行性",
        messageCount: 67,
        branch: "main",
        cwd: "/Users/demo/session-lens",
        fileSize: 2.0 * 1024 * 1024,
      },
    ],
  },
  {
    label: "EARLIER",
    sessions: [
      {
        id: "c3d4e5f6",
        project: "session-lens",
        projectPath: "/Users/demo/.claude/projects/session-lens",
        timestamp: now - 11 * day,
        summary: "项目初始化和 README 编写",
        messageCount: 12,
        branch: "main",
        cwd: "/Users/demo/session-lens",
        fileSize: 0.3 * 1024 * 1024,
      },
    ],
  },
];

export const mockMessages: Message[] = [
  {
    role: "user",
    content: "帮我调研一下业界是否已有类似的 Claude Code 会话管理工具，他们的完成度如何，交互流程是怎么样的？",
    timestamp: "2:30 PM",
  },
  {
    role: "assistant",
    content: "我来调研一下现有的 Claude Code 会话管理工具。",
    timestamp: "2:30 PM",
  },
  {
    role: "assistant",
    content: [
      { type: "tool_use", id: "tool_1", name: "WebSearch", input: { query: "claude code session manager 2026" } },
    ],
    timestamp: "2:30 PM",
  },
  {
    role: "assistant",
    content: [
      { type: "tool_use", id: "tool_2", name: "WebSearch", input: { query: "claude code conversation history browser" } },
    ],
    timestamp: "2:30 PM",
  },
  {
    role: "assistant",
    content: [
      { type: "tool_use", id: "tool_3", name: "Read file", input: { path: "package.json" } },
    ],
    timestamp: "2:30 PM",
  },
  {
    role: "assistant",
    content: '调研完成，以下是我找到的几个相关工具：\n\n## 1. claude-history (Rust CLI)\n- **GitHub**: 已有 200+ stars\n- **完成度**: 高 — 支持会话列表、搜索、预览\n- **交互**: 纯 CLI，使用 `fzf` 风格的模糊搜索\n\n## 2. claude-session-viewer (Web UI)\n- **完成度**: 中等 — 基础的 Web 界面\n- **技术栈**: Node.js + React\n\n## 3. cchat (MCP Server)\n- **完成度**: 早期 — 作为 MCP Server 运行\n- **限制**: 需要在 Claude Code 内部使用\n\n### 差异化机会\n没有一个工具达到了 **SourceTree 级别**的桌面端体验。这是我们的切入点。',
    timestamp: "2:31 PM",
  },
  {
    role: "user",
    content: "不错的分析。我们的产品定位就是做成桌面端 App，类似 SourceTree。请帮我评估一下用 Tauri v2 + React 的技术可行性。",
    timestamp: "2:35 PM",
  },
  {
    role: "assistant",
    content: [
      { type: "thinking", thinking: "Let me analyze the technical feasibility of using Tauri v2 with React for this desktop application..." },
    ],
    timestamp: "2:35 PM",
  },
  {
    role: "assistant",
    content: 'Tauri v2 是一个很好的选择，以下是技术评估：\n\n```toml\n# Cargo.toml\n[dependencies]\ntauri = { version = "2", features = ["shell-open"] }\nserde = { version = "1", features = ["derive"] }\nserde_json = "1"\ntokio = { version = "1", features = ["full"] }\n```\n\n**优势**：包体积小（~15MB vs Electron ~150MB），原生性能，Rust 后端可以高效解析 JSONL 文件。\n\n**评估结论**：推荐使用 Tauri v2 + React 19 + TypeScript + Tailwind CSS v4 的技术栈。',
    timestamp: "2:35 PM",
  },
  {
    role: "user",
    content: "好的，那我们就用这个技术栈。请帮我初始化项目。",
    timestamp: "2:40 PM",
  },
];
