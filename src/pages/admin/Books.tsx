
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import BookList from "@/components/admin/books/BookList";
import BookSearch from "@/components/admin/books/BookSearch";
import BookPagination from "@/components/admin/books/BookPagination";
import BookDeleteDialog from "@/components/admin/books/BookDeleteDialog";
import BookHeader from "@/components/admin/books/BookHeader";
import BookForm from "@/components/admin/BookForm";
import { useBooks } from "@/hooks/admin/useBooks";
import type { Book } from "@/types/book";

const Books = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const searchQuery = searchParams.get("q") || "";

  const { data, isLoading, refetch } = useBooks(currentPage, searchQuery);

  const handleSearch = useCallback((term: string) => {
    setCurrentPage(1);
    setSearchParams(term ? { q: term } : {});
  }, [setSearchParams]);

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBook?.book_id) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('book_id', selectedBook.book_id);

      if (error) throw error;

      toast({
        description: t("admin.deleteSuccess")
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        variant: "destructive",
        description: t("common.error")
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedBook(null);
    }
  };

  const onDeleteClick = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteDialogOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedBook(null);
  };

  const handleSelect = (book: Book) => {
    setSelectedBooks(prev => {
      const isSelected = prev.some(b => b.book_id === book.book_id);
      if (isSelected) {
        return prev.filter(b => b.book_id !== book.book_id);
      }
      return [...prev, book];
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BookHeader 
        selectedBooks={selectedBooks}
        onClearSelection={() => setSelectedBooks([])}
      />

      <BookSearch
        initialValue={searchQuery}
        onSearch={handleSearch}
      />

      <BookList
        books={data?.books || []}
        selectedBooks={selectedBooks}
        onSelect={handleSelect}
        onEdit={handleEdit}
        onDelete={onDeleteClick}
      />

      {data?.totalPages && data.totalPages > 1 && (
        <BookPagination
          currentPage={currentPage}
          totalPages={data.totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {selectedBook && (
        <BookForm
          book={selectedBook}
          isOpen={isFormOpen}
          onClose={closeForm}
          onSave={refetch}
        />
      )}

      <BookDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Books;
