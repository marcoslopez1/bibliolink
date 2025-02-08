
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const MyBooks = () => {
  const { session } = useAuth();
  const { t } = useTranslation();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["my-reservations", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_reservations")
        .select(`
          *,
          books:book_id (
            title,
            author,
            status,
            book_id
          )
        `)
        .eq("user_id", session?.user.id)
        .order("reserved_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">{t("myBooks.title")}</h1>
      <div className="space-y-4">
        {reservations?.map((reservation) => (
          <Card key={reservation.id} className="p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2">
                <Link
                  to={`/book/${reservation.books.book_id}`}
                  className="text-xl font-semibold hover:text-primary transition-colors"
                >
                  {reservation.books.title}
                </Link>
                <p className="text-gray-600">{reservation.books.author}</p>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={reservation.returned_at ? "secondary" : "default"}>
                    {reservation.returned_at 
                      ? t("myBooks.returned")
                      : t("myBooks.reserved")}
                  </Badge>
                  <Badge 
                    variant={reservation.books.status === "available" ? "outline" : "destructive"}
                  >
                    {reservation.books.status === "available" 
                      ? t("book.status.available")
                      : t("book.status.reserved")}
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
            </div>
          </Card>
        ))}
        {reservations?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("myBooks.noBooks")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooks;
