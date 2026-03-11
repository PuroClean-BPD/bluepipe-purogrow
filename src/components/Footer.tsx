import { Link } from "react-router-dom";

const footerLinks = {
  Solutions: [
    { label: "Google Business Profile", href: "/#solutions" },
    { label: "Google Ads & LSA", href: "/#solutions" },
    { label: "Reputation Management", href: "/#solutions" },
    { label: "Social Media", href: "/#solutions" },
    { label: "SEO", href: "/#solutions" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Pricing", href: "/pricing" },
    { label: "Newsletter", href: "/newsletter" },
  ],
  Support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Free Marketing Audit", href: "/free-audit" },
    { label: "Book a Strategy Call", href: "/contact" },
  ],
};

const Footer = () => {
  return (
    <footer className="section-dark" style={{ borderTop: '1px solid hsl(var(--dark-surface-foreground) / 0.08)' }}>
      <div className="container-main py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(230,100%,65%)] flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">BP</span>
              </div>
              <span className="font-bold text-lg tracking-tight" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>
                BluePipe <span className="font-normal opacity-60">Digital</span>
              </span>
            </Link>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.5)' }}>
              The official digital marketing partner for PuroClean franchise owners.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold mb-4" style={{ color: 'hsl(var(--dark-surface-foreground))' }}>{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm transition-colors hover:text-[hsl(var(--dark-surface-foreground))]"
                      style={{ color: 'hsl(var(--dark-surface-foreground) / 0.5)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid hsl(var(--dark-surface-foreground) / 0.08)' }}>
          <p className="text-sm" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.35)' }}>
            © {new Date().getFullYear()} BluePipe Digital. All rights reserved.
          </p>
          <p className="text-sm" style={{ color: 'hsl(var(--dark-surface-foreground) / 0.35)' }}>
            Official Marketing Partner of PuroClean
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
