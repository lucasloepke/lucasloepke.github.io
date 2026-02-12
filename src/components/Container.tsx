import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8 ${className}`.trim()}>
      {children}
    </div>
  );
}
