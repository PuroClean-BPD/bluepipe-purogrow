import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import bluepipeLogo from "@/assets/bluepipe-logo.png";

const navLinks = [
  { label: "Case Studies", href: "/case-studies" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "About",
    href: "/about",
    children: [{ label: "Contact", href: "/contact" }],
  },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href: string) => location.pathname === href;
  const linkColor = (href: string) =>
    isActive(href) ? "hsl(var(--primary))" : "hsl(var(--dark-surface-foreground) / 0.65)";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl" style={{ background: 'hsl(var(--dark-surface) / 0.92)', borderBottom: '1px solid hsl(var(--dark-surface-foreground) / 0.08)' }}>
      <div className="container-main flex items-center justify-between h-16 lg:h-[72px]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(230,100%,65%)] flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">BP</span>
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
            BluePipe <span className="font-normal opacity-60">Digital</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.href} className="relative" ref={aboutRef}>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  style={{
                    color: isActive(link.href) || link.children.some(c => isActive(c.href))
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--dark-surface-foreground) / 0.65)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'hsl(var(--dark-surface-foreground))'; setAboutOpen(true); }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.href) && !link.children!.some(c => isActive(c.href)))
                      e.currentTarget.style.color = 'hsl(var(--dark-surface-foreground) / 0.65)';
                  }}
                  onClick={() => setAboutOpen(!aboutOpen)}
                >
                  {link.label}
                  <ChevronDown size={14} className={`transition-transform ${aboutOpen ? 'rotate-180' : ''}`} />
                </button>
                {aboutOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 min-w-[160px] rounded-lg py-1 shadow-xl"
                    style={{ background: 'hsl(var(--dark-surface))', border: '1px solid hsl(var(--dark-surface-foreground) / 0.1)' }}
                    onMouseEnter={() => setAboutOpen(true)}
                    onMouseLeave={() => setAboutOpen(false)}
                  >
                    <Link
                      to={link.href}
                      className="block px-4 py-2.5 text-sm font-medium transition-colors"
                      style={{ color: linkColor(link.href) }}
                      onMouseEnter={(e) => { if (!isActive(link.href)) e.currentTarget.style.color = 'hsl(var(--dark-surface-foreground))'; }}
                      onMouseLeave={(e) => { if (!isActive(link.href)) e.currentTarget.style.color = 'hsl(var(--dark-surface-foreground) / 0.65)'; }}
                      onClick={() => setAboutOpen(false)}
                    >
                      About Us
                    </Link>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block px-4 py-2.5 text-sm font-medium transition-colors"
                        style={{ color: linkColor(child.href) }}
                        onMouseEnter={(e) => { if (!isActive(child.href)) e.currentTarget.style.color = 'hsl(var(--dark-surface-foreground))'; }}
                        onMouseLeave={(e) => { if (!isActive(child.href)) e.currentTarget.style.color = 'hsl(var(--dark-surface-foreground) / 0.65)'; }}
                        onClick={() => setAboutOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: linkColor(link.href) }}
                onMouseEnter={(e) => { if (!isActive(link.href)) e.currentTarget.style.color = 'hsl(var(--dark-surface-foreground))'; }}
                onMouseLeave={(e) => { if (!isActive(link.href)) e.currentTarget.style.color = 'hsl(var(--dark-surface-foreground) / 0.65)'; }}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="hero-secondary" size="default" asChild>
            <Link to="/contact">Book a Call</Link>
          </Button>
          <Button variant="gradient" size="default" asChild>
            <Link to="/free-audit">Free Marketing Audit</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2"
          style={{ color: 'hsl(var(--dark-surface-foreground))' }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden pb-6" style={{ background: 'hsl(var(--dark-surface))', borderTop: '1px solid hsl(var(--dark-surface-foreground) / 0.08)' }}>
          <div className="container-main flex flex-col gap-1 pt-4">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.href}>
                  <button
                    className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between"
                    style={{ color: 'hsl(var(--dark-surface-foreground) / 0.75)' }}
                    onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                  >
                    {link.label}
                    <ChevronDown size={14} className={`transition-transform ${mobileAboutOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAboutOpen && (
                    <div className="flex flex-col gap-1 pl-4">
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        style={{ color: 'hsl(var(--dark-surface-foreground) / 0.6)' }}
                      >
                        About Us
                      </Link>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                          style={{ color: 'hsl(var(--dark-surface-foreground) / 0.6)' }}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: 'hsl(var(--dark-surface-foreground) / 0.75)' }}
                >
                  {link.label}
                </Link>
              )
            )}
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
