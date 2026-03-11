import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Solutions", href: "/#solutions" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-surface/95 backdrop-blur-md border-b border-dark-surface-foreground/10">
      <div className="container-main flex items-center justify-between h-16 lg:h-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(230,100%,65%)] flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">BP</span>
          </div>
          <span className="text-dark-surface-foreground font-bold text-lg tracking-tight">
            BluePipe <span className="font-normal opacity-70">Digital</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? "text-primary-foreground bg-primary/20"
                  : "text-dark-surface-foreground/70 hover:text-dark-surface-foreground hover:bg-dark-surface-foreground/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="hero-secondary" size="lg" asChild>
            <Link to="/contact">Book a Call</Link>
          </Button>
          <Button variant="gradient" size="lg" asChild>
            <Link to="/free-audit">Free Marketing Audit</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-dark-surface-foreground p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-dark-surface border-t border-dark-surface-foreground/10 pb-6">
          <div className="container-main flex flex-col gap-1 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-dark-surface-foreground/80 hover:text-dark-surface-foreground hover:bg-dark-surface-foreground/5 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-4 px-4">
              <Button variant="hero-secondary" size="lg" asChild>
                <Link to="/contact" onClick={() => setMobileOpen(false)}>Book a Call</Link>
              </Button>
              <Button variant="gradient" size="lg" asChild>
                <Link to="/free-audit" onClick={() => setMobileOpen(false)}>Free Marketing Audit</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
