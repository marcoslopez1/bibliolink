
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "use-debounce";
import { supabase } from "@/integrations/supabase/client";
import BookForm from "@/components/admin/BookForm";
import BookList from "@/components/admin/books/BookList";
import BookHeader from "@/components/admin/books/BookHeader";
import BookSearch from "@/components/admin/books/BookSearch";
import BookPagination from "@/components/admin/books/BookPagination";
import BookDeleteDialog from "@/components/admin/books/BookDeleteDialog";
import { useBooks } from "@/hooks/admin/useBooks";

const AdminBooks = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<any>(null);
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data, isLoading, refetch } = useBooks(currentPage, debouncedSearchQuery);

  const handleDownload = async () => {
    try {
      if (!data?.books) return;

      const csvContent = [
        Object.keys(data.books[0]).join(","),
        ...data.books.map((book) =>
          Object.values(book)
            .map((value) => `"${value}"`)
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "books.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;

    try {
      const { error } = await supabase
        .from("books")
        .delete()
        .eq("id", bookToDelete.id);

      if (error) throw error;

      toast({ description: "Book deleted successfully" });
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BookHeader
        onDownload={handleDownload}
        onNewBook={() => {
          setSelectedBook(null);
          setIsFormOpen(true);
        }}
      />

      <BookSearch value={searchQuery} onChange={setSearchQuery} />

      <BookList
        books={data?.books || []}
        onEdit={(book) => {
          setSelectedBook(book);
          setIsFormOpen(true);
        }}
        onDelete={(book) => {
          setBookToDelete(book);
          setIsDeleteDialogOpen(true);
        }}
      />

      <BookPagination
        currentPage={currentPage}
        totalPages={data?.totalPages || 1}
        onPageChange={setCurrentPage}
      />

      <BookForm
        book={selectedBook}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBook(null);
        }}
        onSave={refetch}
      />

      <BookDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminBooks;
