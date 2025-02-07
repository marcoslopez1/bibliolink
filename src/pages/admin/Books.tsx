
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import BookForm from "@/components/admin/BookForm";
import { Pencil, Trash2, Download, Plus, ExternalLink, Image } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useDebounce } from "use-debounce";

const ITEMS_PER_PAGE = 10;

const AdminBooks = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<any>(null);
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-books", currentPage, debouncedSearchQuery],
    queryFn: async () => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("books")
        .select("*", { count: "exact" });

      if (debouncedSearchQuery) {
        query = query.or(
          `title.ilike.%${debouncedSearchQuery}%,author.ilike.%${debouncedSearchQuery}%,genre.ilike.%${debouncedSearchQuery}%,category.ilike.%${debouncedSearchQuery}%,book_id.ilike.%${debouncedSearchQuery}%,editorial.ilike.%${debouncedSearchQuery}%,building.ilike.%${debouncedSearchQuery}%`
        );
      }

      const { data: books, count } = await query
        .range(start, end)
        .order("id", { ascending: false });

      return {
        books,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
      };
    },
  });

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{t("admin.booksManagement")}</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={handleDownload}
            className="bg-[#D3E4FD] text-primary hover:bg-[#D3E4FD]/90"
          >
            <Download className="h-4 w-4 mr-2" />
            {t("admin.downloadSelected")}
          </Button>
          <Button 
            onClick={() => {
              setSelectedBook(null);
              setIsFormOpen(true);
            }}
            className="bg-[#F2FCE2] text-primary hover:bg-[#F2FCE2]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("admin.newEntry")}
          </Button>
        </div>
      </div>

      <Input
        placeholder={t("admin.search")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("book.bookId")}</TableHead>
              <TableHead>{t("book.title")}</TableHead>
              <TableHead>{t("book.author")}</TableHead>
              <TableHead>{t("book.genre")}</TableHead>
              <TableHead>{t("book.category")}</TableHead>
              <TableHead>{t("book.pages")}</TableHead>
              <TableHead>{t("book.publicationYear")}</TableHead>
              <TableHead>{t("book.editorial")}</TableHead>
              <TableHead>{t("book.status")}</TableHead>
              <TableHead>{t("book.building")}</TableHead>
              <TableHead>Links</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.books?.map((book) => (
              <TableRow key={book.id}>
                <TableCell>{book.book_id}</TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.genre}</TableCell>
                <TableCell>{book.category}</TableCell>
                <TableCell>{book.pages}</TableCell>
                <TableCell>{book.publication_year}</TableCell>
                <TableCell>{book.editorial}</TableCell>
                <TableCell>{book.status}</TableCell>
                <TableCell>{book.building}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {book.external_url && (
                      <a
                        href={book.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {book.image_url && (
                      <a
                        href={book.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <Image className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedBook(book);
                      setIsFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBookToDelete(book);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
