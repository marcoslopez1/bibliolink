import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface Book {
  book_id: string;
  title: string;
  author: string;
  image_url: string;
  genre: string;
  status: string;
}

const BookCard = ({ book }: { book: Book }) => {
  const { t } = useTranslation();
  const placeholderImage = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b";

  return (
    <Link
      to={`/book/${book.book_id}`}
      className="group flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="relative">
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={book.image_url || placeholderImage}
            alt={book.title}
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="absolute top-4 right-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              book.status === 'available'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {book.status === 'available' ? t("book.status.available") : t("book.status.reserved")}
          </span>
        </div>
        <div className="absolute top-4 left-4">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            #{book.book_id}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-1">
        <h3 className="font-medium line-clamp-2 text-primary">{book.title}</h3>
        <p className="text-sm text-gray-600">{book.author}</p>
      </div>
    </Link>
  );
};

export default BookCard;