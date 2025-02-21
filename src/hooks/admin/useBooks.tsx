
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 10;

export const useBooks = (currentPage: number, searchQuery: string) => {
  const [data, setData] = useState<{ books: any[]; totalPages: number }>({ books: [], totalPages: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const start = (Number(currentPage) - 1) * ITEMS_PER_PAGE;
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
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchQuery]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('books-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books'
        },
        () => {
          // Refetch books when any change occurs
          fetchBooks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, isLoading, error, refetch: fetchBooks };
};

export { ITEMS_PER_PAGE };
