
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import type { Message, Conversation } from "@/types/conversation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Recommendations = () => {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

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
        .single();

      if (error) throw error;
      return data as Conversation;
    },
    enabled: !!session?.user.id,
  });

  const createConversation = useMutation({
    mutationFn: async (messages: Message[]) => {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: session?.user.id,
          messages: messages,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Conversation;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: "user" as const, content: newMessage };
    setNewMessage("");

    try {
      // Update UI optimistically
      if (!conversation) {
        createConversation.mutate([
          { role: "assistant", content: t("recommendations.systemMessage") },
          userMessage
        ]);
      } else {
        const updatedMessages = [...conversation.messages, userMessage];
        updateConversation.mutate(updatedMessages);
      }

      const response = await supabase.functions.invoke("recommendations-chat", {
        body: { 
          message: newMessage,
          conversationHistory: conversation?.messages || []
        },
      });

      if (response.error) throw response.error;

      const assistantMessage = {
        role: "assistant" as const,
        content: response.data.message,
      };

      if (!conversation) {
        createConversation.mutate([
          { role: "assistant", content: t("recommendations.systemMessage") },
          userMessage,
          assistantMessage
        ]);
      } else {
        const finalMessages = [...conversation.messages, userMessage, assistantMessage];
        updateConversation.mutate(finalMessages);
      }
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
