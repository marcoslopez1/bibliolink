import BookGrid from "@/components/books/BookGrid";

const Latest = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <span className="px-4 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
          New Arrivals
        </span>
        <h1 className="text-4xl font-semibold text-primary">Latest Books</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the newest additions to our library. Stay up to date with the latest releases
          and additions to our collection.
        </p>
      </div>
      <BookGrid />
    </div>
  );
};

export default Latest;