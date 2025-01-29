import { format } from "date-fns";
import { User } from "lucide-react";

interface BookHeaderProps {
  bookId: string;
  title: string;
  author: string;
  status: string;
  reservation?: {
    profiles: {
      first_name: string;
      last_name: string;
      email: string;
    };
    reserved_at: string;
  };
}

export const BookHeader = ({
  bookId,
  title,
  author,
  status,
  reservation,
}: BookHeaderProps) => {
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Book ID: {bookId}</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">{title}</h1>
          <p className="text-xl text-gray-600 mt-2">{author}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === "available"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status}
        </span>
      </div>

      {reservation && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>
            Reserved by: {reservation.profiles.first_name}{" "}
            {reservation.profiles.last_name} ({reservation.profiles.email}) on{" "}
            {format(new Date(reservation.reserved_at), "MMMM d, yyyy")}
          </span>
        </div>
      )}
    </div>
  );
};