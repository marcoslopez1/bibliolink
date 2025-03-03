import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BookSearchProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const BookSearch = ({ onSearch, initialValue = "" }: BookSearchProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        className="pl-10 w-full max-w-xl"
        placeholder={t("search.placeholder")}
        onChange={(e) => onSearch(e.target.value)}
        defaultValue={initialValue}
      />
    </div>
  );
};

export default BookSearch;