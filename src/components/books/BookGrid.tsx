import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { supabase } from "@/integrations/supabase/client";
import BookCard, { Book } from "./BookCard";
import BookSearch from "./BookSearch";

const BOOKS_PER_PAGE = 10;

const BookGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const { ref, inView } = useInView();

  const { data, isLoading, isFetching, hasNextPage } = useQuery({
    queryKey: ["books", page],
    queryFn: async () => {
      const from = (page - 1) * BOOKS_PER_PAGE;
      const to = from + BOOKS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from("books")
        .select("book_id, title, author, image_url, genre, status", { count: "exact" })
        .range(from, to);

      if (error) throw error;
      
      return {
        books: data as Book[],
        count,
      };
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data?.books) {
      setBooks((prev) => [...prev, ...data.books]);
    }
  }, [data]);

  useEffect(() => {
    if (inView && !isLoading && !isFetching && data?.count && books.length < data.count) {
      setPage((prev) => prev + 1);
    }
  }, [inView, isLoading, data?.count, books.length, isFetching]);

  const filteredBooks = books?.filter((book) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.genre.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <BookSearch onSearch={setSearchQuery} />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {filteredBooks?.map((book) => (
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