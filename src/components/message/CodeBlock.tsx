import { useState, useEffect } from "react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "" }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const lang = language || "text";
    codeToHtml(code, {
      lang,
      theme: "github-light",
    })
      .then(setHtml)
      .catch(() => {
        // Fallback: if language is not supported, render as plain text
        codeToHtml(code, { lang: "text", theme: "github-light" }).then(setHtml);
      });
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-[10px] border border-[rgba(0,0,0,0.06)] bg-[#F5F5F7] overflow-hidden my-2.5">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-[rgba(0,0,0,0.04)]">
        <span className="text-[11px] text-[#AAA] font-medium uppercase tracking-wider">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="text-[11px] text-[#AAA] hover:text-[#6366F1] transition-colors flex items-center gap-1 cursor-pointer"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      {html ? (
        <div
          className="overflow-x-auto text-[13px] leading-[1.6] [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:m-0 [&_code]:font-[SF_Mono,JetBrains_Mono,Menlo,monospace]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="p-4 text-[13px] leading-[1.6] font-[SF_Mono,JetBrains_Mono,Menlo,monospace] text-[#3D3D4F]">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
