// Post-build: bake per-route <head> metadata + crawlable body shells into
// static HTML so crawlers get correct tags and real content without JS.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, "../dist");
const SITE_URL = "https://lucasloepke.github.io";

const projectsShell = `
      <main style="max-width: 720px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; line-height: 1.6; color: #e2e8f0; background: #0b1220;">
        <header>
          <p><a href="/">← Lucas Loepke</a></p>
          <h1>Projects</h1>
          <p>Selected software projects — machine learning, full-stack web apps, game development, and award-winning hackathon builds.</p>
        </header>
        <section>
          <ul>
            <li><strong>LeetVision</strong> — Chrome extension that traces LeetCode/NeetCode Python solutions line-by-line. <a href="https://github.com/lucasloepke/leetvision">GitHub</a></li>
            <li><strong>Simple Canvas Tasks</strong> — Privacy-first Canvas LMS to-do Chrome extension. <a href="https://github.com/lucasloepke/canvas-tasks">GitHub</a></li>
            <li><strong>Steam Game Recommender</strong> — Collaborative-filtering recommender with ALS matrix factorization. <a href="https://github.com/lucasloepke/steam-game-recommender">GitHub</a></li>
            <li><strong><a href="/commit-art/">Commit Art</a></strong> — Draw pixel art on your GitHub contribution graph. Paint squares, stamp text, or place stickers, then run a script that builds the commits.</li>
            <li><strong>Cleanup Crew</strong> — Rust/Bevy action game published on Steam. <a href="https://store.steampowered.com/app/4801800/Cleanup_Crew/">Steam</a></li>
            <li><strong>Trust Circle</strong> — Winning SAP STAR Hacks 2025 group savings platform. <a href="https://github.com/lucasloepke/Trust-Circle">GitHub</a></li>
            <li><strong>GTB Solver</strong> — Minecraft Fabric mod for Hypixel Guess the Build. <a href="https://github.com/lucasloepke/gtbsolver">GitHub</a></li>
            <li><strong>Flowle</strong> — Browser puzzle game; CSC Hacks 2023 winner. <a href="https://flowle.pages.dev/">Live</a></li>
          </ul>
        </section>
        <footer>
          <p>
            <a href="/">Home</a> ·
            <a href="https://github.com/lucasloepke">GitHub</a> ·
            <a href="https://www.linkedin.com/in/lucasloepke/">LinkedIn</a> ·
            <a href="/Loepke_Resume.pdf">Resume</a>
          </p>
        </footer>
      </main>
`;

const commitArtShell = `
      <main style="max-width: 720px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; line-height: 1.6; color: #e2e8f0; background: #0b1220;">
        <p><a href="/">← Lucas Loepke</a></p>
        <h1>Commit Art: GitHub contribution graph art generator</h1>
        <p>Draw pixel art on your GitHub contribution graph for free, with no sign-up. Paint squares, stamp text, or place stickers like a cat, a heart, or a space invader, then run the script it generates to create the commits.</p>
        <h2>How it works</h2>
        <p>Past days can be painted because a Git commit's date is a field in the commit, set by whoever creates it. GitHub places each commit on your graph using that date, not the day it was pushed. The script builds a new repo of empty commits stamped with the days you painted, and darker squares get more commits.</p>
        <h2>How to use it</h2>
        <ol>
          <li>Pick a year or the past 12 months, then draw on the graph.</li>
          <li>Download the script and run it with bash on macOS, Linux, or Git Bash on Windows.</li>
          <li>Push the new repo to GitHub. Your git email must be verified on your GitHub account for the squares to appear.</li>
        </ol>
        <h2>How to undo it</h2>
        <p>Delete the repo on GitHub and the squares disappear.</p>
        <p><a href="/projects/">More projects by Lucas Loepke</a></p>
      </main>
`;

/** Routes to emit as static <path>/index.html (home is already correct). */
const routes = [
  {
    path: "/projects",
    title: "Projects | Lucas Loepke",
    description:
      "Selected software projects by Lucas Loepke — machine learning, full-stack web apps, game development, and award-winning hackathon builds.",
    shell: projectsShell,
  },
  {
    path: "/commit-art",
    title: "GitHub Contribution Graph Art Generator | Commit Art",
    description:
      "Draw pixel art on your GitHub contribution graph. Paint squares, stamp text, or place stickers, then run a free script that builds the commits.",
    keywords:
      "GitHub contribution graph art, GitHub commit art, contribution graph generator, GitHub profile art, pixel art GitHub, backdated commits",
    image: `${SITE_URL}/og-commit-art.png`,
    imageAlt: "Commit Art: the words COMMIT ART drawn in green on a GitHub contribution graph",
    shell: commitArtShell,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Commit Art",
      url: `${SITE_URL}/commit-art/`,
      description:
        "A free pixel editor for the GitHub contribution graph. Paint squares, stamp text, or place stickers, then run the script it generates to build a repo of empty, backdated commits.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      image: `${SITE_URL}/og-commit-art.png`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@type": "Person", name: "Lucas Loepke", url: `${SITE_URL}/` },
    },
  },
];

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Replace the content="" of a meta tag identified by its identifying
 * attribute (e.g. attr="name", value="description"). Tolerates the
 * single-line and multi-line tag formatting emitted into the HTML.
 */
function setMetaContent(html, attr, value, val) {
  const re = new RegExp(`(<meta\\s+${attr}="${value}"\\s+content=")[^"]*(")`, "i");
  return html.replace(re, `$1${escapeHtml(val)}$2`);
}

/** Swap the home page's structured data for a route's own. */
function replaceJsonLd(html, data) {
  let first = true;
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, () => {
    if (!first) return "";
    first = false;
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>\n    `;
  });
}

function replaceSeoShell(html, shell) {
  return html.replace(
    /<div id="seo-crawl">[\s\S]*<\/div>\s*<div id="root"><\/div>/i,
    `<div id="seo-crawl">${shell}</div>\n    <div id="root"></div>`,
  );
}

const base = readFileSync(path.join(dist, "index.html"), "utf8");

for (const route of routes) {
  const url = `${SITE_URL}${route.path}/`;
  let html = base;

  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
  html = setMetaContent(html, "name", "description", route.description);
  html = setMetaContent(html, "property", "og:title", route.title);
  html = setMetaContent(html, "property", "og:description", route.description);
  html = setMetaContent(html, "property", "og:url", url);
  html = setMetaContent(html, "name", "twitter:title", route.title);
  html = setMetaContent(html, "name", "twitter:description", route.description);
  html = html.replace(
    /(<link rel="canonical" href=")[^"]*(")/i,
    `$1${url}$2`,
  );
  if (route.keywords) html = setMetaContent(html, "name", "keywords", route.keywords);
  if (route.image) {
    html = setMetaContent(html, "property", "og:image", route.image);
    html = setMetaContent(html, "property", "og:image:secure_url", route.image);
    html = setMetaContent(html, "name", "twitter:image", route.image);
    html = setMetaContent(html, "property", "og:image:alt", route.imageAlt);
    html = setMetaContent(html, "name", "twitter:image:alt", route.imageAlt);
  }
  if (route.jsonLd) html = replaceJsonLd(html, route.jsonLd);
  if (route.shell) {
    html = replaceSeoShell(html, route.shell);
  }

  const outDir = path.join(dist, route.path);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "index.html"), html, "utf8");
  console.log(`Wrote dist${route.path}/index.html`);
}
