interface UserMessageProps {
  content: string;
  timestamp?: string;
}

export function UserMessage({ content, timestamp }: UserMessageProps) {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] font-semibold shrink-0"
        style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
      >
        U
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[12px] font-semibold text-[#2D2D3F]">User</span>
          {timestamp && (
            <span className="text-[11px] text-[#AAA]">{timestamp}</span>
          )}
        </div>
        <div className="text-[14px] text-[#3D3D4F] leading-[1.7]">{content}</div>
      </div>
    </div>
  );
}
