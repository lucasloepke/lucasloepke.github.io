// Explicit named imports so bundlers tree-shake to only the icons we use.
// (Previously `import * as icons` pulled in all ~3,300 Simple Icons.)
import {
  siSwift,
  siRust,
  siPython,
  siOpenjdk,
  siC,
  siJavascript,
  siTypescript,
  siLatex,
  siHtml5,
  siCss,
  siBaserow,
  siGraphql,
  siXml,
  siApple,
  siFlask,
  siReact,
  siSap,
  siSelenium,
  siXcode,
  siNodedotjs,
  siPandas,
  siNumpy,
  siBevy,
  siLangchain,
  siLanggraph,
  siTailwindcss,
  siVite,
  siNextdotjs,
  siGit,
  siGithub,
  siDocker,
  siPostgresql,
  siVercel,
  siCloudflare,
  siCloudflarepages,
  siGooglegemini,
  siCursor,
} from "simple-icons";

export interface SimpleIconResult {
  svg: string;
  hex?: string;
}

interface SimpleIcon {
  svg: string;
  hex?: string;
}

/** Only the icons referenced by src/data/skills.ts and components, keyed by slug. */
const iconsBySlug: Record<string, SimpleIcon> = {
  swift: siSwift,
  rust: siRust,
  python: siPython,
  openjdk: siOpenjdk,
  c: siC,
  javascript: siJavascript,
  typescript: siTypescript,
  latex: siLatex,
  html5: siHtml5,
  css: siCss,
  baserow: siBaserow,
  graphql: siGraphql,
  xml: siXml,
  apple: siApple,
  flask: siFlask,
  react: siReact,
  sap: siSap,
  selenium: siSelenium,
  xcode: siXcode,
  nodedotjs: siNodedotjs,
  pandas: siPandas,
  numpy: siNumpy,
  bevy: siBevy,
  langchain: siLangchain,
  langgraph: siLanggraph,
  tailwindcss: siTailwindcss,
  vite: siVite,
  nextdotjs: siNextdotjs,
  git: siGit,
  github: siGithub,
  docker: siDocker,
  postgresql: siPostgresql,
  vercel: siVercel,
  cloudflare: siCloudflare,
  cloudflarepages: siCloudflarepages,
  googlegemini: siGooglegemini,
  cursor: siCursor,
};

/**
 * Get Simple Icons SVG and hex by slug. Returns undefined if not found.
 * Use for rendering skill/project tech icons.
 */
export function getSimpleIcon(slug: string): SimpleIconResult | undefined {
  if (!slug || typeof slug !== "string") return undefined;
  const icon = iconsBySlug[slug];
  if (!icon) return undefined;
  return { svg: icon.svg, hex: icon.hex };
}
