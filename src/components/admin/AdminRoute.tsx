
import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session?.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    retry: false,
  });

  // Don't redirect while we're checking auth state
  if (authLoading || (session && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    toast({
      title: t("auth.signInRequiredTitle"),
      description: t("auth.signInRequiredDescription"),
      variant: "destructive",
    });
    return <Navigate to="/auth/signin" replace />;
  }

  if (!profile?.is_admin) {
    toast({
      title: t("auth.adminRequiredTitle"),
      description: t("auth.adminRequiredDescription"),
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
