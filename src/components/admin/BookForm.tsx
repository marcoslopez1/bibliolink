
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BookFormFields from "./books/form/BookFormFields";
import BookFormActions from "./books/form/BookFormActions";

interface BookFormProps {
  book?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const BookForm = ({ book, isOpen, onClose, onSave }: BookFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    genre: book?.genre || "",
    category: book?.category || "",
    pages: book?.pages || "",
    publication_year: book?.publication_year || "",
    editorial: book?.editorial || "",
    building: book?.building || "",
    book_id: book?.book_id || "",
    image_url: book?.image_url || "",
    external_url: book?.external_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (book) {
        const { error } = await supabase
          .from("books")
          .update(formData)
          .eq("id", book.id);
        if (error) throw error;
        toast({ description: "Book updated successfully" });
      } else {
        const { error } = await supabase.from("books").insert([formData]);
        if (error) throw error;
        toast({ description: "Book created successfully" });
      }
      onSave();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {book ? t("admin.edit") : t("admin.newEntry")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <BookFormFields formData={formData} setFormData={setFormData} />
          <BookFormActions onClose={onClose} />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookForm;

