import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

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

// Mock data for development
const mockRequests: BookRequest[] = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    editorial: "Scribner",
    link: "https://example.com/book1",
    comments: "Would be great for the literature section",
    status: "accepted",
    requestDate: "2025-02-20"
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    editorial: "Penguin Books",
    link: "https://example.com/book2",
    comments: "Classic that should be in our collection",
    status: "pending",
    requestDate: "2025-02-21"
  },
  {
    id: 3,
    title: "Dune",
    author: "Frank Herbert",
    editorial: "Ace Books",
    link: "https://example.com/book3",
    comments: "Popular sci-fi book",
    status: "rejected",
    requestDate: "2025-02-19"
  }
];

const BookRequests = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [requests, setRequests] = useState<BookRequest[]>(mockRequests);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    editorial: "",
    link: "",
    comments: ""
  });

  const handleSubmit = () => {
    const newRequest: BookRequest = {
      id: requests.length + 1,
      ...formData,
      status: "pending",
      requestDate: format(new Date(), "yyyy-MM-dd")
    };

    setRequests([newRequest, ...requests]);
    setIsFormOpen(false);
    setFormData({ title: "", author: "", editorial: "", link: "", comments: "" });
    
    toast({
      description: t("bookRequests.form.success")
    });
  };

  const getStatusBadgeVariant = (status: BookRequest["status"]) => {
    switch (status) {
      case "accepted":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("bookRequests.title")}</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          {t("admin.newEntry")}
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("bookRequests.form.title")}</DialogTitle>
            <DialogDescription>
              {t("bookRequests.form.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder={t("bookRequests.form.bookTitle")}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              placeholder={t("bookRequests.form.author")}
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
            <Input
              placeholder={t("bookRequests.form.editorial")}
              value={formData.editorial}
              onChange={(e) => setFormData({ ...formData, editorial: e.target.value })}
            />
            <Input
              placeholder={t("bookRequests.form.link")}
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
            <Textarea
              placeholder={t("bookRequests.form.comments")}
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                {t("bookRequests.form.cancel")}
              </Button>
              <Button onClick={handleSubmit}>
                {t("bookRequests.form.send")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        <h2 className="text-2xl font-semibold mt-8 mb-4">{t("bookRequests.list.title")}</h2>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("bookRequests.list.noRequests")}
          </div>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="p-6 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{request.title}</h3>
                  <p className="text-muted-foreground">{request.author}</p>
                  <p className="text-sm mt-2">{request.editorial}</p>
                  {request.link && (
                    <a
                      href={request.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-1 block"
                    >
                      {request.link}
                    </a>
                  )}
                  {request.comments && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      {request.comments}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant={getStatusBadgeVariant(request.status)}>
                      {t(`bookRequests.list.status.${request.status}`)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {t("bookRequests.list.requestDate")}: {request.requestDate}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BookRequests;
