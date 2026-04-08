import { useState } from "react";

interface ToolUseBlockProps {
  name: string;
  input: Record<string, unknown>;
}

function getToolSummary(name: string, input: Record<string, unknown>): string {
  if (name === "WebSearch" && input.query) return String(input.query);
  if (name === "Read file" && input.path) return String(input.path);
  if (name === "Bash" && input.command) return String(input.command);
  if (name === "Edit" && input.file_path) {
    const lines = input.new_string ? String(input.new_string).split("\n").length : 0;
    return `${input.file_path} (${lines} lines changed)`;
  }
  const firstValue = Object.values(input)[0];
  return firstValue ? String(firstValue) : "";
}

export function ToolUseBlock({ name, input }: ToolUseBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const summary = getToolSummary(name, input);

  return (
    <div className="my-2.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] bg-[rgba(99,102,241,0.04)] border border-[rgba(99,102,241,0.08)] hover:bg-[rgba(99,102,241,0.07)] transition-colors cursor-pointer text-left"
      >
        <span
          className="text-[10px] text-[#8B5CF6] transition-transform duration-200"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0)" }}
        >
          ▶
        </span>
        <span className="text-[13px]">🔧</span>
        <span className="text-[12px] font-medium text-[#888]">
          {name}
        </span>
        {summary && (
          <>
            <span className="text-[12px] text-[#CCC]">—</span>
            <span className="text-[12px] text-[#888] truncate">
              {summary}
            </span>
          </>
        )}
      </button>

      {expanded && (
        <div className="mt-1.5 ml-7 px-3.5 py-2.5 rounded-lg bg-[rgba(0,0,0,0.02)] border border-[rgba(0,0,0,0.04)] text-[12px] font-[SF_Mono,JetBrains_Mono,Menlo,monospace] text-[#666] whitespace-pre-wrap break-all">
          {JSON.stringify(input, null, 2)}
        </div>
      )}
    </div>
  );
}
