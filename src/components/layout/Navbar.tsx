import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { LogIn, LogOut, BookCopy } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const { session } = useAuth();
  const { t } = useTranslation();

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session?.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      console.log("Profile data:", data);
      return data;
    },
    enabled: !!session?.user.id,
  });

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-primary font-medium"
      : "text-gray-600 hover:text-primary";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary">
                Library
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={`inline-flex items-center px-1 pt-1 ${isActive("/")}`}>
                {t("nav.home")}
              </Link>
              <Link
                to="/how-it-works"
                className={`inline-flex items-center px-1 pt-1 ${isActive(
                  "/how-it-works"
                )}`}
              >
                {t("nav.howItWorks")}
              </Link>
              {profile?.is_admin && (
                <Link
                  to="/admin/books"
                  className={`inline-flex items-center px-1 pt-1 space-x-2 ${isActive("/admin/books")}`}
                >
                  <BookCopy className="h-4 w-4" />
                  <span>{t("admin.booksManagement")}</span>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {session ? (
              <Link
                to="/auth/signin"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary"
              >
                <LogOut className="h-4 w-4" />
                <span>{t("auth.signOut")}</span>
              </Link>
            ) : (
              <Link 
                to="/auth/signin" 
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary"
              >
                <LogIn className="h-4 w-4" />
                <span>{t("auth.signIn")}</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;