
import { useTranslation } from "react-i18next";

const RequestsHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-semibold">
        {t("admin.requestsManagement")}
      </h1>
    </div>
  );
};

export default RequestsHeader;
