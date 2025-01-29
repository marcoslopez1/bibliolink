import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BookCard from "./BookCard";
import type { Book } from "./BookCard";
import BookSearch from "./BookSearch";

const ITEMS_PER_PAGE = 12;

const BookGrid = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const { ref, inView } = useInView();

  const fetchBooks = async (start: number, searchTerm: string) => {
    try {
      let query = supabase
        .from("books")
        .select("book_id, title, author, image_url, genre, status", { count: "exact" })
        .order('id', { ascending: false });

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`
        );
      }

      const { data, count, error } = await query
        .range(start, start + ITEMS_PER_PAGE - 1);

      if (error) throw error;

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
    }
  };

  useEffect(() => {
    setPage(0);
    setBooks([]);
    setHasMore(true);
    setIsLoading(true);
    fetchBooks(0, searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBooks(nextPage * ITEMS_PER_PAGE, searchQuery);
    }
  }, [inView, hasMore, isLoading, page, searchQuery]);

  const handleSearch = (term: string) => {
    setSearchParams(term ? { q: term } : {});
  };

  return (
    <div className="space-y-6">
      <BookSearch onSearch={handleSearch} initialValue={searchQuery} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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