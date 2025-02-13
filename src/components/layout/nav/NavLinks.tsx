import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookCopy, Library, BookOpenCheck } from "lucide-react";

interface NavLinksProps {
  isAdmin?: boolean;
  isMobile?: boolean;
  onItemClick?: () => void;
  session?: boolean;
}

export const NavLinks = ({ isAdmin, isMobile, onItemClick, session }: NavLinksProps) => {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-primary font-medium"
      : "text-gray-600 hover:text-primary";

  const baseStyles = isMobile
    ? "block px-3 py-2 text-base font-medium"
    : "inline-flex items-center h-16 px-3 whitespace-nowrap";

  const handleClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className={isMobile ? "space-y-1" : "ml-6 flex items-center space-x-4"}>
      <Link 
        to="/" 
        className={`${baseStyles} ${isActive("/")}`}
        onClick={handleClick}
      >
        {t("nav.home")}
      </Link>
      <Link
        to="/how-it-works"
        className={`${baseStyles} ${isActive("/how-it-works")}`}
        onClick={handleClick}
      >
        {t("nav.howItWorks")}
      </Link>
      {session && (
        <Link
          to="/my-books"
          className={`${baseStyles} ${isActive("/my-books")} gap-2`}
          onClick={handleClick}
        >
          <Library className="h-4 w-4" />
          <span>{t("nav.myBooks")}</span>
        </Link>
      )}
      {isAdmin && (
        <>
          <Link
            to="/admin/books"
            className={`${baseStyles} ${isActive("/admin/books")} gap-2`}
            onClick={handleClick}
          >
            <BookCopy className="h-4 w-4" />
            <span>{t("admin.booksManagement")}</span>
          </Link>
          <Link
            to="/admin/reservations"
            className={`${baseStyles} ${isActive("/admin/reservations")} gap-2`}
            onClick={handleClick}
          >
            <BookOpenCheck className="h-4 w-4" />
            <span>{t("admin.reservationsManagement")}</span>
          </Link>
        </>
      )}
    </div>
  );
};
