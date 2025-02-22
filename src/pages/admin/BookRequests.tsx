import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Loader2, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BookSearch from "@/components/admin/books/BookSearch";
import BookPagination from "@/components/admin/books/BookPagination";
import BookDeleteDialog from "@/components/admin/books/BookDeleteDialog";
import RequestForm from "@/components/admin/requests/RequestForm";
import { useRequests } from "@/hooks/admin/useRequests";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import type { BookRequest } from "@/types/bookRequest";

interface BookRequest {
  id: number;
  title: string;
  author: string;
  editorial: string;
  reference: string;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  comments: string;
  requestDate: string;
  status: "pending" | "accepted" | "rejected";
}

const BookRequests = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BookRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchQuery = searchParams.get("q") || "";

  const { data, isLoading, refetch } = useRequests(currentPage, searchQuery);

  const handleSearch = useCallback((term: string) => {
    setCurrentPage(1);
    setSearchParams(term ? { q: term } : {});
  }, [setSearchParams]);

  const handleEdit = (request: BookRequest) => {
    setSelectedRequest(request);
    setIsFormOpen(true);
  };

  // Fetch admin status
  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session?.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id,
  });

  const handleDelete = async () => {
    if (!selectedRequest || !session?.user) return;

    setIsDeleting(true);
    try {
      // First check if the user has permission to delete this request
      const { data: requestData, error: fetchError } = await supabase
        .from('book_requests')
        .select('created_by')
        .eq('id', selectedRequest.id)
        .single();

      if (fetchError) throw fetchError;

      // Allow deletion if user is admin or the creator of the request
      if (!profile?.is_admin && requestData.created_by !== session.user.id) {
        throw new Error('You do not have permission to delete this request');
      }

      const { error } = await supabase
        .from('book_requests')
        .delete()
        .match({ id: selectedRequest.id });

      if (error) throw error;

      toast({
        description: t("admin.requestDeleted")
      });
      
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["book-requests"] });
    } catch (error: any) {
      console.error('Error deleting request:', error);
      toast({
        variant: "destructive",
        description: error.message === 'You do not have permission to delete this request'
          ? t("common.unauthorized")
          : t("common.error")
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const onDeleteClick = (request: BookRequest) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedRequest(null);
  };

  const getStatusBadgeVariant = (status: BookRequest["status"]) => {
    switch (status) {
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t("admin.bookRequests.title")}</h1>

      <div className="mb-6">
        <BookSearch
          initialValue={searchQuery}
          onSearch={handleSearch}
        />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.bookRequests.table.bookTitle")}</TableHead>
              <TableHead>{t("admin.bookRequests.table.author")}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("admin.bookRequests.table.editorial")}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {t("admin.bookRequests.table.userName")}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {t("admin.bookRequests.table.userEmail")}
              </TableHead>
              <TableHead>{t("admin.bookRequests.table.status")}</TableHead>
              <TableHead className="text-right">{t("admin.bookRequests.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.requests || []).map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.title}</TableCell>
                <TableCell>{request.author}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {request.editorial}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {`${request.user_first_name} ${request.user_last_name}`}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {request.user_email}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(request.status)}>
                    {t(`admin.bookRequests.status.${request.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(request)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteClick(request)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data?.totalPages && data.totalPages > 1 && (
        <div className="mt-4">
          <BookPagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {selectedRequest && (
        <RequestForm
          request={selectedRequest}
          isOpen={isFormOpen}
          onClose={closeForm}
          onSave={() => {
            refetch();
            closeForm();
          }}
        />
      )}

      <BookDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t("admin.bookRequests.deleteConfirm.title")}
        description={t("admin.deleteRequestConfirmation")}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BookRequests;
