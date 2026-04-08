import type { Conversation, SessionMeta } from "../types/session";
import { MessageList } from "./message";

interface DetailViewProps {
  conversation: Conversation | null;
  sessionMeta: SessionMeta | null;
  loading: boolean;
  error: string | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DetailView({ conversation, sessionMeta, loading, error }: DetailViewProps) {
  if (error) {
    return (
      <main className="detail-view">
        <div className="detail-empty">
          <span className="detail-empty-icon">⚠</span>
          <span className="detail-empty-text">{error}</span>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="detail-view">
        <div className="detail-empty">
          <span className="detail-empty-text">Loading conversation...</span>
        </div>
      </main>
    );
  }

  if (!conversation || !sessionMeta) {
    return (
      <main className="detail-view">
        <div className="detail-empty">
          <span className="detail-empty-icon">◎</span>
          <h2 className="detail-empty-title">Session Lens</h2>
          <span className="detail-empty-text">Select a project and session to preview</span>
        </div>
      </main>
    );
  }

  return (
    <main className="detail-view">
      <div className="detail-header">
        <span className="detail-title">{sessionMeta.summary}</span>
        <div className="detail-actions">
          <button className="detail-btn detail-btn-resume" title="Resume in terminal">▶</button>
          <button className="detail-btn detail-btn-export" title="Export as Markdown">↓</button>
        </div>
      </div>

      <div className="detail-messages">
        <MessageList messages={conversation.messages} />
      </div>

      <div className="detail-footer">
        <span>Session: {sessionMeta.id.slice(0, 8)}...</span>
        <span>{formatDate(sessionMeta.timestamp)} · {sessionMeta.messageCount} messages · {formatSize(sessionMeta.fileSize)}</span>
        <span>branch: {sessionMeta.branch || "—"}</span>
      </div>
    </main>
  );
}
