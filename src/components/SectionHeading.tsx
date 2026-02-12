import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

export function SectionHeading({
  children,
  as: Tag = "h2",
  className = "",
}: SectionHeadingProps) {
  return (
    <Tag
      className={`text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
