import { Link } from "react-router-dom";

export const NavLogo = () => (
  <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
    <img 
      src="/logo.svg"
      alt="BiblioLink"
      className="h-6 w-6"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = "/logo.svg";
      }}
    />
    BiblioLink
  </Link>
);
