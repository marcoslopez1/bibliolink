
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import BookSearch from "@/components/admin/books/BookSearch";
import BookPagination from "@/components/admin/books/BookPagination";
import BookDeleteDialog from "@/components/admin/books/BookDeleteDialog";
import RequestsTable from "@/components/admin/requests/RequestsTable";
import RequestForm from "@/components/admin/requests/RequestForm";
import RequestsHeader from "@/components/admin/requests/RequestsHeader";
import { useRequests } from "@/hooks/admin/useRequests";
import type { BookRequest } from "@/types/bookRequest";

const RequestsManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BookRequest | null>(null);
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

  const handleDelete = async () => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from('book_requests')
        .delete()
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        description: t("admin.requestDeleted")
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        variant: "destructive",
        description: t("common.error")
      });
    } finally {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RequestsHeader />

      <BookSearch
        initialValue={searchQuery}
        onSearch={handleSearch}
      />

      <RequestsTable
        requests={data?.requests || []}
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

      {selectedRequest && (
        <RequestForm
          request={selectedRequest}
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

export default RequestsManagement;
