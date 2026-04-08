import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { SessionList } from "./components/SessionList";
import { DetailView } from "./components/DetailView";
import "./App.css";

function App() {
  const [selectedProject, setSelectedProject] = useState("session-lens");
  const [selectedSession, setSelectedSession] = useState("78573ac2");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="app-container">
      <Sidebar
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <SessionList
        selectedSessionId={selectedSession}
        onSelectSession={setSelectedSession}
      />
      <DetailView />
    </div>
  );
}

export default App;
