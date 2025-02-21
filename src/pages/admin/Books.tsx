
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BookForm from "@/components/admin/BookForm";
import BookList from "@/components/admin/books/BookList";
import BookHeader from "@/components/admin/books/BookHeader";
import BookSearch from "@/components/admin/books/BookSearch";
import BookPagination from "@/components/admin/books/BookPagination";
import BookDeleteDialog from "@/components/admin/books/BookDeleteDialog";
import BarcodeScanner from "@/components/admin/books/scanner/BarcodeScanner";
import { useBooks } from "@/hooks/admin/useBooks";
import { downloadBooks } from "@/utils/download";
import { fetchBookData } from "@/services/bookApis";
import type { Book } from "@/types/book";

const Books = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const searchQuery = searchParams.get("q") || "";

  const { data, isLoading, refetch } = useBooks(currentPage, searchQuery);

  const handleSearch = useCallback((term: string) => {
    setCurrentPage(1);
    setSearchParams(term ? { q: term } : {});
  }, [setSearchParams]);

  const handleScanResult = async (isbn: string) => {
    try {
      const bookData = await fetchBookData(isbn);
      if (bookData) {
        setSelectedBook(bookData);
        setIsScannerOpen(false);
        setIsFormOpen(true);
      }
    } catch (error) {
      console.error("Error fetching book data:", error);
      toast({
        variant: "destructive",
        description: t("common.error")
      });
    }
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBook) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', selectedBook.id);

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

  const onDownloadSelected = (selectedBooks: Book[]) => {
    downloadBooks(selectedBooks);
    toast({
      description: t("admin.downloadSuccess")
    });
  };

  const onDeleteClick = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteDialogOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedBook(null);
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
      <BookHeader onNewBook={() => setIsFormOpen(true)} onScanBook={() => setIsScannerOpen(true)} />

      <BookSearch
        initialValue={searchQuery}
        onSearch={handleSearch}
      />

      <BookList
        books={data?.books || []}
        onEdit={handleEdit}
        onDelete={onDeleteClick}
        onDownloadSelected={onDownloadSelected}
      />

      {data?.totalPages && data.totalPages > 1 && (
        <BookPagination
          currentPage={currentPage}
          totalPages={data.totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <BookForm
        book={selectedBook}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={refetch}
      />

      <BookDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />

      <BarcodeScanner
        isOpen={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onResult={handleScanResult}
      />
    </div>
  );
};

export default Books;
