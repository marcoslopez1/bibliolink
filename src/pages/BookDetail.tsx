
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { BookDetailHeader } from "@/components/books/detail/BookDetailHeader";
import { BookDetailContent } from "@/components/books/detail/BookDetailContent";
import { BookLoader } from "@/components/books/detail/BookLoader";
import { BookNotFound } from "@/components/books/detail/BookNotFound";
import { useBookDetail } from "@/hooks/useBookDetail";
import { useBookReservation } from "@/hooks/useBookReservation";
import { useBookRealtimeUpdates } from "@/hooks/useBookRealtimeUpdates";
import { useBookStatusUpdate } from "@/hooks/useBookStatusUpdate";

const BookDetail = () => {
  const { id } = useParams();
  const { session } = useAuth();

  // Query to check if the user is an admin
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { book, isLoading } = useBookDetail(id!);
  const { reservation } = useBookReservation(id!);
  const { handleStatusChange } = useBookStatusUpdate(id!);

  // Set up realtime updates
  useBookRealtimeUpdates(id!);

  if (isLoading) {
    return <BookLoader />;
  }

  if (!book) {
    return <BookNotFound />;
  }

  return (
    <div className="container px-6 py-4">
      <BookDetailHeader />
      <BookDetailContent
        book={book}
        reservation={reservation}
        showButton={!!session?.user}
        onStatusChange={handleStatusChange}
        isAdmin={!!userProfile?.is_admin}
        userId={session?.user?.id || ''}
      />
    </div>
  );
};

export default BookDetail;
