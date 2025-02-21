import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface BookRequest {
  id: number;
  title: string;
  author: string;
  editorial: string;
  link: string;
  comments: string;
  status: "accepted" | "pending" | "rejected";
  requestDate: string;
}

const MyRequests = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requests, setRequests] = useState<BookRequest[]>([
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      editorial: "Scribner",
      link: "https://example.com/book1",
      comments: "Would love to read this classic",
      status: "accepted",
      requestDate: "2025-02-21",
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      editorial: "Penguin Books",
      link: "https://example.com/book2",
      comments: "Heard great things about this book",
      status: "pending",
      requestDate: "2025-02-20",
    },
    {
      id: 3,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      editorial: "Little, Brown and Company",
      link: "https://example.com/book3",
      comments: "Required for my literature class",
      status: "rejected",
      requestDate: "2025-02-19",
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    editorial: "",
    link: "",
    comments: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: BookRequest = {
      id: requests.length + 1,
      ...formData,
      status: "pending",
      requestDate: new Date().toISOString().split("T")[0],
    };
    setRequests((prev) => [newRequest, ...prev]);
    setFormData({ title: "", author: "", editorial: "", link: "", comments: "" });
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: BookRequest["status"]) => {
    const variants = {
      accepted: "bg-green-100 text-green-800",
      pending: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={variants[status]}>
        {t(`requests.status.${status}`)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold">{t("requests.pageTitle")}</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full md:w-auto">
          {t("requests.createRequest")}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("requests.requestForm.title")}</DialogTitle>
            <DialogDescription>
              {t("requests.requestForm.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {t("requests.requestForm.bookTitle")}
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t("requests.requestForm.bookTitlePlaceholder")}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("requests.requestForm.author")}
              </label>
              <Input
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder={t("requests.requestForm.authorPlaceholder")}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("requests.requestForm.editorial")}
              </label>
              <Input
                name="editorial"
                value={formData.editorial}
                onChange={handleInputChange}
                placeholder={t("requests.requestForm.editorialPlaceholder")}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("requests.requestForm.link")}
              </label>
              <Input
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder={t("requests.requestForm.linkPlaceholder")}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("requests.requestForm.comments")}
              </label>
              <Textarea
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                placeholder={t("requests.requestForm.commentsPlaceholder")}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t("requests.requestForm.cancel")}
              </Button>
              <Button type="submit">
                {t("requests.requestForm.send")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          {t("requests.status.title")}
        </h2>
        {requests.length === 0 ? (
          <p className="text-gray-500">{t("requests.status.noRequests")}</p>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="p-6 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{request.title}</h3>
                  <p className="text-gray-600">{request.author}</p>
                  {request.editorial && (
                    <p className="text-gray-500 text-sm">{request.editorial}</p>
                  )}
                  {request.comments && (
                    <p className="text-gray-600 mt-2">{request.comments}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-2">
                    {t("requests.status.requestDate")}: {format(new Date(request.requestDate), "PP")}
                  </p>
                </div>
                <div>
                  {getStatusBadge(request.status)}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyRequests;
