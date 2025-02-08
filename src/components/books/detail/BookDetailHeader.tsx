
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const BookDetailHeader = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="mb-4"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t("common.back")}
    </Button>
  );
};
