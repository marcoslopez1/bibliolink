import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LanguageSwitcher from "./LanguageSwitcher";
import { NavLogo } from "./nav/NavLogo";
import { NavLinks } from "./nav/NavLinks";
import { AuthButtons } from "./nav/AuthButtons";
import { Menu, X } from "lucide-react";
import { useResponsiveMenu } from "@/hooks/use-responsive-menu";

const Navbar = () => {
  const { session } = useAuth();
  const { isMenuOpen, setIsMenuOpen, shouldCollapse, containerRef, contentRef } = useResponsiveMenu();

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
        <div className="flex justify-between h-16" ref={containerRef}>
          <div className="flex items-center min-w-0" ref={contentRef}>
            <div className="flex-shrink-0">
              <NavLogo />
            </div>
            {!shouldCollapse && (
              <NavLinks isAdmin={profile?.is_admin} session={!!session} />
            )}
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {!shouldCollapse && (
              <AuthButtons session={!!session} onItemClick={closeMenu} />
            )}
            {shouldCollapse && (
              <button
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>

        {shouldCollapse && isMenuOpen && (
          <div className="absolute right-0 top-16 bg-white border-l border-b border-t border-gray-200 rounded-bl-lg shadow-lg">
            <div className="py-2">
              <NavLinks isAdmin={profile?.is_admin} isMobile onItemClick={closeMenu} session={!!session} />
              <div className="border-t border-gray-200 px-3 py-2">
                <AuthButtons session={!!session} onItemClick={closeMenu} />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
