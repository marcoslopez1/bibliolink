import BookGrid from "@/components/books/BookGrid";

const Catalog = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-semibold text-primary">Book Catalog</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our collection of books. From classic literature to contemporary bestsellers,
          find your next great read here.
        </p>
      </div>
      <BookGrid />
    </div>
  );
};

export default Catalog;