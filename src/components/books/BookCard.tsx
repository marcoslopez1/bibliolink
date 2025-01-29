import { Link } from "react-router-dom";

export interface Book {
  book_id: string;
  title: string;
  author: string;
  image_url: string;
  genre: string;
}

const BookCard = ({ book }: { book: Book }) => {
  return (
    <Link
      to={`/book/${book.book_id}`}
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={book.image_url}
          alt={book.title}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="space-y-1">
            <h3 className="text-white font-medium line-clamp-2">{book.title}</h3>
            <p className="text-white/80 text-sm">{book.author}</p>
          </div>
        </div>
      </div>
      <div className="absolute top-4 right-4">
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
          {book.genre}
        </span>
      </div>
    </Link>
  );
};

export default BookCard;