
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import type { BookRequest } from "@/types/bookRequest";

const MyRequests = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    editorial: "",
    link: "",
    comments: "",
  });

  // Fetch requests
  const { data: requests = [] } = useQuery({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BookRequest[];
    },
  });

  // Create request mutation
  const createRequest = useMutation({
    mutationFn: async (newRequest: Omit<BookRequest, "id" | "status" | "created_at" | "created_by" | "user_first_name" | "user_last_name" | "user_email">) => {
      const { data, error } = await supabase
        .from("book_requests")
        .insert({
          ...newRequest,
          created_by: session?.user.id,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        description: t("bookRequests.form.success")
      });
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        author: "",
        editorial: "",
        link: "",
        comments: "",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: t("bookRequests.form.error")
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate(formData);
  };

  const getStatusBadge = (status: BookRequest["status"]) => {
    const variants = {
      accepted: "bg-green-100 text-green-800",
      pending: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={variants[status]}>
        {t(`bookRequests.list.status.${status}`)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold">{t("bookRequests.title")}</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full md:w-auto">
          {t("bookRequests.form.title")}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("bookRequests.form.title")}</DialogTitle>
            <DialogDescription>
              {t("bookRequests.form.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {t("bookRequests.form.bookTitle")}
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t("bookRequests.form.bookTitle")}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("bookRequests.form.author")}
              </label>
              <Input
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder={t("bookRequests.form.author")}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("bookRequests.form.editorial")}
              </label>
              <Input
                name="editorial"
                value={formData.editorial}
                onChange={handleInputChange}
                placeholder={t("bookRequests.form.editorial")}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("bookRequests.form.link")}
              </label>
              <Input
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder={t("bookRequests.form.link")}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("bookRequests.form.comments")}
              </label>
              <Textarea
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                placeholder={t("bookRequests.form.comments")}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending ? t("common.loading") : t("bookRequests.form.send")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          {t("bookRequests.list.title")}
        </h2>
        {requests.length === 0 ? (
          <p className="text-gray-500">{t("bookRequests.list.noRequests")}</p>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="p-6 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{request.title}</h3>
                  <p className="text-gray-600">{request.author}</p>
                  {request.editorial && (
                    <p className="text-gray-500 text-sm">{request.editorial}</p>
                  )}
                  {request.comments && (
                    <p className="text-gray-600 mt-2">{request.comments}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-2">
                    {t("bookRequests.list.requestDate")}: {format(new Date(request.created_at), "PP")}
                  </p>
                </div>
                <div>
                  {getStatusBadge(request.status)}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyRequests;
