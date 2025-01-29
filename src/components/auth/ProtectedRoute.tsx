import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    // Store the current location in sessionStorage before redirecting
    if (location.pathname.startsWith('/book/')) {
      sessionStorage.setItem('redirectAfterAuth', location.pathname);
    }
    
    toast({
      title: t("auth.signInRequiredTitle"),
      description: t("auth.signInRequiredTitle"),
      variant: "default",
    });
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
