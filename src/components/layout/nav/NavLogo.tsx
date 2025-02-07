
import { Link } from "react-router-dom";
import { Book } from "lucide-react";

export const NavLogo = () => (
  <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
    <Book className="h-6 w-6" />
    BiblioLink
  </Link>
);
