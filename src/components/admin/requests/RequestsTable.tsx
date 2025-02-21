
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { BookRequest } from "@/types/bookRequest";

interface RequestsTableProps {
  requests: BookRequest[];
  onEdit: (request: BookRequest) => void;
  onDelete: (request: BookRequest) => void;
}

const RequestsTable = ({ requests, onEdit, onDelete }: RequestsTableProps) => {
  const { t } = useTranslation();

  const getStatusBadgeVariant = (status: BookRequest["status"]) => {
    switch (status) {
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("book.title")}</TableHead>
            <TableHead>{t("book.author")}</TableHead>
            <TableHead>{t("book.editorial")}</TableHead>
            <TableHead>{t("admin.Name")}</TableHead>
            <TableHead>{t("admin.Lastname")}</TableHead>
            <TableHead>{t("admin.Email")}</TableHead>
            <TableHead>{t("bookRequests.form.link")}</TableHead>
            <TableHead>{t("bookRequests.form.comments")}</TableHead>
            <TableHead>{t("admin.Status")}</TableHead>
            <TableHead>{t("bookRequests.list.requestDate")}</TableHead>
            <TableHead className="text-right">{t("admin.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.title}</TableCell>
              <TableCell>{request.author}</TableCell>
              <TableCell>{request.editorial}</TableCell>
              <TableCell>{request.user_first_name}</TableCell>
              <TableCell>{request.user_last_name}</TableCell>
              <TableCell>{request.user_email}</TableCell>
              <TableCell>
                {request.link && (
                  <a
                    href={request.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {t("bookRequests.form.viewLink")}
                  </a>
                )}
              </TableCell>
              <TableCell>{request.comments}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(request.status)}>
                  {t(`admin.Status.${request.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(request.created_at), "yyyy-MM-dd")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(request)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(request)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestsTable;
