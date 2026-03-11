import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionWrapperProps {
  children: ReactNode;
  variant?: "light" | "dark" | "muted";
  className?: string;
  id?: string;
}

const SectionWrapper = ({ children, variant = "light", className = "", id }: SectionWrapperProps) => {
  const bgClass = variant === "dark" ? "section-dark" : variant === "muted" ? "section-muted" : "section-light";

  return (
    <section id={id} className={`${bgClass} ${className}`}>
      <motion.div
        className="container-main py-24 lg:py-32"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
      >
        {children}
      </motion.div>
    </section>
  );
};

export default SectionWrapper;
