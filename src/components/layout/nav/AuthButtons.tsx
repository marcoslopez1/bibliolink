import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AuthButtonsProps {
  session: boolean;
}

export const AuthButtons = ({ session }: AuthButtonsProps) => {
  const { t } = useTranslation();

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
    <Link 
      to="/auth/signin" 
      className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary"
    >
      <LogIn className="h-4 w-4" />
      <span>{t("auth.signIn")}</span>
    </Link>
  );
};