import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BookSearchProps {
  onSearch: (query: string) => void;
}

const BookSearch = ({ onSearch }: BookSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        className="pl-10 w-full max-w-xl"
        placeholder="Search by title, author, genre or category..."
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default BookSearch;