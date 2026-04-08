# Google Stitch Prompt — Session Lens UI Prototype

> 将以下内容完整粘贴到 Google Stitch 的 prompt 输入框中。

---

```
Design a desktop application called "Session Lens" — a session browser and manager for Claude Code (an AI coding assistant that runs in the terminal). Think of it as "SourceTree for Claude Code conversations." The app lets users visually browse, search, preview, and resume their Claude Code chat history.

## App Overview

Session Lens reads local JSONL files from ~/.claude/projects/ and displays all historical AI coding conversations organized by project. It is a read-only viewer (no editing of conversations). The visual style should feel like a modern macOS native app — clean, minimal, professional — similar to SourceTree, Linear, or Raycast.

## Window & Layout

Full desktop window (1280×800 default size). Three-column layout:

### Column 1 — Project Sidebar (left, fixed 200px wide)
- Dark background (#1A1A1A)
- Top: App logo/name "Session Lens" in small, subtle text with a lens/magnifier icon
- Below: A search input field with placeholder "Search sessions..." with a magnifier icon, rounded corners, background #2A2A2A, text #808080
- Below the search: project list, each item is:
  - Project name in white text (#E0E0E0), 13px, medium weight
  - Session count as a small badge on the right side, muted color (#666666), like "18"
  - The currently selected project has a subtle blue left border (3px, #007ACC) and slightly lighter background (#252526)
  - Projects sorted by most recently active first
- Scrollable if many projects

Show these exact projects in order (mock data):
1. "session-lens" (7) — selected
2. "typeless" (18)
3. "claude-web-chat" (13)
4. "ai-pr" (6)
5. "cc-statistics" (2)
6. "claude-island" (5)
7. "bilibili-subtitle-blocker" (1)
8. "QwenASR" (3)
9. "Synapse" (5)
10. "babys-food" (3)

At the very bottom of the sidebar: a small settings gear icon (#666666) and a text "128 projects · 4,687 sessions" in very small muted text (#555555).

### Column 2 — Session List (middle, 300px wide)
- Background: #1E1E1E
- Sessions grouped by time with section headers:

**Section header style**: Uppercase text, 11px, #666666, with a thin separator line (#333333) below, padding 12px left, 8px top/bottom. Like "TODAY", "YESTERDAY", "THIS WEEK", "EARLIER".

**Session item style**: Each is a card-like row, padding 12px 16px, with:
- First line: Session summary text in #CCCCCC, 13px, medium weight, single line truncated with ellipsis. This is the first user message in the conversation.
- Second line: Relative time on left (#777777, 11px, like "2 hours ago"), message count on right (#555555, 11px, like "24 msgs")
- Selected session: background #2A2A2A with a left blue border (3px, #007ACC)
- Hover: background #252525

**Show these exact sessions for the selected project "session-lens" (mock data):**

TODAY section:
- "帮我调研一下业界是否已有类似的 Claude Code 会话管理工具" · 2 hours ago · 48 msgs  ← SELECTED
- "请输出一份完整的产品需求规格书 PRD" · 5 hours ago · 32 msgs

YESTERDAY section:
- "我想给 Claude Code 增加一个 conversation 预览功能" · Yesterday · 156 msgs
- "帮我分析 ~/.claude 目录下的数据结构" · Yesterday · 24 msgs

THIS WEEK section:
- "Setup Tauri v2 project scaffolding with React" · Apr 5 · 89 msgs
- "请评估 Rust + Ratatui 的技术可行性" · Apr 4 · 67 msgs

EARLIER section:
- "项目初始化和 README 编写" · Mar 28 · 12 msgs

At the bottom of the session list, a thin status bar: "7 sessions · branch: main" in #555555, 11px.

### Column 3 — Conversation Detail (right, fills remaining space)
- Background: #1E1E1E
- Top: A header bar (height 48px, background #1A1A1A, border-bottom 1px #333333) containing:
  - Left side: Session title (the summary text) in white, 14px, medium weight, truncated
  - Right side: Three icon buttons in a row, each 32×32px with tooltips:
    - Play/Resume icon (▶) with blue color #007ACC — tooltip "Resume in terminal"
    - Download/Export icon — tooltip "Export as Markdown" 
    - Trash/Delete icon in muted red (#994444) — tooltip "Delete session"
  
- Below header: The conversation message stream, scrollable. This is the main content area.

**Message rendering (IMPORTANT — this is the core of the app):**

Show this exact conversation for the selected session (mock data). Render it as a beautiful chat interface:

---

**User message style**: 
- Small avatar area on the left: A circle (28px) with "U" letter or a user icon, background #007ACC
- Right of avatar: The message content
- Name "User" in bold #CCCCCC, 12px, with timestamp "#808080, 11px" to the right like "2:30 PM"
- Message text in #E0E0E0, 14px, line-height 1.6
- Slight left padding to align with the avatar
- NO background bubble — clean and flat, like Slack or Linear

**Assistant message style**:
- Small avatar: A circle (28px) with a sparkle/star icon ✦ or "A", background #6B4FBB (purple)
- Name "Claude" in bold #CCCCCC, 12px, with timestamp
- Message text in #D4D4D4, 14px, supports full Markdown rendering
- Code blocks: background #141414, rounded 8px, with language label on top-right and a copy button icon
- Inline code: background #2A2A2A, rounded 4px, padding 2px 6px

**Tool use blocks (collapsed by default)**:
- Rendered as a compact single-line with an expand chevron (▶)
- Icon: wrench 🔧 emoji or icon
- Background: #1A1A1A, rounded 8px, border 1px #333333, padding 8px 12px
- Text like: "🔧 Read file — src/benchmark/runner.rs" in #888888, 12px
- Or: "🔧 Bash — cargo test --release" 
- Or: "🔧 Edit — src/lib.rs (3 lines changed)"
- Clicking expands to show the full tool input/output

**Thinking blocks (collapsed by default)**:
- Similar compact style: "💭 Thinking... (click to expand)" in #666666, italic, 12px
- Background: transparent, border-left 2px #333333, padding-left 12px

**Show this exact conversation:**

1. **User** (2:30 PM): 
   "帮我调研一下业界是否已有类似的 Claude Code 会话管理工具，他们的完成度如何，交互流程是怎么样的？"

2. **Claude** (2:30 PM):
   "我来调研一下现有的 Claude Code 会话管理工具。"
   
   Then show 3 collapsed tool blocks:
   - 🔧 WebSearch — "claude code session manager 2026"
   - 🔧 WebSearch — "claude code conversation history browser"  
   - 🔧 Read file — package.json

3. **Claude** (2:31 PM) — long response with Markdown:
   "调研完成，以下是我找到的几个相关工具：

   ## 1. claude-history (Rust CLI)
   - **GitHub**: 已有 200+ stars
   - **完成度**: 高 — 支持会话列表、搜索、预览
   - **交互**: 纯 CLI，使用 `fzf` 风格的模糊搜索
   
   ## 2. claude-session-viewer (Web UI)  
   - **完成度**: 中等 — 基础的 Web 界面
   - **技术栈**: Node.js + React
   
   ## 3. cchat (MCP Server)
   - **完成度**: 早期 — 作为 MCP Server 运行
   - **限制**: 需要在 Claude Code 内部使用
   
   ### 差异化机会
   没有一个工具达到了 **SourceTree 级别**的桌面端体验。这是我们的切入点。"

   (Render the headers, bold text, bullet points properly as Markdown)

4. **User** (2:35 PM):
   "不错的分析。我们的产品定位就是做成桌面端 App，类似 SourceTree。请帮我评估一下用 Tauri v2 + React 的技术可行性。"

5. **Claude** (2:35 PM):
   Show a collapsed thinking block: "💭 Thinking... (click to expand)"
   
   Then the response:
   "Tauri v2 是一个很好的选择，以下是技术评估："
   
   Then show a code block:
   ```toml
   # Cargo.toml
   [dependencies]
   tauri = { version = "2", features = ["shell-open"] }
   serde = { version = "1", features = ["derive"] }
   serde_json = "1"
   tokio = { version = "1", features = ["full"] }
   ```
   
   "**优势**：包体积小（~15MB vs Electron ~150MB），原生性能，Rust 后端可以高效解析 JSONL 文件。
   
   **评估结论**：推荐使用 Tauri v2 + React 19 + TypeScript + Tailwind CSS v4 的技术栈。"

6. **User** (2:40 PM):
   "好的，那我们就用这个技术栈。请帮我初始化项目。"

---

**End of conversation mock data. Below the last message, show some empty space (the conversation is scrollable).**

At the very bottom of the detail panel, a thin metadata bar (32px, background #1A1A1A, border-top 1px #333333):
- Left: "Session: 78573ac2..." in #555555, 11px (truncated UUID)
- Center: "Apr 8, 2026 · 48 messages · 2.3 MB" in #555555, 11px  
- Right: "branch: main" in #555555, 11px

## Global Design Requirements

### Color Theme (Dark Mode)
- Window background: #1E1E1E
- Sidebar background: #1A1A1A  
- Card/elevated surfaces: #252526
- Primary text: #CCCCCC
- Secondary text: #808080
- Muted text: #555555
- Accent/selection: #007ACC (blue)
- Borders/separators: #333333
- Code block background: #141414
- Danger/delete: #994444
- Success/online: #4EC9B0

### Typography
- App font: SF Pro Text or Inter, system sans-serif fallback
- Monospace (code): SF Mono, JetBrains Mono, Menlo
- Body text: 13-14px
- Small/meta: 11px
- Headers in conversation: 16px bold

### Window Chrome
- Native macOS title bar with traffic light buttons (red/yellow/green circles) in the top-left
- Title text "Session Lens" centered in title bar, 13px, #808080
- The title bar area can be slightly transparent/blurred (vibrancy effect) like native macOS

### Corner Radius
- Window: macOS native (10px)
- Cards/panels: 8px
- Buttons: 6px  
- Input fields: 8px
- Code blocks: 8px
- Avatars: 50% (circle)

### Spacing System
- Base unit: 4px
- Panel gaps: 0px (panels are separated only by 1px border lines, not gaps — like VS Code or SourceTree)
- Content padding: 12-16px
- Between message blocks: 16px
- Between tool/thinking blocks and messages: 8px

### Scrollbar Style
- Thin (6px), rounded, color #444444, only visible on hover (macOS overlay style)

## What NOT to include
- No onboarding or login screens
- No settings panel (just show the gear icon)
- No loading states — show the fully loaded state
- No empty states — show with data populated
- No modals or pop-ups
- No mobile layout — this is desktop only

## Summary
Create a single, complete screenshot of the Session Lens desktop application showing:
1. Left sidebar with project list (session-lens selected with blue indicator)
2. Middle column with time-grouped session list (first session selected)  
3. Right column showing a realistic conversation with user messages, Claude responses with Markdown rendering, collapsed tool use blocks, collapsed thinking block, and a code block with syntax highlighting
4. Dark theme throughout, macOS native window chrome
5. Clean, professional, minimal — inspired by Linear, Raycast, and SourceTree
```

