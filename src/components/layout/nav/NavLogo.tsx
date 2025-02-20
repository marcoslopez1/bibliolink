import { Link } from "react-router-dom";

export const NavLogo = () => (
  <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
    <img 
      src="public/logo.svg"
      alt="BiblioLink"
      className="h-6 w-6"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = "public/logo.svg";
      }}
    />
    BiblioLink
  </Link>
);
