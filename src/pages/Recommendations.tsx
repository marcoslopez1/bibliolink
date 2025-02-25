
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";

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
          <ChatMessage 
            key={index}
            role={message.role}
            content={message.content}
          />
        ))}
      </div>

      <ChatInput 
        message={newMessage}
        isLoading={isLoading}
        onMessageChange={setNewMessage}
        onSubmit={handleSubmit}
        placeholder={t("recommendations.inputPlaceholder")}
      />
    </div>
  );
};

export default Recommendations;
