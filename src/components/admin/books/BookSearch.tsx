
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface BookSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const BookSearch = ({ value, onChange }: BookSearchProps) => {
  const { t } = useTranslation();

  return (
    <Input
      placeholder={t("admin.search")}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-sm"
    />
  );
};

export default BookSearch;
