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
    <footer className="section-dark border-t border-dark-surface-foreground/10">
      <div className="container-main py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(230,100%,65%)] flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">BP</span>
              </div>
              <span className="text-dark-surface-foreground font-bold text-lg tracking-tight">
                BluePipe <span className="font-normal opacity-70">Digital</span>
              </span>
            </Link>
            <p className="text-dark-surface-foreground/60 text-sm max-w-xs">
              The official digital marketing partner for PuroClean franchise owners.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-dark-surface-foreground font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-dark-surface-foreground/60 hover:text-dark-surface-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-dark-surface-foreground/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-surface-foreground/40 text-sm">
            © {new Date().getFullYear()} BluePipe Digital. All rights reserved.
          </p>
          <p className="text-dark-surface-foreground/40 text-sm">
            Official Marketing Partner of PuroClean
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
