
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 10;

export const useBooks = (currentPage: number, debouncedSearchQuery: string) => {
  return useQuery({
    queryKey: ["admin-books", currentPage, debouncedSearchQuery],
    queryFn: async () => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("books")
        .select("*", { count: "exact" });

      if (debouncedSearchQuery) {
        query = query.or(
          `title.ilike.%${debouncedSearchQuery}%,author.ilike.%${debouncedSearchQuery}%,genre.ilike.%${debouncedSearchQuery}%,category.ilike.%${debouncedSearchQuery}%,book_id.ilike.%${debouncedSearchQuery}%,editorial.ilike.%${debouncedSearchQuery}%,building.ilike.%${debouncedSearchQuery}%`
        );
      }

      const { data: books, count, error } = await query
        .range(start, end)
        .order("id", { ascending: false });

      if (error) throw error;

      return {
        books,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
      };
    },
    staleTime: 1000,
  });
};

export { ITEMS_PER_PAGE };
