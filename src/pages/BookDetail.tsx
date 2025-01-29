import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";
import { BookHeader } from "@/components/books/BookHeader";
import { BookDetails } from "@/components/books/BookDetails";
import { BookImage } from "@/components/books/BookImage";
import { BookActions } from "@/components/books/BookActions";
import { ExternalReference } from "@/components/books/ExternalReference";
import { useTranslation } from "react-i18next";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
        title: "Authentication required",
        description: "Please sign in to reserve books",
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

  return (
    <div className="container px-6 py-4">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("common.back")}
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <BookImage
          imageUrl={book.image_url}
          title={book.title}
          status={book.status}
        />

        <div className="md:col-span-3 space-y-6">
          <BookHeader
            bookId={book.book_id}
            title={book.title}
            author={book.author}
            status={book.status}
            reservation={reservation}
          />

          <BookActions
            showButton={!!session?.user}
            status={book.status}
            onStatusChange={handleStatusChange}
          />

          <BookDetails
            genre={book.genre}
            category={book.category}
            pages={book.pages}
            publicationYear={book.publication_year}
            editorial={book.editorial}
            building={book.building}
          />

          <ExternalReference url={book.external_url} />
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
