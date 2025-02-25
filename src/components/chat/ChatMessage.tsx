
import { formatMessageWithLinks } from "@/utils/messageFormatting";

interface ChatMessageProps {
  role: "assistant" | "user";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div className={`flex ${role === "assistant" ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          role === "assistant"
            ? "bg-gray-100"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap">
          {role === "assistant" ? formatMessageWithLinks(content) : content}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
