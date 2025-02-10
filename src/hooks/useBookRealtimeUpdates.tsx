
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBookRealtimeUpdates = (id: string) => {
  const queryClient = useQueryClient();

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
};
