import { useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
];

const iconLinks = [
  { href: "https://github.com/lucasloepke", label: "GitHub", icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
  {
    href: "https://www.linkedin.com/in/lucasloepke/",
    label: "LinkedIn",
    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  { href: "/Loepke_Resume.pdf", label: "Resume", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8 17v-2h8v2H8zm0-4v-2h8v2H8zm0-4v-.02h8V9H8z" },
];

export function Header() {
  const location = useLocation();
  const pathname = location.pathname || "/";
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null);
  const [pillReady, setPillReady] = useState(false);

  // Measure the current link so the pill can slide to it; pages outside the nav hide it.
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
      setPill((prev) => (active ? { x: active.offsetLeft, width: active.offsetWidth } : prev && { ...prev, width: 0 }));
    };
    measure();
    // Skip the transition for the first placement, then animate later moves.
    const frame = requestAnimationFrame(() => setPillReady(true));
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [pathname]);

  return (
    // The strip above the bar keeps overscroll at the top the same navy as the bar.
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-[#0b1220] before:absolute before:inset-x-0 before:bottom-full before:h-screen before:bg-[#0b1220]">
      <div className="mx-auto grid max-w-[960px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3.5 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex w-10 shrink-0 justify-self-start rounded-full ring-2 ring-transparent transition-[box-shadow] duration-150 hover:ring-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
          aria-label="Home"
        >
          <img
            src="/profilepic.png"
            alt="Lucas Loepke"
            className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
            width={40}
            height={40}
          />
        </Link>
        <nav ref={navRef} className="relative flex items-center justify-center gap-1" aria-label="Main navigation">
          <span
            aria-hidden
            data-ready={pillReady}
            className="nav-pill pointer-events-none absolute inset-y-0 left-0 rounded-lg bg-white/[0.08]"
            style={{
              width: pill?.width ?? 0,
              opacity: pill?.width ? 1 : 0,
              transform: `translateX(${pill?.x ?? 0}px)`,
            }}
          />
          {navLinks.map(({ to, label }) => {
            const isActive = pathname === to || (to === "/" && pathname === "/");
            return (
              <Link
                key={to}
                to={to}
                aria-current={isActive ? "page" : undefined}
                className={`relative rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 sm:px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0b1220] ${
                  isActive
                    ? "text-accent-text hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-end">
          {iconLinks.map((link) => {
            const href = link.href;
            const isExternal = href.startsWith("http");
            const openInNewTab = isExternal || href.endsWith(".pdf");
            return (
              <a
                key={link.label}
                href={href}
                target={openInNewTab ? "_blank" : undefined}
                rel={openInNewTab ? "noopener noreferrer" : undefined}
                className="flex h-11 w-9 items-center justify-center text-neutral-400 transition-colors duration-150 hover:text-accent-text"
                aria-label={link.label}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d={link.icon} />
                </svg>
              </a>
            );
          })}
        </div>
      </div>
    </header>
  );
}
