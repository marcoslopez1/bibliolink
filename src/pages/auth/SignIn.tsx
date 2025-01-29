import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (session) {
      const redirectPath = sessionStorage.getItem('redirectAfterAuth') || '/';
      sessionStorage.removeItem('redirectAfterAuth');
      navigate(redirectPath);
    }
  }, [session, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: t("auth.error"),
        description: t("auth.signInError"),
      });
    } else {
      toast({
        title: t("auth.success"),
        description: t("auth.signInSuccess"),
      });
      
      const redirectPath = sessionStorage.getItem('redirectAfterAuth');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterAuth');
        navigate(redirectPath);
      } else {
        navigate("/");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg animate-fade-up">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">{t("auth.signIn")}</h2>
          <p className="mt-2 text-gray-600">{t("auth.welcomeBack")}</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/auth/reset-password"
              className="text-sm text-accent hover:underline"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? t("auth.signingIn") : t("auth.signIn")}
            </Button>

            <p className="text-center text-sm text-gray-600">
              {t("auth.noAccount")}{" "}
              <Link to="/auth/signup" className="text-accent hover:underline">
                {t("auth.signUp")}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;