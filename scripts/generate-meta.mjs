// Post-build: bake per-route <head> metadata into static HTML files so that
// non-JS crawlers (LinkedIn, Slack, X, iMessage, Discord) get the correct
// title/description/canonical/OG tags for deep-linked routes.
//
// The SPA already updates these client-side via <Seo>; this just makes the
// initial HTML correct for crawlers that don't execute JavaScript.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, "../dist");
const SITE_URL = "https://lucasloepke.github.io";

/** Routes to emit as static <path>/index.html (home is already correct). */
const routes = [
  {
    path: "/projects",
    title: "Projects | Lucas Loepke",
    description:
      "Selected software projects by Lucas Loepke — machine learning, full-stack web apps, game development, and award-winning hackathon builds.",
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

const base = readFileSync(path.join(dist, "index.html"), "utf8");

for (const route of routes) {
  const url = `${SITE_URL}${route.path}`;
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

  const outDir = path.join(dist, route.path);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "index.html"), html, "utf8");
  console.log(`Wrote dist${route.path}/index.html`);
}
