import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionWrapperProps {
  children: ReactNode;
  variant?: "light" | "dark" | "light-alt";
  className?: string;
  id?: string;
  mesh?: boolean;
}

const SectionWrapper = ({ children, variant = "light", className = "", id, mesh = false }: SectionWrapperProps) => {
  const bgClass = variant === "dark" ? "section-dark" : variant === "light-alt" ? "section-light-alt" : "section-light";
  
  return (
    <section id={id} className={`${bgClass} ${className}`}>
      {mesh && <div className="absolute inset-0 mesh-gradient" />}
      <motion.div
        className="container-main py-24 lg:py-36 relative z-10"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
      >
        {children}
      </motion.div>
    </section>
  );
};

export default SectionWrapper;
