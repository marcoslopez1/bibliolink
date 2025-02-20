import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface BookFormActionsProps {
  onCancel: () => void;
  isEditing: boolean;
}

const BookFormActions = ({ onCancel, isEditing }: BookFormActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" type="button" onClick={onCancel}>
        {t("common.cancel")}
      </Button>
      <Button type="submit">
        {t("common.save")}
      </Button>
    </div>
  );
};

export default BookFormActions;
