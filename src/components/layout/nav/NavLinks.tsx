import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookCopy } from "lucide-react";

interface NavLinksProps {
  isAdmin?: boolean;
}

export const NavLinks = ({ isAdmin }: NavLinksProps) => {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-primary font-medium"
      : "text-gray-600 hover:text-primary";

  return (
    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
      <Link to="/" className={`inline-flex items-center px-1 pt-1 ${isActive("/")}`}>
        {t("nav.home")}
      </Link>
      <Link
        to="/how-it-works"
        className={`inline-flex items-center px-1 pt-1 ${isActive("/how-it-works")}`}
      >
        {t("nav.howItWorks")}
      </Link>
      {isAdmin && (
        <Link
          to="/admin/books"
          className={`inline-flex items-center px-1 pt-1 space-x-2 ${isActive("/admin/books")}`}
        >
          <BookCopy className="h-4 w-4" />
          <span>{t("admin.booksManagement")}</span>
        </Link>
      )}
    </div>
  );
};