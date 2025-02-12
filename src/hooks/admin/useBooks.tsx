import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 10;

export const useBooks = (currentPage: number, searchQuery: string) => {
  const [data, setData] = useState<{ books: any[]; totalPages: number }>({ books: [], totalPages: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;

        let query = supabase
          .from("books")
          .select("*", { count: "exact" });

        if (searchQuery) {
          query = query.or(
            `title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,book_id.ilike.%${searchQuery}%,editorial.ilike.%${searchQuery}%,building.ilike.%${searchQuery}%`
          );
        }

        const { data: books, count, error } = await query
          .range(start, end)
          .order("id", { ascending: false });

        if (error) throw error;

        setData({
          books: books || [],
          totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, searchQuery]);

  return {
    data: data,
    isLoading,
    error,
  };
};

export { ITEMS_PER_PAGE };
