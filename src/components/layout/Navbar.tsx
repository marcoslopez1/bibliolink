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
  const { isMenuOpen, setIsMenuOpen, shouldCollapse, containerRef, contentRef } = useResponsiveMenu({
    forceCollapse: !!session
  });

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
              <div className="relative">
                <button
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
                
                {/* Expandable menu */}
                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 z-50">
                    <div 
                      className="relative bg-white shadow-lg rounded-lg border border-gray-200 w-64 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <NavLinks
                        isAdmin={profile?.is_admin}
                        session={!!session}
                        isMobile
                        onItemClick={closeMenu}
                      />
                      <div className="mt-2 pt-2 px-3 border-t border-gray-200">
                        <AuthButtons session={!!session} onItemClick={closeMenu} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
