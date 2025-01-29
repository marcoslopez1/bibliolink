import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BookCard, { Book } from "./BookCard";
import BookSearch from "./BookSearch";

const BookGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: books, isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("book_id, title, author, image_url, genre, status");

      if (error) throw error;
      return data as Book[];
    },
  });

  const filteredBooks = books?.filter((book) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.genre.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

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
    </div>
  );
};

export default BookGrid;