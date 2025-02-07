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

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session?.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching admin status:", error);
        throw error;
      }
      
      console.log("Admin status:", data);
      return data;
    },
    enabled: !!session?.user.id,
    retry: 1,
  });

  if (error) {
    console.error("Error in AdminRoute:", error);
    toast({
      title: t("error.title"),
      description: t("error.description"),
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || !profile?.is_admin) {
    console.log("Access denied. Session:", !!session, "Is admin:", profile?.is_admin);
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