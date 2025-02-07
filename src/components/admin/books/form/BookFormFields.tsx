
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface BookFormFieldsProps {
  formData: {
    title: string;
    author: string;
    genre: string;
    category: string;
    pages: string;
    publication_year: string;
    editorial: string;
    building: string;
    book_id: string;
    image_url: string;
    external_url: string;
  };
  setFormData: (data: any) => void;
}

const BookFormFields = ({ formData, setFormData }: BookFormFieldsProps) => {
  const { t } = useTranslation();

  return (
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
  );
};

export default BookFormFields;

