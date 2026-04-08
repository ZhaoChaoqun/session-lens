import type { SessionMeta } from "../types/session";

interface SessionListProps {
  sessions: SessionMeta[];
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
  searchQuery: string;
  loading: boolean;
  selectedProject: string | null;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function SessionList({ sessions, selectedSessionId, onSelectSession, searchQuery, loading, selectedProject }: SessionListProps) {
  const filtered = searchQuery
    ? sessions.filter(
        (s) =>
          s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.branch.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions;

  return (
    <section className="session-list">
      <div className="session-list-content">
        {loading && (
          <div className="session-loading">Loading sessions...</div>
        )}
        {!selectedProject && !loading && (
          <div className="session-loading">Select a project to browse sessions</div>
        )}
        {selectedProject && !loading && filtered.length === 0 && (
          <div className="session-loading">
            {searchQuery ? "No matching sessions" : "No sessions found"}
          </div>
        )}
        {filtered.map((session: SessionMeta) => (
          <div
            key={session.id}
            className={`session-item ${selectedSessionId === session.id ? "session-item-selected" : ""}`}
            onClick={() => onSelectSession(session.id)}
          >
            <div className="session-summary">{session.summary}</div>
            <div className="session-meta">
              <span>{formatRelativeTime(session.timestamp)}</span>
              <span>{session.messageCount} msgs · {formatSize(session.fileSize)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="session-list-footer">
        {selectedProject
          ? `${filtered.length} sessions${filtered.length !== sessions.length ? ` (${sessions.length} total)` : ""}`
          : "No project selected"}
      </div>
    </section>
  );
}
