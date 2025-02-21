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
import { Book } from "@/types/book";

const Books = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBookData, setScannedBookData] = useState<Partial<Book> | null>(null);
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data, isLoading, refetch } = useBooks(Number(currentPage), searchQuery);

  const handleDownload = async () => {
    try {
      await downloadBooks(searchQuery);
      toast({
        description: t("admin.downloadSuccess"),
      });
    } catch (error: any) {
      console.error("Download error:", error);
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

      toast({
        description: t("admin.deleteSuccess"),
      });
      
      setIsDeleteDialogOpen(false);
      setBookToDelete(null);
      refetch();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        description: t("common.error"),
        variant: "destructive",
      });
    }
  };

  const handleSearch = useCallback((value: string) => {
    setCurrentPage(1);
    setSearchParams(value ? { q: value } : {}, { replace: true });
  }, [setSearchParams]);

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setIsFormOpen(true);
  };

  const handleScan = () => {
    setIsScannerOpen(true);
  };

  const handleBarcodeScan = async (isbn: string) => {
    try {
      const bookData = await fetchBookData(isbn);
      if (bookData) {
        setScannedBookData(bookData);
        setIsScannerOpen(false);
        setSelectedBook(null);
        setIsFormOpen(true);
      } else {
        toast({
          variant: "destructive",
          description: t("admin.scanner.bookNotFound"),
        });
      }
    } catch (error) {
      console.error("Error fetching book data:", error);
      toast({
        variant: "destructive",
        description: t("admin.scanner.error"),
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BookHeader
        onDownload={handleDownload}
        onNewBook={() => {
          setSelectedBook(null);
          setScannedBookData(null);
          setIsFormOpen(true);
        }}
        onScan={handleScan}
      />

      <div className="space-y-6">
        <BookSearch 
          initialValue={searchQuery}
          onSearch={handleSearch}
        />

        <div className="rounded-md border">
          <BookList
            books={data?.books || []}
            onEdit={handleEdit}
            onDelete={(book) => {
              setBookToDelete(book);
              setIsDeleteDialogOpen(true);
            }}
          />
        </div>

        <BookPagination
          currentPage={currentPage}
          totalPages={data?.totalPages || 1}
          onPageChange={handlePageChange}
        />
      </div>

      <BookForm
        book={selectedBook}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBook(null);
          setScannedBookData(null);
        }}
        onSave={async () => {
          try {
            await refetch();
            setIsFormOpen(false);
            setSelectedBook(null);
            setScannedBookData(null);
          } catch (error) {
            console.error('Failed to refresh book list:', error);
          }
        }}
        initialData={scannedBookData}
      />

      <BookDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </div>
  );
};

export default Books;
