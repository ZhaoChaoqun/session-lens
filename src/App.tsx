import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ProjectInfo, SessionMeta, Conversation } from "./types/session";
import { Sidebar } from "./components/Sidebar";
import { SessionList } from "./components/SessionList";
import { DetailView } from "./components/DetailView";
import "./App.css";

function App() {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke<ProjectInfo[]>("list_projects")
      .then(setProjects)
      .catch((e) => setError(String(e)));
  }, []);

  const selectProject = useCallback(async (encodedPath: string) => {
    setSelectedProject(encodedPath);
    setSelectedSession(null);
    setConversation(null);
    setError(null);
    setLoading(true);
    try {
      const result = await invoke<SessionMeta[]>("list_sessions", {
        projectEncodedPath: encodedPath,
      });
      setSessions(result);
    } catch (e) {
      setError(String(e));
      setSessions([]);
    }
    setLoading(false);
  }, []);

  const selectSession = useCallback(async (sessionId: string) => {
    if (!selectedProject) return;
    setSelectedSession(sessionId);
    setError(null);
    setLoading(true);
    try {
      const result = await invoke<Conversation>("get_conversation", {
        projectEncodedPath: selectedProject,
        sessionId,
      });
      setConversation(result);
    } catch (e) {
      setError(String(e));
      setConversation(null);
    }
    setLoading(false);
  }, [selectedProject]);

  const selectedMeta = sessions.find((s) => s.id === selectedSession) ?? null;

  return (
    <div className="app-container">
      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={selectProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <SessionList
        sessions={sessions}
        selectedSessionId={selectedSession}
        onSelectSession={selectSession}
        searchQuery={searchQuery}
        loading={loading && !conversation}
        selectedProject={selectedProject}
      />
      <DetailView
        conversation={conversation}
        sessionMeta={selectedMeta}
        loading={loading && !!selectedSession && !conversation}
        error={error}
      />
    </div>
  );
}

export default App;
