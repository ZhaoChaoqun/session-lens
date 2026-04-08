import { mockSessions } from "../data/mock";
import type { SessionMeta } from "../types/session";

interface SessionListProps {
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "Yesterday";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SessionList({ selectedSessionId, onSelectSession }: SessionListProps) {
  return (
    <section className="session-list">
      <div className="session-list-content">
        {mockSessions.map((group) => (
          <div key={group.label}>
            <div className="session-group-header">
              <span>{group.label}</span>
            </div>
            {group.sessions.map((session: SessionMeta) => (
              <div
                key={session.id}
                className={`session-item ${selectedSessionId === session.id ? "session-item-selected" : ""}`}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="session-summary">{session.summary}</div>
                <div className="session-meta">
                  <span>{formatRelativeTime(session.timestamp)}</span>
                  <span>{session.messageCount} msgs</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="session-list-footer">
        7 sessions · branch: main
      </div>
    </section>
  );
}
