import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const BookDetail = () => {
  const { id } = useParams();

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("book_id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Book not found</h2>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{book.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
            <img
              src={book.image_url}
              alt={book.title}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Book Details</h3>
              <dl className="mt-2 space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Book ID</dt>
                  <dd className="mt-1">{book.book_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Author</dt>
                  <dd className="mt-1">{book.author}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Genre</dt>
                  <dd className="mt-1">{book.genre}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1">{book.category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pages</dt>
                  <dd className="mt-1">{book.pages}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Publication Year
                  </dt>
                  <dd className="mt-1">{book.publication_year}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Editorial</dt>
                  <dd className="mt-1">{book.editorial}</dd>
                </div>
                {book.external_url && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      External Reference
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={book.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 inline-flex items-center gap-1"
                      >
                        Visit reference <ExternalLink className="h-4 w-4" />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookDetail;