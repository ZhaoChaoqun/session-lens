import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { ContentBlock } from "../../types/session";
import { CodeBlock } from "./CodeBlock";
import { ToolUseBlock } from "./ToolUseBlock";
import { ThinkingBlock } from "./ThinkingBlock";

interface AssistantMessageProps {
  content: string | ContentBlock[];
  timestamp?: string;
}

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const code = String(children).replace(/\n$/, "");

    // Inline code vs block code
    const isInline = !match && !code.includes("\n");
    if (isInline) {
      return (
        <code
          className="bg-[rgba(0,0,0,0.04)] rounded-[6px] px-1.5 py-0.5 text-[#6366F1] text-[13px] font-[SF_Mono,JetBrains_Mono,Menlo,monospace]"
          {...props}
        >
          {children}
        </code>
      );
    }

    return <CodeBlock code={code} language={match?.[1]} />;
  },
  pre({ children }) {
    // Let CodeBlock handle the wrapper
    return <>{children}</>;
  },
  h2({ children }) {
    return (
      <h2 className="text-[16px] font-bold text-[#2D2D3F] mt-4 mb-2">
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="text-[15px] font-semibold text-[#2D2D3F] mt-3 mb-1.5">
        {children}
      </h3>
    );
  },
  ul({ children }) {
    return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
  },
  li({ children }) {
    return <li className="text-[14px] text-[#4A4A5A] leading-[1.7]">{children}</li>;
  },
  strong({ children }) {
    return <strong className="font-semibold text-[#2D2D3F]">{children}</strong>;
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        className="text-[#6366F1] hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-3">
        <table className="w-full border-collapse text-[13px]">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="text-left px-3 py-2 border-b border-[rgba(0,0,0,0.1)] font-semibold text-[#2D2D3F]">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-3 py-2 border-b border-[rgba(0,0,0,0.06)] text-[#4A4A5A]">
        {children}
      </td>
    );
  },
  p({ children }) {
    return <p className="my-2 first:mt-0 last:mb-0">{children}</p>;
  },
};

function renderContentBlocks(blocks: ContentBlock[]) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "text":
        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {block.text}
          </ReactMarkdown>
        );
      case "thinking":
        return <ThinkingBlock key={index} thinking={block.thinking} />;
      case "tool_use":
        return (
          <ToolUseBlock key={index} name={block.name} input={block.input} />
        );
      case "tool_result":
        return null; // Tool results are typically not shown directly
      default:
        return null;
    }
  });
}

export function AssistantMessage({ content, timestamp }: AssistantMessageProps) {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[14px] shrink-0"
        style={{ background: "linear-gradient(135deg, #8B5CF6, #A78BFA)" }}
      >
        ✦
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[12px] font-semibold text-[#2D2D3F]">Claude</span>
          {timestamp && (
            <span className="text-[11px] text-[#AAA]">{timestamp}</span>
          )}
        </div>
        <div className="text-[14px] text-[#4A4A5A] leading-[1.7]">
          {typeof content === "string" ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {content}
            </ReactMarkdown>
          ) : (
            renderContentBlocks(content)
          )}
        </div>
      </div>
    </div>
  );
}
