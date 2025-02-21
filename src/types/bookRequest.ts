
export interface BookRequest {
  id: number;
  title: string;
  author: string;
  editorial: string | null;
  link: string | null;
  comments: string | null;
  status: "accepted" | "pending" | "rejected";
  created_at: string;
  created_by: string;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
}
