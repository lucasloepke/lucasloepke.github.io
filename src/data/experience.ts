export interface ExperienceEntry {
  id: string;
  dates: string;
  company: string;
  companyUrl?: string;
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
    role: "Software Engineering Intern",
    detail: "Experience Generation",
    location: "Palo Alto, CA",
  },
  {
    id: "sap-experience-engineering",
    dates: "May 2025 — Apr 2026",
    company: "SAP",
    companyUrl: "https://sap.com",
    role: "Software Engineering Intern",
    detail: "Experience Engineering",
    location: "San Ramon, CA",
  },
  {
    id: "sap-coe-analytics",
    dates: "May 2024 — Apr 2025",
    company: "SAP",
    companyUrl: "https://sap.com",
    role: "Software Engineering Intern",
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
