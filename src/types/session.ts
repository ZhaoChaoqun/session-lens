export interface SessionMeta {
  id: string;
  project: string;
  projectPath: string;
  timestamp: number;
  summary: string;
  messageCount: number;
  branch: string;
  cwd: string;
  fileSize: number;
  inputTokens: number;
  outputTokens: number;
}

export interface ProjectInfo {
  name: string;
  path: string;
  encodedPath: string;
  sessionCount: number;
  lastActive: number;
}

export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "thinking"; thinking: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
  timestamp?: string;
  model?: string;
  uuid?: string;
}

export interface Conversation {
  id: string;
  messages: ConversationMessage[];
}
