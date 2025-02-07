import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

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
        .single();

      if (error) throw error;
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
                  className={`inline-flex items-center px-1 pt-1 ${isActive("/admin/books")}`}
                >
                  {t("admin.booksManagement")}
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
                className="text-gray-600 hover:text-primary"
              >
                {t("auth.signOut")}
              </Link>
            ) : (
              <Link to="/auth/signin" className="text-gray-600 hover:text-primary">
                {t("auth.signIn")}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;