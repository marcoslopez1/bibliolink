
import { format } from "date-fns";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  } | null;
}

export const BookHeader = ({
  bookId,
  title,
  author,
  status,
  reservation,
}: BookHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex flex-col mb-4">
        <p className="text-sm font-medium text-gray-500">
          {t("book.bookId")}: {bookId}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">{title}</h1>
        <p className="text-xl text-gray-600 mt-2">{author}</p>
        <span
          className={`mt-2 w-fit px-3 py-1 rounded-full text-sm font-medium ${
            status === "available"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status === "available" ? t("book.status.available") : t("book.status.reserved")}
        </span>
      </div>

      {reservation && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>
            {t("book.reservedBy")}: {reservation.profiles.first_name}{" "}
            {reservation.profiles.last_name} ({reservation.profiles.email}) {t("book.on")}{" "}
            {format(new Date(reservation.reserved_at), "MMMM d, yyyy")}
          </span>
        </div>
      )}
    </div>
  );
};
