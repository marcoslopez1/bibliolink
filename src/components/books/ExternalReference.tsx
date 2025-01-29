import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ExternalReferenceProps {
  url: string;
}

export const ExternalReference = ({ url }: ExternalReferenceProps) => {
  const { t } = useTranslation();
  
  if (!url) return null;

  return (
    <div className="pt-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:text-accent/80 inline-flex items-center gap-1"
      >
        {t("book.externalReference")} <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
};