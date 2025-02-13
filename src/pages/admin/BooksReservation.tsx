import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
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
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import BookSearch from "@/components/admin/books/BookSearch";
import BookPagination from "@/components/admin/books/BookPagination";

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
    email: string;
  };
}

const BooksReservation = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const { t } = useTranslation();

  const handleSearch = useCallback((value: string) => {
    setCurrentPage(1);
    setSearchParams(value ? { q: value } : {}, { replace: true });
  }, [setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["reservations", currentPage, searchQuery],
    queryFn: async () => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      // First, get the book IDs that match the search criteria
      let matchingBooksQuery = supabase
        .from('books')
        .select('book_id');

      if (searchQuery) {
        matchingBooksQuery = matchingBooksQuery.or(
          `title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,book_id.ilike.%${searchQuery}%`
        );
      }

      const { data: matchingBooks, error: booksError } = await matchingBooksQuery;
      
      if (booksError) {
        console.error('Books query error:', booksError);
        throw booksError;
      }

      // Then get the reservations for those books
      const bookIds = matchingBooks?.map(book => book.book_id) || [];

      let reservationsQuery = supabase
        .from('book_reservations')
        .select(`
          *,
          books!inner (
            book_id,
            title,
            author
          ),
          profiles!inner (
            first_name,
            last_name,
            email
          )
        `, { count: "exact" })
        .is('returned_at', null);

      if (searchQuery && bookIds.length > 0) {
        reservationsQuery = reservationsQuery.in('books.book_id', bookIds);
      }

      const { data: reservations, count, error: reservationsError } = await reservationsQuery
        .order('reserved_at', { ascending: false })
        .range(start, end);

      if (reservationsError) {
        console.error('Reservations query error:', reservationsError);
        throw reservationsError;
      }

      return {
        reservations: (reservations as Reservation[]) || [],
        totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0
      };
    },
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60 * 5,
    keepPreviousData: true,
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

      <BookSearch
        initialValue={searchQuery}
        onSearch={handleSearch}
      />

      <div className="rounded-md border">
        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead>{t("book.bookId")}</TableHead>
              <TableHead>{t("book.title")}</TableHead>
              <TableHead>{t("book.author")}</TableHead>
              <TableHead>{t("admin.Name")}</TableHead>
              <TableHead>{t("admin.Lastname")}</TableHead>
              <TableHead>{t("admin.Email")}</TableHead>
              <TableHead>{t("admin.Reservation Date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchQuery
                    ? t("admin.noReservationsFound")
                    : t("admin.noReservations")
                  }
                </TableCell>
              </TableRow>
            ) : (
              data?.reservations.map((reservation) => (
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
                  <TableCell>{reservation.profiles.email}</TableCell>
                  <TableCell>
                    {format(new Date(reservation.reserved_at), 'yyyy-MM-dd HH:mm')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.totalPages && data.totalPages > 1 && (
        <BookPagination
          currentPage={currentPage}
          totalPages={data.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default BooksReservation;
