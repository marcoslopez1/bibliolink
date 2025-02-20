import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthButtonsProps {
  session: boolean;
  onItemClick?: () => void;
}

export const AuthButtons = ({ session, onItemClick }: AuthButtonsProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthPage = location.pathname.startsWith('/auth/');

  if (isAuthPage) return null;

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        if (error.message.includes('session_not_found')) {
          navigate('/auth/signin');
          toast({
            description: t("auth.sessionExpired"),
          });
          return;
        }
        throw error;
      }
      
      navigate('/');
      toast({
        description: t("auth.signOutSuccess"),
      });
      
      if (onItemClick) {
        onItemClick();
      }
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        description: error.message,
        variant: "destructive",
      });
      navigate('/auth/signin');
    }
  };

  return session ? (
    <button
      onClick={handleSignOut}
      className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary px-3 py-2"
    >
      <LogOut className="h-4 w-4" />
      <span>{t("auth.signOut")}</span>
    </button>
  ) : (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
      <Link 
        to="/auth/signin" 
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary px-3 py-2"
        onClick={onItemClick}
      >
        <LogIn className="h-4 w-4" />
        <span>{t("auth.signIn")}</span>
      </Link>
      <Link 
        to="/auth/signup" 
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary px-3 py-2"
        onClick={onItemClick}
      >
        <UserPlus className="h-4 w-4" />
        <span>{t("auth.signUp")}</span>
      </Link>
    </div>
  );
};
