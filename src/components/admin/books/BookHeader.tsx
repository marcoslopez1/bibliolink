
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BookHeaderProps {
  onDownload: () => void;
  onNewBook: () => void;
}

const BookHeader = ({ onDownload, onNewBook }: BookHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-semibold">{t("admin.booksManagement")}</h1>
      <div className="flex space-x-2">
        <Button 
          onClick={onDownload}
          className="bg-[#D3E4FD] text-primary hover:bg-[#D3E4FD]/90"
        >
          <Download className="h-4 w-4 mr-2" />
          {t("admin.downloadSelected")}
        </Button>
        <Button 
          onClick={onNewBook}
          className="bg-[#F2FCE2] text-primary hover:bg-[#F2FCE2]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.newEntry")}
        </Button>
      </div>
    </div>
  );
};

export default BookHeader;
