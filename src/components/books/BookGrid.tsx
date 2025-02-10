
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BookCard from "./BookCard";
import type { Book } from "./BookCard";
import BookSearch from "./BookSearch";
import BookFilters from "./BookFilters";

const ITEMS_PER_PAGE = 12;

interface FilterState {
  genre: string;
  category: string;
  building: string;
}

const BookGrid = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [filters, setFilters] = useState<FilterState>({
    genre: "all",
    category: "all",
    building: "all",
  });
  const { ref, inView } = useInView();

  const fetchBooks = async (start: number, searchTerm: string) => {
    try {
      if (totalCount !== null && start >= totalCount) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      let query = supabase
        .from("books")
        .select("book_id, title, author, image_url, genre, category, building, status", { count: "exact" })
        .order('id', { ascending: false });

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,book_id.ilike.%${searchTerm}%`
        );
      }

      // Apply filters only if they're not set to "all"
      if (filters.genre !== "all") {
        query = query.eq('genre', filters.genre);
      }
      if (filters.category !== "all") {
        query = query.eq('category', filters.category);
      }
      if (filters.building !== "all") {
        query = query.eq('building', filters.building);
      }

      const { data, count, error } = await query
        .range(start, start + ITEMS_PER_PAGE - 1);

      if (error) {
        if (error.code === 'PGRST103') {
          setHasMore(false);
          setIsLoading(false);
          return;
        }
        throw error;
      }

      if (count !== null) {
        setTotalCount(count);
      }

      if (start === 0) {
        setBooks(data || []);
      } else {
        setBooks((prev) => [...prev, ...(data || [])]);
      }

      setHasMore(count ? start + ITEMS_PER_PAGE < count : false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching books:", error);
      setIsLoading(false);
      setHasMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setBooks([]);
    setHasMore(true);
    setIsLoading(true);
    setTotalCount(null);
    fetchBooks(0, searchQuery);
  }, [searchQuery, filters]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = page + 1;
      const nextStart = nextPage * ITEMS_PER_PAGE;
      
      if (totalCount === null || nextStart < totalCount) {
        setPage(nextPage);
        fetchBooks(nextStart, searchQuery);
      }
    }
  }, [inView, hasMore, isLoading, page, searchQuery, totalCount]);

  const handleSearch = (term: string) => {
    setSearchParams(term ? { q: term } : {});
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <BookSearch onSearch={handleSearch} initialValue={searchQuery} />
      <BookFilters books={books} onFilterChange={handleFilterChange} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {books.map((book) => (
          <BookCard key={book.book_id} book={book} />
        ))}
      </div>
      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <div ref={ref} className="h-1" />
    </div>
  );
};

export default BookGrid;
