
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookRequest } from "@/types/bookRequest";

const ITEMS_PER_PAGE = 10;

export const useRequests = (currentPage: number, searchQuery: string) => {
  return useQuery({
    queryKey: ["requests", currentPage, searchQuery],
    queryFn: async () => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('book_requests')
        .select('*', { count: 'exact' });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`);
      }

      const { data, count, error } = await query
        .range(start, end)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast the data to ensure it matches our BookRequest type
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as BookRequest['status']
      }));

      return {
        requests: typedData,
        totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0
      };
    },
  });
};
