import { useState } from "react";
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
import { useTranslation } from "react-i18next";

const ITEMS_PER_PAGE = 10;

const AdminBooks = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-books", currentPage],
    queryFn: async () => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const [{ data: books, count }, { data: totalCount }] = await Promise.all([
        supabase
          .from("books")
          .select("*", { count: "exact" })
          .range(start, end)
          .order("id", { ascending: false }),
        supabase.from("books").select("id", { count: "exact" }),
      ]);

      return {
        books,
        totalPages: Math.ceil((totalCount?.length || 0) / ITEMS_PER_PAGE),
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("admin.booksManagement")}</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Book ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Editorial</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Building</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.books?.map((book) => (
              <TableRow key={book.id}>
                <TableCell>{book.id}</TableCell>
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
    </div>
  );
};

export default AdminBooks;