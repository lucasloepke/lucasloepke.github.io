import type { SkillKey } from "./skills";

export interface Project {
  slug: string;
  title: string;
  description: string;
  tech: SkillKey[];
  links?: {
    github?: string;
    live?: string;
  };
  featured?: boolean;
  date?: string;
  highlights?: string[];
  thumbnail?: string;
}

export const projects: Project[] = [
  {
    slug: "ml-project",
    title: "Applied Machine Learning Project (2026)",
    description: "Collaborative filtering system for personalized Steam game recommendations using matrix factorization and implicit feedback modeling. Currently building for CS 1675, with focus on sparse user–item data and ranking-based evaluation metrics.",
    tech: ["python", "pandas", "numpy", "sql", "git"],
    links: { github: "" },
    featured: true,
    date: "2024-09",
  },
  {
    slug: "portfolio-site",
    title: "Portfolio Website (2026)",
    description: "Modern personal portfolio built with Vite, React, and Tailwind. Responsive layout with GitHub Pages deployment.",
    tech: ["react", "typescript", "tailwind", "vite", "javascript", "github"],
    links: { github: "https://github.com/lucasloepke/lucasloepke.github.io", live: "https://lucasloepke.github.io" },
    featured: false,
    date: "2025-01",
  },
  {
    slug: "cleanup-crew",
    title: "Cleanup Crew (2025)",
    description: "Top-down action shooter game developed in Rust using the Bevy engine, featuring custom ECS architecture, physics, and procedural generation. Built collaboratively over a semester by an 8-person team for CS 1666.",
    tech: ["rust", "bevy", "git"],
    links: { github: "https://github.com/CS1666-CleanupCrew/Cleanup-crew" },
    featured: true,
    date: "2024-11",
  },
  {
    slug: "trust-circle",
    title: "Trust Circle (2025)",
    description: "Group savings platform where friends contribute toward shared financial goals. Winning project at SAP STAR Hacks 2025.",
    tech: ["react", "flask", "hanacloud", "openai"],
    links: { github: "https://github.com/lucasloepke/Trust-Circle" },
    featured: true,
    date: "2024-12",
  },
  {
    slug: "flowle",
    title: "Flowle (2023)",
    description: "Browser-based puzzle game inspired by the original Flow Free app. Winning project at CSC Hacks 2023",
    tech: ["javascript", "html", "css", "cloudflare", "cloudflarepages"],
    links: { github: "https://github.com/lucasloepke/flowle", live: "https://flowle.pages.dev/" },
    featured: false,
    date: "2024-10",
  },
];
