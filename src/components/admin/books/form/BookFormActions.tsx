
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface BookFormActionsProps {
  onClose: () => void;
}

const BookFormActions = ({ onClose }: BookFormActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" type="button" onClick={onClose}>
        {t("common.cancel")}
      </Button>
      <Button type="submit">{t("common.save")}</Button>
    </div>
  );
};

export default BookFormActions;

