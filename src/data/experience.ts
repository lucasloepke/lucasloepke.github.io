export interface ExperienceEntry {
  id: string;
  dates: string;
  company: string;
  companyUrl?: string;
  /** Optional custom logo image path. */
  logoSrc?: string;
  /** What the work was, in plain words. */
  title: string;
  role: string;
  detail: string;
  /** What the rotation produced, from the resume. */
  outcome: string;
  location: string;
}

export const experience: ExperienceEntry[] = [
  {
    id: "sap-experience-generation",
    dates: "May 2026 — Present",
    company: "SAP",
    companyUrl: "https://sap.com",
    logoSrc: "/sap-logo.png",
    title: "Agentic AI platform",
    role: "Software Engineer Intern",
    detail: "Experience Generation",
    outcome: "Building core AI tooling for SAP's Forward Deployed Engineering work with enterprise customers, including a collaborative workspace with permission-aware agents. Also built a Claude Code review skill used by 20+ engineers.",
    location: "Palo Alto, CA",
  },
  {
    id: "sap-experience-engineering",
    dates: "May 2025 — Apr 2026",
    company: "SAP",
    companyUrl: "https://sap.com",
    logoSrc: "/sap-logo.png",
    title: "Native iOS",
    role: "Software Engineer Intern",
    detail: "Experience Engineering",
    outcome: "Shipped features across 15+ enterprise iOS apps for SAP's 112,000 employees, in Swift and SAP Fiori.",
    location: "San Ramon, CA",
  },
  {
    id: "sap-coe-analytics",
    dates: "May 2024 — Apr 2025",
    company: "SAP",
    companyUrl: "https://sap.com",
    logoSrc: "/sap-logo.png",
    title: "Internal analytics tooling",
    role: "Software Engineer Intern",
    detail: "CoE Analytics",
    outcome: "Built a full-stack internal tool on SAP BTP that cut case turnaround from about an hour to minutes for 100+ support engineers. The team still maintains it.",
    location: "Newtown Square, PA",
  },
];

export const education = {
  school: "University of Pittsburgh",
  schoolUrl: "https://pitt.edu",
  degree: "BS: Computer Science & Economics",
  date: "Expected May 2027",
};
