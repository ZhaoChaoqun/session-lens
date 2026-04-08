import type { ReactNode } from "react";
import { useState } from "react";
import { mockMessages } from "../data/mock";
import type { Message, ContentBlock } from "../types/session";

function ToolBlock({ block }: { block: ContentBlock & { type: "tool_use" } }) {
  const [expanded, setExpanded] = useState(false);

  const label = block.name === "WebSearch"
    ? `WebSearch — "${(block.input as { query?: string }).query || ""}"`
    : block.name === "Read file"
    ? `Read file — ${(block.input as { path?: string }).path || ""}`
    : `${block.name}`;

  return (
    <div className="tool-block" onClick={() => setExpanded(!expanded)}>
      <span className="tool-block-chevron">{expanded ? "▼" : "▶"}</span>
      <span className="tool-block-icon">🔧</span>
      <span className="tool-block-label">{label}</span>
    </div>
  );
}

function ThinkingBlock() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="thinking-block" onClick={() => setExpanded(!expanded)}>
      <span className="thinking-block-chevron">{expanded ? "▼" : "▶"}</span>
      <span className="thinking-block-label">💡 Thinking... (click to expand)</span>
    </div>
  );
}

function renderMarkdown(text: string): ReactNode[] {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "";
  let blockKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${blockKey++}`} className="code-block">
            <div className="code-block-header">
              <span className="code-block-lang">{codeLang}</span>
              <button className="code-block-copy">Copy</button>
            </div>
            <pre><code>{codeLines.join("\n")}</code></pre>
          </div>
        );
        codeLines = [];
        codeLang = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(<h3 key={`h3-${i}`} className="md-h3">{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={`h2-${i}`} className="md-h2">{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("- ")) {
      elements.push(<li key={`li-${i}`} className="md-li">{renderInline(line.slice(2))}</li>);
    } else if (line.trim() === "") {
      elements.push(<div key={`br-${i}`} className="md-break" />);
    } else {
      elements.push(<p key={`p-${i}`} className="md-p">{renderInline(line)}</p>);
    }
  }

  return elements;
}

function renderInline(text: string): (string | ReactNode)[] {
  const parts: (string | ReactNode)[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // inline code
    const codeMatch = remaining.match(/`([^`]+)`/);

    let firstMatch: { index: number; length: number; element: ReactNode; type: string } | null = null;

    if (boldMatch?.index !== undefined) {
      firstMatch = {
        index: boldMatch.index,
        length: boldMatch[0].length,
        element: <strong key={`b-${keyIdx++}`}>{boldMatch[1]}</strong>,
        type: "bold",
      };
    }

    if (codeMatch?.index !== undefined) {
      if (!firstMatch || codeMatch.index < firstMatch.index) {
        firstMatch = {
          index: codeMatch.index,
          length: codeMatch[0].length,
          element: <code key={`c-${keyIdx++}`} className="inline-code">{codeMatch[1]}</code>,
          type: "code",
        };
      }
    }

    if (firstMatch) {
      if (firstMatch.index > 0) {
        parts.push(remaining.slice(0, firstMatch.index));
      }
      parts.push(firstMatch.element);
      remaining = remaining.slice(firstMatch.index + firstMatch.length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  // Handle tool_use content blocks
  if (Array.isArray(message.content)) {
    const blocks = message.content as ContentBlock[];
    return (
      <>
        {blocks.map((block, idx) => {
          if (block.type === "tool_use") {
            return <ToolBlock key={idx} block={block} />;
          }
          if (block.type === "thinking") {
            return <ThinkingBlock key={idx} />;
          }
          return null;
        })}
      </>
    );
  }

  return (
    <div className="message">
      <div className="message-avatar">
        <div className={`avatar ${isUser ? "avatar-user" : "avatar-assistant"}`}>
          {isUser ? "U" : "✦"}
        </div>
      </div>
      <div className="message-body">
        <div className="message-header">
          <span className="message-name">{isUser ? "User" : "Claude"}</span>
          <span className="message-time">{message.timestamp}</span>
        </div>
        <div className={`message-content ${isUser ? "message-content-user" : "message-content-assistant"}`}>
          {typeof message.content === "string"
            ? renderMarkdown(message.content)
            : null}
        </div>
      </div>
    </div>
  );
}

export function DetailView() {
  return (
    <main className="detail-view">
      <div className="detail-header">
        <span className="detail-title">帮我调研一下业界是否已有类似的 Claude Code 会话管理工具</span>
        <div className="detail-actions">
          <button className="detail-btn detail-btn-resume" title="Resume in terminal">▶</button>
          <button className="detail-btn detail-btn-export" title="Export as Markdown">↓</button>
        </div>
      </div>

      <div className="detail-messages">
        {mockMessages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
      </div>

      <div className="detail-footer">
        <span>Session: 78573ac2...</span>
        <span>Apr 8, 2026 · 48 messages · 2.3 MB</span>
        <span>branch: main</span>
      </div>
    </main>
  );
}
