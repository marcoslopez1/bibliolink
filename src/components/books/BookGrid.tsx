import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BookCard, { Book } from "./BookCard";

const BookGrid = () => {
  const { data: books, isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("book_id, title, author, image_url, genre");

      if (error) throw error;
      return data as Book[];
    },
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {books?.map((book) => (
          <BookCard key={book.book_id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default BookGrid;