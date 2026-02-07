import { type ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** "default" = max-w-5xl, px-4 sm:px-6 (app-wide). "wide" = max-w-6xl, px-6 md:px-8 (e.g. landing). */
  size?: "default" | "wide";
}

const sizeClasses = {
  default: "max-w-5xl px-4 sm:px-6",
  wide: "max-w-6xl px-6 md:px-8",
};

export function Container({
  children,
  className = "",
  size = "default",
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full ${sizeClasses[size]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
