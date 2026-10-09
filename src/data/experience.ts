export interface ExperienceEntry {
  id: string;
  dates: string;
  company: string;
  companyUrl?: string;
  /** Optional Simple Icons slug shown beside the company name. */
  simpleIconSlug?: string;
  /** Optional custom logo image path (preferred over simpleIconSlug when set). */
  logoSrc?: string;
  /** Optional Tailwind text color classes for the company name. */
  companyClassName?: string;
  role: string;
  detail: string;
  location: string;
}

export const experience: ExperienceEntry[] = [
  {
    id: "sap-experience-generation",
    dates: "May 2026 — Present",
    company: "SAP",
    companyUrl: "https://sap.com",
    logoSrc: "/sap-logo.png",
    companyClassName: "text-neutral-900 hover:text-neutral-700 dark:text-white dark:hover:text-white/80",
    role: "Software Engineer Intern",
    detail: "Experience Generation",
    location: "Palo Alto, CA",
  },
  {
    id: "sap-experience-engineering",
    dates: "May 2025 — Apr 2026",
    company: "SAP",
    companyUrl: "https://sap.com",
    logoSrc: "/sap-logo.png",
    companyClassName: "text-neutral-900 hover:text-neutral-700 dark:text-white dark:hover:text-white/80",
    role: "Software Engineer Intern",
    detail: "Experience Engineering",
    location: "San Ramon, CA",
  },
  {
    id: "sap-coe-analytics",
    dates: "May 2024 — Apr 2025",
    company: "SAP",
    companyUrl: "https://sap.com",
    logoSrc: "/sap-logo.png",
    companyClassName: "text-neutral-900 hover:text-neutral-700 dark:text-white dark:hover:text-white/80",
    role: "Software Engineer Intern",
    detail: "CoE Analytics",
    location: "Newtown Square, PA",
  },
];

export const education = {
  school: "University of Pittsburgh",
  schoolUrl: "https://pitt.edu",
  degree: "BS: Computer Science & Economics",
  date: "Expected April 2027",
};
