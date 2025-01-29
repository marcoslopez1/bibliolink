import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-semibold text-primary">Library</span>
            </Link>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <NavLink to="/catalog" active={isActive("/catalog")}>Catalog</NavLink>
            <NavLink to="/latest" active={isActive("/latest")}>Latest</NavLink>
            <NavLink to="/how-it-works" active={isActive("/how-it-works")}>How It Works</NavLink>
          </div>

          <button 
            className="sm:hidden p-2 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-200 animate-fade-down">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink 
              to="/catalog" 
              active={isActive("/catalog")}
              onClick={() => setIsMenuOpen(false)}
            >
              Catalog
            </MobileNavLink>
            <MobileNavLink 
              to="/latest" 
              active={isActive("/latest")}
              onClick={() => setIsMenuOpen(false)}
            >
              Latest
            </MobileNavLink>
            <MobileNavLink 
              to="/how-it-works" 
              active={isActive("/how-it-works")}
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? "text-accent"
        : "text-gray-600 hover:text-gray-900"
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ 
  to, 
  children, 
  active, 
  onClick 
}: { 
  to: string; 
  children: React.ReactNode; 
  active: boolean;
  onClick: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={`block px-3 py-2 rounded-md text-base font-medium ${
      active
        ? "bg-accent/10 text-accent"
        : "text-gray-600 hover:bg-gray-50"
    }`}
  >
    {children}
  </Link>
);

export default Navbar;