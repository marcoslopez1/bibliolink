
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

  // Fetch current conversation
  const { data: conversation } = useQuery({
    queryKey: ["conversation", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", session?.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
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
      const { error } = await supabase
        .from("conversations")
        .update({ messages })
        .eq("id", conversation?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async () => {
      if (!conversation?.id) return;
      
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversation.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
      
      // Create new conversation with system message
      createConversation.mutate([
        { role: "assistant", content: t("recommendations.systemMessage") }
      ]);
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("recommendations.title")}</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                {t("recommendations.newChat")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("recommendations.newChatDialog.title")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("recommendations.newChatDialog.description")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t("recommendations.newChatDialog.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteConversation.mutate()}
                >
                  {t("recommendations.newChatDialog.confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
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
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t("recommendations.inputPlaceholder")}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4 mr-2" />
                {t("recommendations.sendMessage")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
