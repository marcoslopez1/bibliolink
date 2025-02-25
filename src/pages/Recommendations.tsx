
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const Recommendations = () => {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("recommendations.systemMessage") }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const formatMessageWithLinks = (content: string) => {
    // Match book IDs and titles in the format "Book Title (ID: ABC123)" or just "ID: ABC123"
    const bookPattern = /(?:"([^"]+)"\s*(?:\()?ID:\s*([A-Za-z0-9]+)(?:\))?)|(?:ID:\s*([A-Za-z0-9]+))/g;
    let lastIndex = 0;
    const parts = [];
    let match;

    while ((match = bookPattern.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      const title = match[1];
      const id = match[2] || match[3];

      // Add the linked book reference
      parts.push(
        <Link
          key={`${id}-${match.index}`}
          to={`/book/${id}`}
          className="text-blue-600 hover:underline"
        >
          {title ? `"${title}" (ID: ${id})` : `ID: ${id}`}
        </Link>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: "user" as const, content: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    try {
      const response = await supabase.functions.invoke("recommendations-chat", {
        body: { message: newMessage },
      });

      if (response.error) throw response.error;

      const assistantMessage = {
        role: "assistant" as const,
        content: response.data.message,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        description: "Error sending message. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "assistant"
                  ? "bg-gray-100"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">
                {message.role === "assistant" 
                  ? formatMessageWithLinks(message.content)
                  : message.content
                }
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("recommendations.inputPlaceholder")}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            {t("recommendations.sendMessage")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Recommendations;
