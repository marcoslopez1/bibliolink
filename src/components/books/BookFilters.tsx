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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  // Get unique values for each filter and filter out empty/null values
  const uniqueValues = {
    genre: Array.from(new Set(books.map((book) => book.genre).filter(Boolean))),
    category: Array.from(new Set(books.map((book) => book.category).filter(Boolean))),
    building: Array.from(new Set(books.map((book) => book.building).filter(Boolean))),
  };

  const handleFilterChange = (value: string, type: keyof FilterState) => {
    // Add a small delay before processing the filter change
    setTimeout(() => {
      const newFilters = {
        ...filters,
        [type]: value,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }, 100); // Small delay to prevent double-click issue
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "all"
  ).length;

  return (
    <div className="mb-6">
      <div 
        className={cn(
          "flex flex-col gap-4 w-full",
          "relative z-50" // Keep z-index
        )}
        onClick={(e) => e.stopPropagation()}
      >
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
                    <SelectItem key={genre} value={genre || "unknown"}>
                      {genre || t("common.unknown")}
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
                    <SelectItem key={category} value={category || "unknown"}>
                      {category || t("common.unknown")}
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
                    <SelectItem key={building} value={building || "unknown"}>
                      {building || t("common.unknown")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default BookFilters;
