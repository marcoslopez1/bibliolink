import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookRequest } from "@/types/bookRequest";

const ITEMS_PER_PAGE = 10;

export const useRequests = (currentPage: number, searchQuery: string) => {
  return useQuery({
    queryKey: ["book-requests", currentPage, searchQuery],
    queryFn: async () => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      try {
        // First, check if we can access the table
        const { data: testData, error: testError } = await supabase
          .from('book_requests')
          .select('id')
          .limit(1);

        if (testError) {
          console.error('Error accessing book_requests table:', testError);
          throw testError;
        }

        // If we can access the table, proceed with the main query
        let query = supabase
          .from('book_requests')
          .select(`
            id,
            title,
            author,
            editorial,
            link,
            comments,
            status,
            created_at,
            created_by,
            profiles (
              first_name,
              last_name,
              email
            )
          `, { count: 'exact' });

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`);
        }

        const { data, count, error } = await query
          .range(start, end)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching requests:', error);
          throw error;
        }

        // Transform the data to match the BookRequest type
        const typedData = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          author: item.author,
          editorial: item.editorial,
          link: item.link,
          comments: item.comments,
          status: item.status as BookRequest['status'],
          created_at: item.created_at,
          created_by: item.created_by,
          user_first_name: item.profiles?.first_name || '',
          user_last_name: item.profiles?.last_name || '',
          user_email: item.profiles?.email || ''
        }));

        return {
          requests: typedData,
          totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0
        };
      } catch (error) {
        console.error('Error in useRequests:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
  });
};
