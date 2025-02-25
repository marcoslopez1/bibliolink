
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { type Message } from "@/types/conversation";

interface ChatMessageProps extends Message {
  role: Message['role'];
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isAssistant = role === 'assistant';

  // Function to parse and format message content with book links
  const formatMessageContent = (text: string) => {
    // Regex to match book titles with IDs: "Book Title" (ID: 123)
    const bookPattern = /"([^"]+)"\s*\(ID:\s*(\d+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = bookPattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the linked book title
      const [fullMatch, title, bookId] = match;
      parts.push(
        <Link
          key={`${bookId}-${match.index}`}
          to={`/book/${bookId}`}
          className="text-primary hover:underline"
        >
          {fullMatch}
        </Link>
      );

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text after the last match
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

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
        <p className="whitespace-pre-wrap break-words text-sm">
          {isAssistant ? formatMessageContent(content) : content}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
