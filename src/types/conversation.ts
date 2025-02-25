
export interface Message {
  role: "assistant" | "user";
  content: string;
}

export interface Conversation {
  id: number;
  user_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}
