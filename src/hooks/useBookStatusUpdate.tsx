
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const useBookStatusUpdate = (id: string) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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

  return { handleStatusChange };
};
