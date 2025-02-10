
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBookReservation = (id: string) => {
  const { data: reservation } = useQuery({
    queryKey: ["reservation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_reservations")
        .select(`
          id,
          book_id,
          user_id,
          reserved_at,
          returned_at,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .eq("book_id", id)
        .is("returned_at", null)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return { reservation };
};
