import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionWrapperProps {
  children: ReactNode;
  variant?: "light" | "dark";
  className?: string;
  id?: string;
}

const SectionWrapper = ({ children, variant = "light", className = "", id }: SectionWrapperProps) => {
  return (
    <section id={id} className={`${variant === "dark" ? "section-dark" : "section-light"} ${className}`}>
      <motion.div
        className="container-main py-20 lg:py-28"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
      >
        {children}
      </motion.div>
    </section>
  );
};

export default SectionWrapper;
