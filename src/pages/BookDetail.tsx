
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BookDetailHeader } from "@/components/books/detail/BookDetailHeader";
import { BookDetailContent } from "@/components/books/detail/BookDetailContent";

const BookDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("book_id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: reservation } = useQuery({
    queryKey: ["reservation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_reservations")
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq("book_id", id)
        .is("returned_at", null)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "books",
          filter: `book_id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["book", id] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "book_reservations",
          filter: `book_id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["reservation", id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  const handleStatusChange = async () => {
    if (!session?.user) {
      toast({
        title: t("auth.signInRequired"),
        description: t("auth.signInToReserve"),
        variant: "destructive",
      });
      return;
    }

    try {
      if (book?.status === "available") {
        const { error: bookError } = await supabase
          .from("books")
          .update({ status: "reserved" })
          .eq("book_id", id);

        if (bookError) throw bookError;

        const { error: reservationError } = await supabase
          .from("book_reservations")
          .insert({
            book_id: id,
            user_id: session.user.id,
          });

        if (reservationError) throw reservationError;

        toast({
          title: t("book.actions.reserveSuccessTitle"),
          description: t("book.actions.reserveSuccessDescription"),
        });
      } else if (book?.status === "reserved") {
        const { error: returnError } = await supabase
          .from("book_reservations")
          .update({ returned_at: new Date().toISOString() })
          .eq("book_id", id)
          .is("returned_at", null);

        if (returnError) throw returnError;

        const { error: bookError } = await supabase
          .from("books")
          .update({ status: "available" })
          .eq("book_id", id);

        if (bookError) throw bookError;

        toast({
          title: t("book.actions.returnSuccessTitle"),
          description: t("book.actions.returnSuccessDescription"),
        });
      }

      queryClient.invalidateQueries({ queryKey: ["book", id] });
      queryClient.invalidateQueries({ queryKey: ["reservation", id] });
    } catch (error) {
      console.error("Error updating book status:", error);
      toast({
        title: "Error",
        description: "Failed to update book status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Book not found</h2>
      </div>
    );
  }

  const canReturn = session?.user && (
    (reservation?.user_id === session.user.id) || // User who reserved the book
    (session.user.id && book.status === "reserved") // Admin users (handled by RLS)
  );

  return (
    <div className="container px-6 py-4">
      <BookDetailHeader />
      <BookDetailContent
        book={book}
        reservation={reservation}
        showButton={!!session?.user && canReturn}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default BookDetail;
