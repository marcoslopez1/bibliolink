import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink, Image } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface BookListProps {
  books: any[];
  onEdit: (book: any) => void;
  onDelete: (book: any) => void;
}

const BookList = ({ books, onEdit, onDelete }: BookListProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border">
      <Table className="bg-white">
        <TableHeader>
          <TableRow>
            <TableHead>{t("book.bookId")}</TableHead>
            <TableHead>{t("book.title")}</TableHead>
            <TableHead>{t("book.author")}</TableHead>
            <TableHead>{t("book.genre")}</TableHead>
            <TableHead>{t("book.category")}</TableHead>
            <TableHead>{t("book.pages")}</TableHead>
            <TableHead>{t("book.publicationYear")}</TableHead>
            <TableHead>{t("book.editorial")}</TableHead>
            <TableHead>{t("book.building")}</TableHead>
            <TableHead>{t("book.statusHeader")}</TableHead>
            <TableHead>Links</TableHead>
            <TableHead className="text-right">{t("admin.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books?.map((book) => (
            <TableRow key={book.id}>
              <TableCell>
                <Link 
                  to={`/book/${book.book_id}`}
                  className="text-primary hover:underline underline"
                >
                  {book.book_id}
                </Link>
              </TableCell>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.genre}</TableCell>
              <TableCell>{book.category}</TableCell>
              <TableCell>{book.pages}</TableCell>
              <TableCell>{book.publication_year}</TableCell>
              <TableCell>{book.editorial}</TableCell>
              <TableCell>{book.building}</TableCell>
              <TableCell>
                {book.status === 'available' 
                  ? t("book.status.available") 
                  : t("book.status.reserved")
                }
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {book.external_url && (
                    <a
                      href={book.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {book.image_url && (
                    <a
                      href={book.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <Image className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(book)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(book)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookList;
