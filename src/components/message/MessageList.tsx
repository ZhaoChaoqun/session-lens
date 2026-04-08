import type { Message } from "../../types/session";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex flex-col gap-5 py-4">
      {messages.map((message, index) => {
        if (message.role === "user") {
          const text =
            typeof message.content === "string"
              ? message.content
              : message.content
                  .filter((b) => b.type === "text")
                  .map((b) => (b as { text: string }).text)
                  .join("\n");
          return (
            <UserMessage
              key={index}
              content={text}
              timestamp={message.timestamp}
            />
          );
        }

        return (
          <AssistantMessage
            key={index}
            content={message.content}
            timestamp={message.timestamp}
          />
        );
      })}
    </div>
  );
}
