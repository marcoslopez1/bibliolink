import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter, ChevronUp, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

interface FilterState {
  genre: string;
  category: string;
  building: string;
}

interface BookFiltersProps {
  books: any[];
  onFilterChange: (filters: FilterState) => void;
}

const BookFilters = ({ books, onFilterChange }: BookFiltersProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    genre: "all",
    category: "all",
    building: "all",
  });

  // Get unique values for each filter
  const uniqueValues = {
    genre: Array.from(new Set(books.map((book) => book.genre))),
    category: Array.from(new Set(books.map((book) => book.category))),
    building: Array.from(new Set(books.map((book) => book.building))),
  };

  const handleFilterChange = (value: string, type: keyof FilterState) => {
    const newFilters = {
      ...filters,
      [type]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "all"
  ).length;

  return (
    <div className="mb-6">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2"
      >
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-2 group hover:text-accent transition-colors">
            <Filter className="h-5 w-5" />
            <span className="font-medium">
              {t("filters.title")} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform" />
            )}
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-4">
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
            <Select
              value={filters.genre}
              onValueChange={(value) => handleFilterChange(value, "genre")}
            >
              <SelectTrigger className={isMobile ? "w-full" : "w-[180px]"}>
                <SelectValue placeholder={t("book.genre")} />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="all">{t("filters.allGenres")}</SelectItem>
                {uniqueValues.genre.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange(value, "category")}
            >
              <SelectTrigger className={isMobile ? "w-full" : "w-[180px]"}>
                <SelectValue placeholder={t("book.category")} />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
                {uniqueValues.category.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.building}
              onValueChange={(value) => handleFilterChange(value, "building")}
            >
              <SelectTrigger className={isMobile ? "w-full" : "w-[180px]"}>
                <SelectValue placeholder={t("book.building")} />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="all">{t("filters.allBuildings")}</SelectItem>
                {uniqueValues.building.map((building) => (
                  <SelectItem key={building} value={building}>
                    {building}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default BookFilters;
