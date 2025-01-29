import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: book, isLoading, refetch } = useQuery({
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

  const handleStatusChange = async () => {
    const newStatus = book?.status === "available" ? "reserved" : "available";
    const { error } = await supabase
      .from("books")
      .update({ status: newStatus })
      .eq("book_id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update book status",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Book ${newStatus === "available" ? "returned" : "reserved"} successfully`,
    });
    refetch();
  };

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
    <div className="container px-4 py-4">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
              <img
                src={book.image_url}
                alt={book.title}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{book.book_id}</p>
                  <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                  <p className="text-xl text-gray-600">{book.author}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    book.status === "available"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {book.status}
                </span>
              </div>

              <Button
                className="w-full"
                variant={book.status === "available" ? "default" : "destructive"}
                onClick={handleStatusChange}
              >
                {book.status === "available" ? "Reserve Book" : "Return Book"}
              </Button>
            </div>

            <div className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Book Details</h2>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Genre</h3>
                  <p className="mt-1">{book.genre}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1">{book.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Pages</h3>
                  <p className="mt-1">{book.pages}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Publication Year
                  </h3>
                  <p className="mt-1">{book.publication_year}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Editorial</h3>
                  <p className="mt-1">{book.editorial}</p>
                </div>
              </div>

              {book.external_url && (
                <div className="mt-4">
                  <a
                    href={book.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80 inline-flex items-center gap-1"
                  >
                    External Reference <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;