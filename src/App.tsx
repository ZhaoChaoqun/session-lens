import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar - Projects */}
      <aside className="w-48 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-3 font-semibold text-sm text-gray-500 uppercase tracking-wider">
          Projects
        </div>
        <nav className="flex-1 overflow-y-auto px-2">
          <div className="px-2 py-1.5 rounded text-sm bg-blue-50 text-blue-700 font-medium">
            session-lens
          </div>
          <div className="px-2 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-200 cursor-pointer">
            claude-history
          </div>
          <div className="px-2 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-200 cursor-pointer">
            typeless
          </div>
        </nav>
        <div className="p-2 border-t border-gray-200 text-xs text-gray-400">
          3 projects · 42 sessions
        </div>
      </aside>

      {/* Session List */}
      <section className="w-72 border-r border-gray-200 flex flex-col">
        <div className="p-3">
          <input
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search sessions..."
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-1 text-xs font-medium text-gray-400 uppercase">Today</div>
          <div className="px-3 py-2 bg-blue-50 border-l-2 border-blue-500 cursor-pointer">
            <div className="text-sm font-medium text-gray-800 truncate">
              Setup Tauri project scaffold
            </div>
            <div className="text-xs text-gray-500 mt-0.5">10:30 · 12 messages</div>
          </div>
          <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
            <div className="text-sm text-gray-700 truncate">
              Fix notification hook
            </div>
            <div className="text-xs text-gray-500 mt-0.5">09:15 · 48 messages</div>
          </div>
          <div className="px-3 py-1 text-xs font-medium text-gray-400 uppercase mt-2">Yesterday</div>
          <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
            <div className="text-sm text-gray-700 truncate">
              JSONL parser implementation
            </div>
            <div className="text-xs text-gray-500 mt-0.5">16:20 · 86 messages</div>
          </div>
        </div>
      </section>

      {/* Detail View */}
      <main className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Session Lens</h2>
          <p className="text-sm text-gray-500">Tauri + React + TypeScript + Tailwind CSS v4</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="max-w-2xl">
            <div className="text-xs text-gray-400 mb-1">User</div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <p className="text-sm">Hello! This is the Session Lens scaffold.</p>
            </div>
          </div>
          <div className="max-w-2xl">
            <div className="text-xs text-gray-400 mb-1">Assistant</div>
            <div className="rounded-lg p-3">
              <p className="text-sm text-gray-700">
                Welcome to <strong>Session Lens</strong> — your SourceTree for Claude Code conversations.
              </p>
            </div>
          </div>

          {/* Greet demo */}
          <div className="max-w-2xl mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Tauri IPC test:</p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                greet();
              }}
            >
              <input
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder="Enter a name..."
              />
              <button
                type="submit"
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Greet
              </button>
            </form>
            {greetMsg && (
              <p className="mt-2 text-sm text-green-700">{greetMsg}</p>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="px-4 py-2 border-t border-gray-200 flex justify-between text-xs text-gray-400">
          <span>Session: scaffold-demo</span>
          <span>v0.1.0</span>
        </div>
      </main>
    </div>
  );
}

export default App;
