import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    // Store the current location in sessionStorage before redirecting
    if (location.pathname.startsWith('/book/')) {
      sessionStorage.setItem('redirectAfterAuth', location.pathname);
    }
    
    toast({
      title: "Authentication required",
      description: "Please sign in to access this page",
      variant: "default",
    });
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;