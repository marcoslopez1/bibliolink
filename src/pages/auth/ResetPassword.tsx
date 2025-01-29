import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail } from "lucide-react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error resetting password",
        description: error.message,
      });
    } else {
      toast({
        variant: "success",
        title: "Success",
        description: "Check your email for the password reset link",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg animate-fade-up">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">Reset Password</h2>
          <p className="mt-2 text-gray-600">Enter your email to reset your password</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Sending reset link..." : "Send Reset Link"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link to="/auth/signin" className="text-accent hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;