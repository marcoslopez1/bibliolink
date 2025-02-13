import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useInView } from "react-intersection-observer";
import { useEffect, Fragment } from "react";
import { Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;
const defaultBookCover = "https://media.istockphoto.com/id/626462142/photo/red-book.jpg?s=612x612&w=0&k=20&c=6GQND0qF5JAhrm1g_cZzXHQVRkkaA_625VXjfy9MtxA=";

const MyBooks = () => {
  const { session } = useAuth();
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["my-reservations", session?.user.id],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from("book_reservations")
        .select(`
          *,
          books:book_id (
            title,
            author,
            status,
            book_id,
            image_url
          )
        `, { count: "exact" })
        .eq("user_id", session?.user.id)
        .order('returned_at', { ascending: false, nullsFirst: true })
        .order("reserved_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        reservations: data,
        nextPage: to < (count || 0) - 1 ? pageParam + 1 : undefined,
        totalCount: count
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!session?.user.id,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const allReservations = data?.pages.flatMap(page => page.reservations) || [];

  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">{t("myBooks.title")}</h1>
      <div className="space-y-4">
        {allReservations.map((reservation, index) => (
          <Link
            key={reservation.id}
            to={`/book/${reservation.books.book_id}`}
            className="block"
          >
            <Card className="p-4 bg-white hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-grow space-y-2">
                  <div
                    className="text-xl font-semibold hover:text-primary transition-colors"
                  >
                    {reservation.books.title}
                  </div>
                  <p className="text-gray-600">{reservation.books.author}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="outline"
                      className={reservation.returned_at 
                        ? "bg-[#F2FCE2] border-[#F2FCE2] text-black"
                        : "bg-[#fde7e9] border-[#fde7e9] text-black"}
                    >
                      {reservation.returned_at 
                        ? t("myBooks.returned")
                        : t("myBooks.reserved")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-gray-100 border-gray-100 text-black"
                    >
                      {reservation.books.book_id}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {reservation.returned_at ? (
                      <>
                        {t("myBooks.returnedOn")}: {format(new Date(reservation.returned_at), "PPP")}
                        <br />
                        {t("myBooks.reservedOn")}: {format(new Date(reservation.reserved_at), "PPP")}
                      </>
                    ) : (
                      <>
                        {t("myBooks.reservedOn")}: {format(new Date(reservation.reserved_at), "PPP")}
                      </>
                    )}
                  </div>
                </div>
                <div className="sm:w-32 h-32 sm:h-40">
                  <img
                    src={reservation.books.image_url || defaultBookCover}
                    alt={reservation.books.title}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {/* Loading indicator */}
        {(hasNextPage || isFetchingNextPage) && (
          <div
            ref={ref}
            className="flex justify-center py-4"
          >
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        )}

        {/* Empty state */}
        {(!allReservations || allReservations.length === 0) && (
          <div className="text-center py-12 space-y-4">
            <p className="text-xl text-gray-600">{t("myBooks.noReservationsMessage")}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
            >
              {t("myBooks.browseCatalog")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooks;
