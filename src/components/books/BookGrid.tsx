import { useEffect, useState } from "react";
import BookCard, { Book } from "./BookCard";

// Temporary mock data
const getMockBooks = (page: number): Book[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `${page}-${i}`,
    title: `Book ${page * 12 + i + 1}`,
    author: `Author ${page * 12 + i + 1}`,
    coverUrl: `https://picsum.photos/seed/${page * 12 + i}/300/450`,
    status: Math.random() > 0.5 ? "available" : "borrowed",
  }));
};

const BookGrid = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newBooks = getMockBooks(page);
    setBooks((prev) => [...prev, ...newBooks]);
    setPage((prev) => prev + 1);
    setLoading(false);
  };

  useEffect(() => {
    loadMore();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      {loading && (
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        </div>
      )}
      <div className="flex justify-center">
        <button
          onClick={loadMore}
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          Load More
        </button>
      </div>
    </div>
  );
};

export default BookGrid;