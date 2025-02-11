
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;

interface Reservation {
  id: number;
  reserved_at: string;
  books: {
    book_id: string;
    title: string;
    author: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

const BooksReservation = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["reservations", currentPage, debouncedSearchQuery],
    queryFn: async () => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const query = supabase
        .from("book_reservations")
        .select('*, books!inner(book_id, title, author), profiles!inner(first_name, last_name)', { 
          count: "exact" 
        })
        .is('returned_at', null)
        .order('reserved_at', { ascending: false })
        .range(start, end);

      if (debouncedSearchQuery) {
        query.or(`books.title.ilike.%${debouncedSearchQuery}%,books.author.ilike.%${debouncedSearchQuery}%,books.book_id.ilike.%${debouncedSearchQuery}%`);
      }

      const { data: reservations, count, error } = await query;

      if (error) throw error;

      return {
        reservations: (reservations as Reservation[]) || [],
        totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          {t("admin.reservationsManagement")}
        </h1>
      </div>

      <Input
        placeholder={t("admin.search")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("book.bookId")}</TableHead>
              <TableHead>{t("book.title")}</TableHead>
              <TableHead>{t("book.author")}</TableHead>
              <TableHead>{t("user.firstName")}</TableHead>
              <TableHead>{t("user.lastName")}</TableHead>
              <TableHead>{t("reservation.date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>
                  <Link 
                    to={`/book/${reservation.books.book_id}`}
                    className="text-primary hover:underline underline"
                  >
                    {reservation.books.book_id}
                  </Link>
                </TableCell>
                <TableCell>{reservation.books.title}</TableCell>
                <TableCell>{reservation.books.author}</TableCell>
                <TableCell>{reservation.profiles.first_name}</TableCell>
                <TableCell>{reservation.profiles.last_name}</TableCell>
                <TableCell>
                  {format(new Date(reservation.reserved_at), 'yyyy-MM-dd HH:mm')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data?.totalPages && data.totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center gap-1">
            {Array.from({ length: data.totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-primary text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default BooksReservation;
