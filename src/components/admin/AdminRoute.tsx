
import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: profile, isLoading } = useQuery({
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
    staleTime: 30000, // Cache for 30 seconds
    retry: false,
  });

  if (!session) {
    toast({
      title: t("auth.signInRequiredTitle"),
      description: t("auth.signInRequiredDescription"),
      variant: "destructive",
    });
    return <Navigate to="/auth/signin" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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
