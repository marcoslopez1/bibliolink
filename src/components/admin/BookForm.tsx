import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BookFormFields from "./books/form/BookFormFields";
import BookFormActions from "./books/form/BookFormActions";

interface BookFormProps {
  book?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  initialData?: any;
}

const BookForm = ({ book, isOpen, onClose, onSave, initialData }: BookFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    category: "",
    pages: "",
    publication_year: "",
    editorial: "",
    building: "",
    book_id: "",
    image_url: "",
    external_url: "",
    isbn: "",
  });

  // Update form when book prop changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      if (book) {
        setFormData({
          title: book.title || "",
          author: book.author || "",
          genre: book.genre || "",
          category: book.category || "",
          pages: book.pages || "",
          publication_year: book.publication_year || "",
          editorial: book.editorial || "",
          building: book.building || "",
          book_id: book.book_id || "",
          image_url: book.image_url || "",
          external_url: book.external_url || "",
          isbn: book.isbn || "",
        });
      } else if (initialData) {
        setFormData({
          ...formData,
          ...initialData,
        });
      } else {
        // Reset form for new entries
        setFormData({
          title: "",
          author: "",
          genre: "",
          category: "",
          pages: "",
          publication_year: "",
          editorial: "",
          building: "",
          book_id: "",
          image_url: "",
          external_url: "",
          isbn: "",
        });
      }
    }
  }, [isOpen, book, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const processedData = {
        ...formData,
        pages: parseInt(formData.pages.toString()),
        publication_year: parseInt(formData.publication_year.toString()),
        isbn: formData.isbn ? parseFloat(formData.isbn) : null,
        ...(book ? {} : { 
          created_at: new Date().toISOString(),
          status: 'available'
        })
      };

      if (book) {
        const { error } = await supabase
          .from("books")
          .update(processedData)
          .eq("id", book.id);
        if (error) throw error;
        toast({ description: t("admin.bookUpdated") });
      } else {
        const { error } = await supabase
          .from("books")
          .insert(processedData);
        if (error) {
          // Check for duplicate book_id error
          if (error.message?.includes('books_book_id_key')) {
            throw new Error(t("admin.errors.duplicateBookId"));
          }
          throw error;
        }
        toast({ description: t("admin.bookCreated") });
      }
      
      onClose();
      if (typeof onSave === 'function') {
        await onSave();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] h-[90vh] sm:h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {book ? t("admin.editBook") : t("admin.newEntry")}
          </DialogTitle>
          <DialogDescription>
            {book ? t("admin.editBookDescription") : t("admin.newBookDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <BookFormFields formData={formData} setFormData={setFormData} />
          <BookFormActions onCancel={onClose} isEditing={!!book} />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookForm;
