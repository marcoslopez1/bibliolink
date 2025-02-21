
import { Button } from "@/components/ui/button";
import { Download, Plus, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BookHeaderProps {
  onDownload: () => void;
  onNewBook: () => void;
  onScan: () => void;
}

const BookHeader = ({ onDownload, onNewBook, onScan }: BookHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <h1 className="text-2xl font-semibold">{t("admin.catalogManagement")}</h1>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <Button 
          onClick={onScan}
          className="flex-1 sm:flex-none bg-[#E5ECF6] text-primary hover:bg-[#E5ECF6]/90"
        >
          <Camera className="h-4 w-4 mr-2" />
          <span className="whitespace-nowrap">{t("admin.scanBook")}</span>
        </Button>
        <Button 
          onClick={onDownload}
          className="flex-1 sm:flex-none bg-[#D3E4FD] text-primary hover:bg-[#D3E4FD]/90"
        >
          <Download className="h-4 w-4 mr-2" />
          <span className="whitespace-nowrap">{t("admin.downloadSelected")}</span>
        </Button>
        <Button 
          onClick={onNewBook}
          className="flex-1 sm:flex-none bg-[#F2FCE2] text-primary hover:bg-[#F2FCE2]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="whitespace-nowrap">{t("admin.newEntry")}</span>
        </Button>
      </div>
    </div>
  );
};

export default BookHeader;
