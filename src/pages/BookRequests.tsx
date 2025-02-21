
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { BookRequest } from "@/types/bookRequest";

const BookRequests = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    editorial: "",
    link: "",
    comments: ""
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Ensure the data matches our BookRequest type
      const typedData = (data || []) as BookRequest[];
      setRequests(typedData);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        variant: "destructive",
        description: t("common.error")
      });
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title.trim() || !formData.author.trim()) {
      toast({
        variant: "destructive",
        description: t("bookRequests.form.requiredFields")
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        variant: "destructive",
        description: t("common.unauthorized")
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('book_requests')
        .insert({
          title: formData.title.trim(),
          author: formData.author.trim(),
          editorial: formData.editorial.trim() || null,
          link: formData.link.trim() || null,
          comments: formData.comments.trim() || null,
          created_by: user.id
        });

      if (error) throw error;

      setIsFormOpen(false);
      setFormData({ title: "", author: "", editorial: "", link: "", comments: "" });
      fetchRequests();
      
      toast({
        description: t("bookRequests.form.success")
      });
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        variant: "destructive",
        description: error.message
      });
    }
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

  return (
    <div className="container py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("bookRequests.title")}</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          {t("admin.newEntry")}
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("bookRequests.form.title")}</DialogTitle>
            <DialogDescription>
              {t("bookRequests.form.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder={t("bookRequests.form.bookTitle")}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              placeholder={t("bookRequests.form.author")}
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
            <Input
              placeholder={t("bookRequests.form.editorial")}
              value={formData.editorial}
              onChange={(e) => setFormData({ ...formData, editorial: e.target.value })}
            />
            <Input
              placeholder={t("bookRequests.form.link")}
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
            <Textarea
              placeholder={t("bookRequests.form.comments")}
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                {t("bookRequests.form.cancel")}
              </Button>
              <Button onClick={handleSubmit}>
                {t("bookRequests.form.send")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("bookRequests.list.title")}</h2>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("bookRequests.list.noRequests")}
          </div>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{request.title}</h3>
                  <p className="text-muted-foreground">{request.author}</p>
                  {request.editorial && (
                    <p className="text-sm mt-2">{request.editorial}</p>
                  )}
                  {request.link && (
                    <a
                      href={request.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-1 block"
                    >
                      {request.link}
                    </a>
                  )}
                  {request.comments && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      {request.comments}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant={getStatusBadgeVariant(request.status)}>
                      {t(`bookRequests.list.status.${request.status}`)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {t("bookRequests.list.requestDate")}: {format(new Date(request.created_at), "yyyy-MM-dd")}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BookRequests;
