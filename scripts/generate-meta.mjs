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

/** Routes to emit as static <path>/index.html (home is already correct). */
const routes = [
  {
    path: "/projects",
    title: "Projects | Lucas Loepke",
    description:
      "Selected software projects by Lucas Loepke — machine learning, full-stack web apps, game development, and award-winning hackathon builds.",
    shell: projectsShell,
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
  if (route.shell) {
    html = replaceSeoShell(html, route.shell);
  }

  const outDir = path.join(dist, route.path);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "index.html"), html, "utf8");
  console.log(`Wrote dist${route.path}/index.html`);
}
