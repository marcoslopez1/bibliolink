import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface BookActionsProps {
  showButton: boolean;
  status: string;
  onStatusChange: () => void;
}

export const BookActions = ({ showButton, status, onStatusChange }: BookActionsProps) => {
  if (!showButton) return null;

  return (
    <Button
      className={`md:w-auto w-full mt-4 ${
        status === "reserved"
          ? "border-2 border-black hover:bg-secondary text-black hover:text-black"
          : ""
      }`}
      size="sm"
      variant={status === "available" ? "default" : "outline"}
      onClick={onStatusChange}
    >
      <BookOpen className="mr-2 h-4 w-4" />
      {status === "available" ? "Reserve Book" : "Return Book"}
    </Button>
  );
};