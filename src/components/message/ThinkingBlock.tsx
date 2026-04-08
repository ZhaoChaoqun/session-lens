import { useState } from "react";

interface ThinkingBlockProps {
  thinking: string;
}

export function ThinkingBlock({ thinking }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-2.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-0 py-1 bg-transparent border-none cursor-pointer text-left"
      >
        <span
          className="text-[10px] text-[rgba(139,92,246,0.5)] transition-transform duration-200"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0)" }}
        >
          ▶
        </span>
        <span className="text-[12px] italic text-[#AAA]">
          💡 Thinking...{!expanded && " (click to expand)"}
        </span>
      </button>

      {expanded && (
        <div className="ml-5 pl-3.5 border-l-2 border-[rgba(139,92,246,0.2)] text-[13px] text-[#777] leading-[1.7] whitespace-pre-wrap mt-1.5">
          {thinking}
        </div>
      )}
    </div>
  );
}
