
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [filters, setFilters] = useState<FilterState>({
    genre: "",
    category: "",
    building: "",
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

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Select
        value={filters.genre}
        onValueChange={(value) => handleFilterChange(value, "genre")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("book.genre")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Genres</SelectItem>
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
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("book.category")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Categories</SelectItem>
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
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("book.building")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Buildings</SelectItem>
          {uniqueValues.building.map((building) => (
            <SelectItem key={building} value={building}>
              {building}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BookFilters;
