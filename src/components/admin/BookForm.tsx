
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="book_id">{t("book.bookId")}</Label>
              <Input
                id="book_id"
                value={formData.book_id}
                onChange={(e) =>
                  setFormData({ ...formData, book_id: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">{t("book.title")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">{t("book.author")}</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">{t("book.genre")}</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t("book.category")}</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pages">{t("book.pages")}</Label>
              <Input
                id="pages"
                type="number"
                value={formData.pages}
                onChange={(e) =>
                  setFormData({ ...formData, pages: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publication_year">
                {t("book.publicationYear")}
              </Label>
              <Input
                id="publication_year"
                type="number"
                value={formData.publication_year}
                onChange={(e) =>
                  setFormData({ ...formData, publication_year: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editorial">{t("book.editorial")}</Label>
              <Input
                id="editorial"
                value={formData.editorial}
                onChange={(e) =>
                  setFormData({ ...formData, editorial: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="building">{t("book.building")}</Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) =>
                  setFormData({ ...formData, building: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="external_url">External URL</Label>
              <Input
                id="external_url"
                value={formData.external_url}
                onChange={(e) =>
                  setFormData({ ...formData, external_url: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookForm;
