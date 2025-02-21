
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import BookSearch from "@/components/admin/books/BookSearch";
import BookPagination from "@/components/admin/books/BookPagination";
import BookDeleteDialog from "@/components/admin/books/BookDeleteDialog";
import RequestsTable from "@/components/admin/requests/RequestsTable";
import RequestForm from "@/components/admin/requests/RequestForm";
import { Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const RequestsManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const searchQuery = searchParams.get("q") || "";

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["requests", currentPage, searchQuery],
    queryFn: async () => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('book_requests')
        .select('*', { count: 'exact' });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`);
      }

      const { data, count, error } = await query
        .range(start, end)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        requests: data || [],
        totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0
      };
    },
  });

  const handleSearch = useCallback((term: string) => {
    setCurrentPage(1);
    setSearchParams(term ? { q: term } : {});
  }, [setSearchParams]);

  const handleEdit = (request: any) => {
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

  const onDeleteClick = (request: any) => {
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          {t("admin.requestsManagement")}
        </h1>
      </div>

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
