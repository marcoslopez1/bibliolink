
import { BookHeader } from "@/components/books/BookHeader";
import { BookDetails } from "@/components/books/BookDetails";
import { BookImage } from "@/components/books/BookImage";
import { BookActions } from "@/components/books/BookActions";
import { ExternalReference } from "@/components/books/ExternalReference";
import { Tables } from "@/integrations/supabase/types";

interface BookDetailContentProps {
  book: Tables<"books">;
  reservation: {
    profiles: {
      first_name: string;
      last_name: string;
      email: string;
    };
    reserved_at: string;
    user_id: string;
  } | null;
  showButton: boolean;
  onStatusChange: () => void;
  isAdmin: boolean;
  userId: string;
}

export const BookDetailContent = ({
  book,
  reservation,
  showButton,
  onStatusChange,
  isAdmin,
  userId,
}: BookDetailContentProps) => {
  // Determine if the button should be shown based on business rules
  const shouldShowButton = showButton && (
    book.status === "available" || // Show to all logged-in users if book is available
    isAdmin || // Show to admin users always
    (reservation?.user_id === userId) // Show to the user who reserved it
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <BookImage
        imageUrl={book.image_url}
        title={book.title}
        status={book.status}
      />

      <div className="md:col-span-3 space-y-6">
        <BookHeader
          bookId={book.book_id}
          title={book.title}
          author={book.author}
          status={book.status}
          reservation={reservation}
        />

        <BookActions
          showButton={shouldShowButton}
          status={book.status}
          onStatusChange={onStatusChange}
        />

        <BookDetails
          genre={book.genre}
          category={book.category}
          pages={book.pages}
          publicationYear={book.publication_year}
          editorial={book.editorial}
          building={book.building}
        />

        <ExternalReference url={book.external_url} />
      </div>
    </div>
  );
};
