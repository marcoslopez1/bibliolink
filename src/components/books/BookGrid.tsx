import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BookCard, { Book } from "./BookCard";
import BookSearch from "./BookSearch";

const BOOKS_PER_PAGE = 10;

const BookGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const { ref, inView } = useInView();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["books", page, searchQuery],
    queryFn: async () => {
      const from = (page - 1) * BOOKS_PER_PAGE;
      const to = from + BOOKS_PER_PAGE - 1;

      let query = supabase
        .from("books")
        .select("book_id, title, author, image_url, genre, status", { count: "exact" })
        .order('id', { ascending: false });

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%`
        );
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      
      return {
        books: data as Book[],
        count,
      };
    },
    staleTime: 5 * 60 * 1000, // Keep the data fresh for 5 minutes
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchParams(query ? { q: query } : {});
  };

  useEffect(() => {
    if (searchQuery) {
      setBooks([]);
      setPage(1);
    } else if (data?.books) {
      setBooks((prev) => [...prev, ...data.books]);
    }
  }, [data, searchQuery]);

  useEffect(() => {
    if (inView && !isLoading && !isFetching && data?.count && books.length < data.count && !searchQuery) {
      setPage((prev) => prev + 1);
    }
  }, [inView, isLoading, data?.count, books.length, isFetching, searchQuery]);

  const displayBooks = searchQuery ? data?.books || [] : books;

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <BookSearch onSearch={handleSearch} initialValue={searchQuery} />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {displayBooks?.map((book) => (
          <BookCard key={book.book_id} book={book} />
        ))}
      </div>
      {!isLoading && !searchQuery && (
        <div
          ref={ref}
          className="flex justify-center p-4"
        >
          {isFetching && (
            <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          )}
        </div>
      )}
    </div>
  );
};

export default BookGrid;