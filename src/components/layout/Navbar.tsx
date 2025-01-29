import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

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

          <div className="flex items-center">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
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

export default Navbar;