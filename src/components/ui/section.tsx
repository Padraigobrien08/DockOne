import { type ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
}

/** Wrapper for consistent vertical spacing (e.g. py-16 md:py-24). */
export function Section({ children, className = "" }: SectionProps) {
  return (
    <div
      className={`py-16 md:py-24 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
