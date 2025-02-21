import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookCopy, Library, BookOpenCheck, HelpCircle, Settings, BookPlus } from "lucide-react";

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
    ? "flex items-center px-3 py-2 text-base font-medium"
    : "inline-flex items-center h-16 px-2 whitespace-nowrap text-sm";

  const handleClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className={isMobile ? "space-y-1 w-fit min-w-[200px]" : "ml-4 flex items-center space-x-2"}>
      <Link
        to="/how-it-works"
        className={`${baseStyles} ${isActive("/how-it-works")}`}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 flex-shrink-0" />
          <span>{t("nav.howItWorks")}</span>
        </div>
      </Link>
      {session && (
        <>
          <Link
            to="/my-books"
            className={`${baseStyles} ${isActive("/my-books")}`}
            onClick={handleClick}
          >
            <div className="flex items-center gap-2">
              <Library className="h-4 w-4 flex-shrink-0" />
              <span>{t("nav.myBooks")}</span>
            </div>
          </Link>
          <Link
            to="/book-requests"
            className={`${baseStyles} ${isActive("/book-requests")}`}
            onClick={handleClick}
          >
            <div className="flex items-center gap-2">
              <BookPlus className="h-4 w-4 flex-shrink-0" />
              <span>{t("nav.bookRequests")}</span>
            </div>
          </Link>
        </>
      )}
      {isAdmin && (
        <>
          <Link
            to="/admin/books"
            className={`${baseStyles} ${isActive("/admin/books")}`}
            onClick={handleClick}
          >
            <div className="flex items-center gap-2">
              <BookCopy className="h-4 w-4 flex-shrink-0" />
              <span>{t("admin.catalogManagement")}</span>
            </div>
          </Link>
          <Link
            to="/admin/reservations"
            className={`${baseStyles} ${isActive("/admin/reservations")}`}
            onClick={handleClick}
          >
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 flex-shrink-0" />
              <span>{t("admin.reservationsManagement")}</span>
            </div>
          </Link>
          <Link
            to="/admin/settings"
            className={`${baseStyles} ${isActive("/admin/settings")}`}
            onClick={handleClick}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span>{t("admin.settingsPage.title")}</span>
            </div>
          </Link>
        </>
      )}
    </div>
  );
};
