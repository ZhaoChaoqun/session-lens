import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ProjectInfo, SessionMeta, Conversation } from "./types/session";
import "./App.css";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  } else {
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function extractTextContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((b: Record<string, unknown>) => b.type === "text" || b.type === "thinking" || b.type === "tool_use")
      .map((b: Record<string, unknown>) => {
        if (b.type === "text") return b.text as string;
        if (b.type === "thinking") return `[thinking] ${(b.thinking as string || "").slice(0, 100)}...`;
        if (b.type === "tool_use") return `[tool: ${b.name}]`;
        return "";
      })
      .join("\n");
  }
  return "";
}

function App() {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    invoke<ProjectInfo[]>("list_projects")
      .then(setProjects)
      .catch(console.error);
  }, []);

  const selectProject = useCallback(async (encodedPath: string) => {
    setSelectedProject(encodedPath);
    setSelectedSession(null);
    setConversation(null);
    setLoading(true);
    try {
      const result = await invoke<SessionMeta[]>("list_sessions", {
        projectEncodedPath: encodedPath,
      });
      setSessions(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  const selectSession = useCallback(async (meta: SessionMeta) => {
    setSelectedSession(meta.id);
    setLoading(true);
    try {
      const result = await invoke<Conversation>("get_conversation", {
        projectEncodedPath: selectedProject,
        sessionId: meta.id,
      });
      setConversation(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [selectedProject]);

  const filteredSessions = search
    ? sessions.filter(
        (s) =>
          s.summary.toLowerCase().includes(search.toLowerCase()) ||
          s.branch.toLowerCase().includes(search.toLowerCase())
      )
    : sessions;

  const totalSessions = projects.reduce((sum, p) => sum + p.sessionCount, 0);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar - Projects */}
      <aside className="w-48 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-3 font-semibold text-sm text-gray-500 uppercase tracking-wider">
          Projects
        </div>
        <nav className="flex-1 overflow-y-auto px-2">
          {projects.map((p) => (
            <div
              key={p.encodedPath}
              className={`px-2 py-1.5 rounded text-sm cursor-pointer flex justify-between items-center ${
                selectedProject === p.encodedPath
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => selectProject(p.encodedPath)}
            >
              <span className="truncate">{p.name}</span>
              <span className="text-xs text-gray-400 ml-1">{p.sessionCount}</span>
            </div>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-200 text-xs text-gray-400">
          {projects.length} projects · {totalSessions} sessions
        </div>
      </aside>

      {/* Session List */}
      <section className="w-72 border-r border-gray-200 flex flex-col">
        <div className="p-3">
          <input
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && !conversation && (
            <div className="p-4 text-sm text-gray-400 text-center">Loading...</div>
          )}
          {!selectedProject && (
            <div className="p-4 text-sm text-gray-400 text-center">
              Select a project to browse sessions
            </div>
          )}
          {filteredSessions.map((s) => (
            <div
              key={s.id}
              className={`px-3 py-2 cursor-pointer ${
                selectedSession === s.id
                  ? "bg-blue-50 border-l-2 border-blue-500"
                  : "hover:bg-gray-100 border-l-2 border-transparent"
              }`}
              onClick={() => selectSession(s)}
            >
              <div className="text-sm text-gray-800 truncate">{s.summary}</div>
              <div className="text-xs text-gray-500 mt-0.5 flex gap-2">
                <span>{formatTime(s.timestamp)}</span>
                <span>·</span>
                <span>{s.messageCount} msgs</span>
                <span>·</span>
                <span>{formatSize(s.fileSize)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detail View */}
      <main className="flex-1 flex flex-col">
        {conversation ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold truncate">
                {sessions.find((s) => s.id === selectedSession)?.summary || "Conversation"}
              </h2>
              <p className="text-sm text-gray-500">
                {conversation.messages.length} messages · ID: {conversation.id.slice(0, 8)}...
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.messages.map((msg, i) => (
                <div key={i} className="max-w-3xl">
                  <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                    <span>{msg.role === "user" ? "User" : "Assistant"}</span>
                    {msg.timestamp && (
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    )}
                    {msg.model && <span className="text-gray-300">({msg.model})</span>}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-white shadow-sm border border-gray-200"
                        : "bg-transparent"
                    }`}
                  >
                    <pre className="text-sm whitespace-pre-wrap break-words font-sans">
                      {extractTextContent(msg.content)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <h2 className="text-2xl font-semibold mb-2">Session Lens</h2>
              <p className="text-sm">Select a project and session to preview</p>
            </div>
          </div>
        )}

        {/* Status bar */}
        <div className="px-4 py-2 border-t border-gray-200 flex justify-between text-xs text-gray-400">
          <span>
            {selectedProject
              ? projects.find((p) => p.encodedPath === selectedProject)?.name || ""
              : "No project selected"}
          </span>
          <span>v0.1.0</span>
        </div>
      </main>
    </div>
  );
}

export default App;
