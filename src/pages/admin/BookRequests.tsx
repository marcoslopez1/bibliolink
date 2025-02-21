import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Trash2 } from "lucide-react";

interface BookRequest {
  id: number;
  title: string;
  author: string;
  editorial: string;
  reference: string;
  userName: string;
  userLastName: string;
  userEmail: string;
  comments: string;
  requestDate: string;
  status: "pending" | "accepted" | "rejected";
}

const BookRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<BookRequest[]>([
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      editorial: "Scribner",
      reference: "https://example.com/book1",
      userName: "John",
      userLastName: "Doe",
      userEmail: "john.doe@example.com",
      comments: "Would love to read this classic",
      requestDate: "2025-02-21",
      status: "pending",
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      editorial: "Penguin Books",
      reference: "https://example.com/book2",
      userName: "Jane",
      userLastName: "Smith",
      userEmail: "jane.smith@example.com",
      comments: "Heard great things about this book",
      requestDate: "2025-02-20",
      status: "accepted",
    },
    {
      id: 3,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      editorial: "Little, Brown and Company",
      reference: "https://example.com/book3",
      userName: "Bob",
      userLastName: "Johnson",
      userEmail: "bob.johnson@example.com",
      comments: "Required for literature class",
      requestDate: "2025-02-19",
      status: "rejected",
    },
  ]);

  const [editingRequest, setEditingRequest] = useState<BookRequest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);

  const getStatusBadge = (status: BookRequest["status"]) => {
    const variants = {
      pending: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={variants[status]}>
        {t(`admin.bookRequests.status.${status}`)}
      </Badge>
    );
  };

  const handleEdit = (request: BookRequest) => {
    setEditingRequest(request);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setRequestToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (editingRequest) {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === editingRequest.id ? editingRequest : req
        )
      );
      setIsEditDialogOpen(false);
      setEditingRequest(null);
    }
  };

  const handleConfirmDelete = () => {
    if (requestToDelete) {
      setRequests((prev) => prev.filter((req) => req.id !== requestToDelete));
      setIsDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t("admin.bookRequests.title")}</h1>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.bookRequests.table.bookTitle")}</TableHead>
              <TableHead>{t("admin.bookRequests.table.author")}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("admin.bookRequests.table.editorial")}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {t("admin.bookRequests.table.userName")}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {t("admin.bookRequests.table.userEmail")}
              </TableHead>
              <TableHead>{t("admin.bookRequests.table.status")}</TableHead>
              <TableHead className="text-right">{t("admin.bookRequests.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.title}</TableCell>
                <TableCell>{request.author}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {request.editorial}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {`${request.userName} ${request.userLastName}`}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {request.userEmail}
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full"
                      onClick={() => handleEdit(request)}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full text-red-600"
                      onClick={() => handleDelete(request.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("admin.bookRequests.editForm.title")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto px-6">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium col-span-1">
                    {t("admin.bookRequests.editForm.bookTitle")}
                  </label>
                  <Input
                    className="col-span-3"
                    value={editingRequest?.title || ""}
                    onChange={(e) =>
                      setEditingRequest(
                        (prev) => prev && { ...prev, title: e.target.value }
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium col-span-1">
                    {t("admin.bookRequests.editForm.author")}
                  </label>
                  <Input
                    className="col-span-3"
                    value={editingRequest?.author || ""}
                    onChange={(e) =>
                      setEditingRequest(
                        (prev) => prev && { ...prev, author: e.target.value }
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium col-span-1">
                    {t("admin.bookRequests.editForm.editorial")}
                  </label>
                  <Input
                    className="col-span-3"
                    value={editingRequest?.editorial || ""}
                    onChange={(e) =>
                      setEditingRequest(
                        (prev) => prev && { ...prev, editorial: e.target.value }
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium col-span-1">
                    {t("admin.bookRequests.editForm.reference")}
                  </label>
                  <Input
                    className="col-span-3"
                    value={editingRequest?.reference || ""}
                    onChange={(e) =>
                      setEditingRequest(
                        (prev) => prev && { ...prev, reference: e.target.value }
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium col-span-1">
                    {t("admin.bookRequests.editForm.userName")}
                  </label>
                  <Input
                    className="col-span-3"
                    value={editingRequest?.userName || ""}
                    onChange={(e) =>
                      setEditingRequest(
                        (prev) => prev && { ...prev, userName: e.target.value }
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium col-span-1">
                    {t("admin.bookRequests.editForm.userLastName")}
                  </label>
                  <Input
                    className="col-span-3"
                    value={editingRequest?.userLastName || ""}
                    onChange={(e) =>
                      setEditingRequest(
                        (prev) =>
                          prev && { ...prev, userLastName: e.target.value }
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium col-span-1">
                    {t("admin.bookRequests.editForm.userEmail")}
                  </label>
                  <Input
                    className="col-span-3"
                    value={editingRequest?.userEmail || ""}
                    onChange={(e) =>
                      setEditingRequest(
                        (prev) => prev && { ...prev, userEmail: e.target.value }
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium col-span-1">
                    {t("admin.bookRequests.editForm.comments")}
                  </label>
                  <Textarea
                    className="col-span-3"
                    value={editingRequest?.comments || ""}
                    onChange={(e) =>
                      setEditingRequest(
                        (prev) => prev && { ...prev, comments: e.target.value }
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium col-span-1">
                    {t("admin.bookRequests.editForm.status")}
                  </label>
                  <div className="col-span-3">
                    <Select
                      value={editingRequest?.status}
                      onValueChange={(value: BookRequest["status"]) =>
                        setEditingRequest(
                          (prev) =>
                            prev && {
                              ...prev,
                              status: value,
                            }
                        )
                      }
                    >
                      <SelectTrigger className="w-full bg-white border-gray-200">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="pending" className="hover:bg-orange-50">
                          {t("admin.bookRequests.status.pending")}
                        </SelectItem>
                        <SelectItem value="accepted" className="hover:bg-orange-50">
                          {t("admin.bookRequests.status.accepted")}
                        </SelectItem>
                        <SelectItem value="rejected" className="hover:bg-orange-50">
                          {t("admin.bookRequests.status.rejected")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                {t("admin.bookRequests.actions.cancel")}
              </Button>
              <Button type="submit">
                {t("admin.bookRequests.actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.bookRequests.deleteConfirm.title")}</DialogTitle>
            <DialogDescription>
              {t("admin.bookRequests.deleteConfirm.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("admin.bookRequests.deleteConfirm.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              {t("admin.bookRequests.deleteConfirm.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookRequests;
