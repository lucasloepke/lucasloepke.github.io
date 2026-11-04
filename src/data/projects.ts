import type { SkillKey } from "./skills";

export interface Project {
  slug: string;
  title: string;
  year: number;
  /** The one result to lead with. */
  outcome: string;
  description: string;
  tech: SkillKey[];
  links?: {
    github?: string;
    live?: string;
  };
  /** Names where the live link goes, e.g. "Steam". */
  liveLabel?: string;
}

export const projects: Project[] = [
  {
    slug: "commit-art",
    title: "Commit Art",
    year: 2026,
    outcome: "Draw on your GitHub contribution graph",
    description: "A pixel editor for the contribution graph. Paint squares or stamp text, then run the script it generates to build a repo of empty, backdated commits. Delete the repo to erase the drawing.",
    tech: ["typescript", "react", "git"],
    links: { github: "https://github.com/lucasloepke/lucasloepke.github.io/blob/master/src/pages/CommitArt.tsx", live: "/commit-art" },
    liveLabel: "Try it",
  },
  {
    slug: "cleanup-crew",
    title: "Cleanup Crew",
    year: 2025,
    outcome: "1,500+ demo downloads on Steam",
    description: "Top-down action game in Rust/Bevy, featuring custom ECS architecture, physics, and procedural generation. Built with an 8-person team in weekly sprints for CS 1666.",
    tech: ["rust", "bevy", "git"],
    links: { live: "https://store.steampowered.com/app/4801800/Cleanup_Crew/" },
    liveLabel: "Steam",
  },
  {
    slug: "simple-canvas-tasks",
    title: "Simple Canvas Tasks",
    year: 2026,
    outcome: "200+ weekly active users",
    description: "Privacy-first Chrome extension that replaces Canvas's sidebar with a tabbed to-do widget and live due-date countdowns. Live on the Chrome Web Store and iterated on from user feedback.",
    tech: ["javascript", "chrome-extension", "manifest-v3"],
    links: { github: "https://github.com/lucasloepke/canvas-tasks", live: "https://chromewebstore.google.com/detail/dejmhgkaogjhiannogiggcffkhodeoek" },
    liveLabel: "Chrome Web Store",
  },
  {
    slug: "leetvision",
    title: "LeetVision",
    year: 2026,
    outcome: "Watch your LeetCode solution run, line by line",
    description: "A Chrome side-panel extension (Manifest V3) that traces your NeetCode/LeetCode Python solution with a bundled Pyodide runtime, rendering a play/pause/scrub step-through animation client-side. Built for SteelHacks 2026.",
    tech: ["typescript", "react", "framer-motion", "python", "pyodide", "chrome-extension"],
    links: { github: "https://github.com/lucasloepke/leetvision", live: "https://chromewebstore.google.com/detail/leetvision/oncedhloihenbjclhebncagkkigdielf" },
    liveLabel: "Chrome Web Store",
  },
  {
    slug: "ml-project",
    title: "Steam Game Recommender",
    year: 2026,
    outcome: "264% lift over a popularity baseline",
    description: "Collaborative-filtering recommendation engine using SGD and ALS matrix factorization on implicit feedback. ALS with k=200 latent factors achieved a 264% lift in hit rate@10 at 99.36% sparsity.",
    tech: ["python", "pandas", "numpy", "sql", "git"],
    links: { github: "https://github.com/lucasloepke/steam-game-recommender" },
  },
  {
    slug: "trust-circle",
    title: "Trust Circle",
    year: 2025,
    outcome: "Won SAP STAR Hacks 2025",
    description: "Group savings platform where friends contribute toward shared financial goals. Built with React, Flask, SAP HANA Cloud, and SAP AI Core with OpenAI models.",
    tech: ["react", "flask", "hanacloud", "openai"],
    links: { github: "https://github.com/lucasloepke/Trust-Circle" },
  },
  {
    slug: "gtb-solver",
    title: "GTB Solver",
    year: 2026,
    outcome: "Community-fed word bank through GitHub Issues",
    description: "A real-time Minecraft Fabric mod (Java) that solves Hypixel's Guess the Build by parsing action-bar hint text and injecting clickable chat guesses from a matched word bank. Distributed via GitHub Releases.",
    tech: ["java", "javascript", "gradle", "git"],
    links: { github: "https://github.com/lucasloepke/gtbsolver" },
  },
  {
    slug: "flowle",
    title: "Flowle",
    year: 2026,
    outcome: "Won CSC Hacks 2023, overhauled in 2026",
    description: "Browser puzzle game inspired by Flow Free: connect matching dots and fill every square. Live on Cloudflare Pages.",
    tech: ["javascript", "html", "css", "cloudflare", "cloudflarepages"],
    links: { github: "https://github.com/lucasloepke/flowle", live: "https://flowle.pages.dev/" },
    liveLabel: "Play it",
  },
  {
    slug: "portfolio-site",
    title: "This site",
    year: 2026,
    outcome: "You're looking at it",
    description: "Built with Vite, React, and Tailwind, and deployed to GitHub Pages.",
    tech: ["react", "typescript", "tailwind", "vite", "javascript", "github"],
    links: { github: "https://github.com/lucasloepke/lucasloepke.github.io" },
  },
];
