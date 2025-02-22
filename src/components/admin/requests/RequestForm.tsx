import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BookRequest } from "@/types/bookRequest";

interface RequestFormProps {
  request: BookRequest;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const RequestForm = ({ request, isOpen, onClose, onSave }: RequestFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    editorial: "",
    link: "",
    comments: "",
    status: ""
  });

  useEffect(() => {
    if (request && isOpen) {
      setFormData({
        title: request.title || "",
        author: request.author || "",
        editorial: request.editorial || "",
        link: request.link || "",
        comments: request.comments || "",
        status: request.status
      });
    }
  }, [request, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('book_requests')
        .update({
          title: formData.title.trim(),
          author: formData.author.trim(),
          editorial: formData.editorial.trim() || null,
          link: formData.link.trim() || null,
          comments: formData.comments.trim() || null,
          status: formData.status
        })
        .eq('id', request.id);

      if (error) throw error;
      
      toast({
        description: t("admin.requestUpdated")
      });
      
      onClose();
      if (onSave) onSave();
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        variant: "destructive",
        description: error.message
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("admin.editRequest")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                placeholder={t("bookRequests.form.bookTitle")}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder={t("bookRequests.form.author")}
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder={t("bookRequests.form.editorial")}
                value={formData.editorial}
                onChange={(e) => setFormData({ ...formData, editorial: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder={t("bookRequests.form.link")}
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={t("admin.Status")} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="pending">{t("admin.Status.pending")}</SelectItem>
                  <SelectItem value="accepted">{t("admin.Status.accepted")}</SelectItem>
                  <SelectItem value="rejected">{t("admin.Status.rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Textarea
                placeholder={t("bookRequests.form.comments")}
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">
              {t("common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestForm;
