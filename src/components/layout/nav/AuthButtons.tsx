
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AuthButtonsProps {
  session: boolean;
}

export const AuthButtons = ({ session }: AuthButtonsProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith('/auth/');

  if (isAuthPage) return null;

  return session ? (
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
    <div className="flex items-center space-x-4">
      <Link 
        to="/auth/signin" 
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary"
      >
        <LogIn className="h-4 w-4" />
        <span>{t("auth.signIn")}</span>
      </Link>
      <Link 
        to="/auth/signup" 
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary"
      >
        <UserPlus className="h-4 w-4" />
        <span>{t("auth.signUp")}</span>
      </Link>
    </div>
  );
};
