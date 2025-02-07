
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LanguageSwitcher from "./LanguageSwitcher";
import { NavLogo } from "./nav/NavLogo";
import { NavLinks } from "./nav/NavLinks";
import { AuthButtons } from "./nav/AuthButtons";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const { session } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: profile } = useQuery({
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
  });

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <NavLogo />
            </div>
            <div className="hidden sm:flex">
              <NavLinks isAdmin={profile?.is_admin} />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <div className="hidden sm:flex">
              <AuthButtons session={!!session} onItemClick={closeMenu} />
            </div>
            <button
              className="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobile && isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <NavLinks isAdmin={profile?.is_admin} isMobile onItemClick={closeMenu} />
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <AuthButtons session={!!session} onItemClick={closeMenu} />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
