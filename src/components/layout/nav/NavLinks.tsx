
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookCopy, Library, BookOpenCheck, HelpCircle, Settings, FileText, Inbox, MessageSquare } from "lucide-react";

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
    : "inline-flex items-center h-16 px-3 whitespace-nowrap";

  const handleClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className={isMobile ? "space-y-1 w-fit min-w-[200px]" : "ml-6 flex items-center space-x-4"}>
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
            <BookCopy className="h-5 w-5 mr-2" />
            {t("nav.myBooks")}
          </Link>
          <Link
            to="/my-requests"
            className={`${baseStyles} ${isActive("/my-requests")}`}
            onClick={handleClick}
          >
            <FileText className="h-5 w-5 mr-2" />
            {t("nav.myRequests")}
          </Link>
          <Link
            to="/feedback"
            className={`${baseStyles} ${isActive("/feedback")}`}
            onClick={handleClick}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            {t("nav.feedback")}
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
            <Library className="h-5 w-5 mr-2" />
            {t("admin.catalogManagement")}
          </Link>
          <Link
            to="/admin/reservations"
            className={`${baseStyles} ${isActive("/admin/reservations")}`}
            onClick={handleClick}
          >
            <BookOpenCheck className="h-5 w-5 mr-2" />
            {t("admin.reservationsManagement")}
          </Link>
          <Link
            to="/admin/book-requests"
            className={`${baseStyles} ${isActive("/admin/book-requests")}`}
            onClick={handleClick}
          >
            <Inbox className="h-5 w-5 mr-2" />
            {t("admin.requestsManagement")}
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
