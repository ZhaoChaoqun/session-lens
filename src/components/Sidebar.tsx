import type { ProjectInfo } from "../types/session";

interface SidebarProps {
  projects: ProjectInfo[];
  selectedProject: string | null;
  onSelectProject: (encodedPath: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Sidebar({ projects, selectedProject, onSelectProject, searchQuery, onSearchChange }: SidebarProps) {
  const totalSessions = projects.reduce((sum, p) => sum + p.sessionCount, 0);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">◎</span>
          <span className="sidebar-logo-text">Session Lens</span>
        </div>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          className="search-input"
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <nav className="sidebar-projects">
        {projects.map((project: ProjectInfo) => (
          <div
            key={project.encodedPath}
            className={`project-item ${selectedProject === project.encodedPath ? "project-item-selected" : ""}`}
            onClick={() => onSelectProject(project.encodedPath)}
          >
            <span className="project-name">{project.name}</span>
            <span className="project-badge">{project.sessionCount}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-settings">⚙</span>
        <span className="sidebar-stats">{projects.length} projects · {totalSessions.toLocaleString()} sessions</span>
      </div>
    </aside>
  );
}
