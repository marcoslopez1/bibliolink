import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

interface BookDetailsProps {
  genre: string;
  category: string;
  pages: number;
  publicationYear: number;
  editorial: string;
  building: string;
}

export const BookDetails = ({
  genre,
  category,
  pages,
  publicationYear,
  editorial,
  building,
}: BookDetailsProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t("book.details")}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{t("book.genre")}</h3>
          <p className="mt-1">{genre}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{t("book.category")}</h3>
          <p className="mt-1">{category}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{t("book.pages")}</h3>
          <p className="mt-1">{pages}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{t("book.publicationYear")}</h3>
          <p className="mt-1">{publicationYear}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{t("book.editorial")}</h3>
          <p className="mt-1">{editorial}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{t("book.building")}</h3>
          <p className="mt-1">{building}</p>
        </div>
      </div>
      <Separator className="my-6" />
    </div>
  );
};