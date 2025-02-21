
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    isbn: string;
  };
  setFormData: (data: any) => void;
}

interface SettingItem {
  id: number;
  name: string;
}

const BookFormFields = ({ formData, setFormData }: BookFormFieldsProps) => {
  const { t } = useTranslation();
  const [genres, setGenres] = useState<SettingItem[]>([]);
  const [categories, setCategories] = useState<SettingItem[]>([]);
  const [buildings, setBuildings] = useState<SettingItem[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const [genresData, categoriesData, buildingsData] = await Promise.all([
        supabase.from("genres").select("*").order("name"),
        supabase.from("categories").select("*").order("name"),
        supabase.from("buildings").select("*").order("name"),
      ]);

      if (genresData.data) setGenres(genresData.data);
      if (categoriesData.data) setCategories(categoriesData.data);
      if (buildingsData.data) setBuildings(buildingsData.data);
    };

    fetchSettings();
  }, []);

  const NoItemsAlert = ({ type }: { type: 'genres' | 'categories' | 'buildings' }) => (
    <Alert variant="destructive" className="mt-2">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center gap-2">
        {t(`admin.settings.no${type.charAt(0).toUpperCase() + type.slice(1)}`)}
        <Link 
          to="/admin/settings" 
          className="text-primary underline hover:text-primary/90"
        >
          {t("admin.settings")}
        </Link>
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <Select
          value={formData.genre}
          onValueChange={(value) => setFormData({ ...formData, genre: value })}
        >
          <SelectTrigger id="genre">
            <SelectValue placeholder={t("book.genre")} />
          </SelectTrigger>
          <SelectContent>
            {genres.map((genre) => (
              <SelectItem key={genre.id} value={genre.name}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {genres.length === 0 && <NoItemsAlert type="genres" />}
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">{t("book.category")}</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder={t("book.category")} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {categories.length === 0 && <NoItemsAlert type="categories" />}
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
        <Select
          value={formData.building}
          onValueChange={(value) => setFormData({ ...formData, building: value })}
        >
          <SelectTrigger id="building">
            <SelectValue placeholder={t("book.building")} />
          </SelectTrigger>
          <SelectContent>
            {buildings.map((building) => (
              <SelectItem key={building.id} value={building.name}>
                {building.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {buildings.length === 0 && <NoItemsAlert type="buildings" />}
      </div>
      <div className="space-y-2">
        <Label htmlFor="image_url">{t("book.imageUrl")}</Label>
        <Input
          id="image_url"
          value={formData.image_url}
          onChange={(e) =>
            setFormData({ ...formData, image_url: e.target.value })
          }
          placeholder={t("common.optional")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="external_url">{t("book.externalUrl")}</Label>
        <Input
          id="external_url"
          value={formData.external_url}
          onChange={(e) =>
            setFormData({ ...formData, external_url: e.target.value })
          }
          placeholder={t("common.optional")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="isbn">{t("book.isbn")}</Label>
        <Input
          id="isbn"
          type="number"
          value={formData.isbn}
          onChange={(e) =>
            setFormData({ ...formData, isbn: e.target.value })
          }
          placeholder={t("common.optional")}
        />
      </div>
    </div>
  );
};

export default BookFormFields;
