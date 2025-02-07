
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import BookForm from "@/components/admin/BookForm";
import BookList from "@/components/admin/books/BookList";
import BookHeader from "@/components/admin/books/BookHeader";
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
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

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

      <Input
        placeholder={t("admin.search")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

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

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {Array.from({ length: data?.totalPages || 0 }).map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                onClick={() => setCurrentPage(index + 1)}
                isActive={currentPage === index + 1}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((p) => Math.min(data?.totalPages || 1, p + 1))
              }
              className={
                currentPage === data?.totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <BookForm
        book={selectedBook}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBook(null);
        }}
        onSave={refetch}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this book? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-[#ea384c] hover:bg-[#ea384c]/90"
            >
              {t("admin.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBooks;
