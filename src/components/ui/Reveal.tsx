import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function SectionReveal({
  children,
  className,
  delay = 0,
  amount = 0.08,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.62, 0.36, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
