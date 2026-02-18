import { Link, useLocation } from "react-router-dom";
import { getSimpleIcon } from "../utils/simpleIcons";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
];

const iconLinks = [
  { href: "https://github.com/lucasloepke", label: "GitHub", simpleIconSlug: "github" as const },
  {
    href: "https://www.linkedin.com/in/lucasloepke/",
    label: "LinkedIn",
    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  { href: "/resume.pdf", label: "Resume", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8 17v-2h8v2H8zm0-4v-2h8v2H8zm0-4v-.02h8V9H8z" },
];

export function Header() {
  const location = useLocation();
  const pathname = location.pathname || "/";

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-[#0b1220]/90">
      <div className="mx-auto grid max-w-[960px] grid-cols-3 items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
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
        <nav className="flex items-center justify-center gap-1" aria-label="Main navigation">
          {navLinks.map(({ to, label }) => {
            const isActive = pathname === to || (to === "/" && pathname === "/");
            return (
              <Link
                key={to}
                to={to}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0b1220] ${
                  isActive
                    ? "text-accent hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-end gap-4">
          {iconLinks.map((link) => {
            const href = link.href;
            const isExternal = href.startsWith("http");
            const simpleIcon =
              "simpleIconSlug" in link && link.simpleIconSlug
                ? getSimpleIcon(link.simpleIconSlug)
                : null;
            const pathIcon = "icon" in link ? link.icon : null;
            return (
              <a
                key={link.label}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="flex items-center justify-center text-neutral-500 transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:text-neutral-400 dark:hover:text-accent dark:focus:ring-offset-[#0b1220]"
                aria-label={link.label}
              >
                {simpleIcon ? (
                  <span
                    className="flex h-5 w-5 items-center justify-center [&>svg]:h-5 [&>svg]:w-5 [&>svg_path]:fill-current"
                    dangerouslySetInnerHTML={{ __html: simpleIcon.svg }}
                    aria-hidden
                  />
                ) : pathIcon ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d={pathIcon} />
                  </svg>
                ) : null}
              </a>
            );
          })}
        </div>
      </div>
    </header>
  );
}
