
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface Conversation {
  id: number;
  messages: Message[];
}

const Recommendations = () => {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch current conversation
  const { data: conversation } = useQuery({
    queryKey: ["conversation", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;
      
      const { data, error } = await supabase
        .from("conversations")
        .select()
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Conversation | null;
    },
    enabled: !!session?.user.id,
  });

  const createConversation = useMutation({
    mutationFn: async (messages: Message[]) => {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: session?.user.id,
          messages,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    },
  });

  const updateConversation = useMutation({
    mutationFn: async (messages: Message[]) => {
      if (!conversation?.id) return;

      const { error } = await supabase
        .from("conversations")
        .update({ messages })
        .eq("id", conversation.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    },
  });

  useEffect(() => {
    // If no conversation exists, create one with the system message
    if (!conversation && session?.user.id) {
      createConversation.mutate([
        { role: "assistant", content: t("recommendations.systemMessage") }
      ]);
    }
  }, [conversation, session?.user.id]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

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
    const updatedMessages = [...(conversation?.messages || []), userMessage];

    try {
      if (!conversation) {
        await createConversation.mutateAsync([
          { role: "assistant", content: t("recommendations.systemMessage") },
          userMessage
        ]);
      } else {
        await updateConversation.mutateAsync(updatedMessages);
      }

      const response = await supabase.functions.invoke("recommendations-chat", {
        body: { message: newMessage, conversationHistory: updatedMessages },
      });

      if (response.error) throw response.error;

      const assistantMessage = {
        role: "assistant" as const,
        content: response.data.message,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      
      if (!conversation) {
        await createConversation.mutateAsync(finalMessages);
      } else {
        await updateConversation.mutateAsync(finalMessages);
      }

      setNewMessage("");
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
        {conversation?.messages.map((message, index) => (
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
        <div ref={messagesEndRef} />
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