---

## 使用说明

1. 打开 [Google Stitch](https://stitch.withgoogle.com/)
2. 将上面 ``` 代码块内的完整内容粘贴到 prompt 输入框
3. 点击 Generate
4. 如果生成结果不满意，可以追加以下微调 prompt：

### 微调 prompt 备选

**如果侧边栏太宽或太窄**：
```
Make the project sidebar exactly 200px wide. Make the session list column exactly 300px wide. The conversation detail should fill the remaining space.
```

**如果消息渲染不够 chat-like**：
```
Make the conversation look more like Slack or Discord — flat design with avatars, no chat bubbles. User messages and Claude messages should be visually distinct through avatar color (blue for user, purple for Claude) and name labels.
```

**如果代码块不够好看**：
```
The code block should have a dark background (#141414), rounded corners (8px), a language label "toml" in the top-right corner in muted text, and a small copy icon button. Use syntax highlighting with colors similar to VS Code dark theme.
```

**如果想看亮色主题版本**：
```
Now create a light theme version. Background: #FFFFFF, sidebar: #F5F5F5, text: #1E1E1E, secondary: #666666, accent: #007ACC, borders: #E0E0E0, code blocks: #F5F5F5.
```

**如果想看搜索状态**：
```
Show the state where the user has typed "benchmark" in the search bar. The session list should be filtered to show only matching sessions across all projects. Each result shows the project name as a small tag before the session summary. Matching text "benchmark" should be highlighted in yellow.
```
