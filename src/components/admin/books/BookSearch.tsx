import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookSearchProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const BookSearch = ({ onSearch, initialValue = "" }: BookSearchProps) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(initialValue);
  const [isPressed, setIsPressed] = useState(false);

  const handleSearch = () => {
    onSearch(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex w-full sm:w-auto gap-2">
      <Input
        className="w-full sm:max-w-sm"
        placeholder={t("admin.search")}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      <Button 
        onClick={handleSearch}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={cn(
          "bg-black text-white hover:bg-gray-800 transition-all duration-200",
          isPressed && "transform scale-95"
        )}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default BookSearch;
