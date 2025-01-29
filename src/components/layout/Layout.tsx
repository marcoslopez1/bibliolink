import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isBookDetail = location.pathname.includes("/book/");

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />
      <main className={`flex-1 animate-fade-up ${isBookDetail ? "pt-12" : "pt-24"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;