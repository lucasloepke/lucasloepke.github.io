import { Link } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
];

const iconLinks = [
  { href: "https://github.com/lucasloepke", label: "GitHub" },
  { href: "https://www.linkedin.com/in/lucasloepke/", label: "LinkedIn" },
  { href: "/resume.pdf", label: "Resume" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-[#0a1020]">
      <div className="mx-auto max-w-[960px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <nav className="flex gap-6" aria-label="Footer navigation">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-neutral-600 transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:text-neutral-300 dark:hover:text-accent dark:focus:ring-offset-[#0a1020]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-6">
            {iconLinks.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-sm text-neutral-600 transition-colors duration-150 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:text-neutral-300 dark:hover:text-accent dark:focus:ring-offset-[#0a1020]"
                aria-label={label}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          © {new Date().getFullYear()} Lucas Loepke. Built with React, Vite, Tailwind, and Cursor.
        </p>
      </div>
    </footer>
  );
}
