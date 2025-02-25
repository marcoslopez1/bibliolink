
import React from 'react';
import { cn } from "@/lib/utils";
import { type Message } from "@/types/conversation";

interface ChatMessageProps extends Message {
  role: Message['role'];
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isAssistant = role === 'assistant';

  return (
    <div
      className={cn(
        "flex w-full items-end",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-4",
          isAssistant 
            ? "bg-white text-foreground" 
            : "bg-primary text-primary-foreground",
          "shadow-sm"
        )}
      >
        <p className="whitespace-pre-wrap break-words text-sm">{content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
