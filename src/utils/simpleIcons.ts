import * as icons from "simple-icons";

export interface SimpleIconResult {
  svg: string;
  hex?: string;
}

/** Match simple-icons export convention: slug "react" -> "siReact" */
function slugToVariableName(slug: string): string {
  return "si" + slug.charAt(0).toUpperCase() + slug.slice(1);
}

/**
 * Get Simple Icons SVG and hex by slug. Returns undefined if not found.
 * Use for rendering skill/project tech icons.
 */
export function getSimpleIcon(slug: string): SimpleIconResult | undefined {
  if (!slug || typeof slug !== "string") return undefined;
  const key = slugToVariableName(slug) as keyof typeof icons;
  const icon = icons[key];
  if (icon && typeof icon === "object" && "svg" in icon) {
    return {
      svg: (icon as { svg: string }).svg,
      hex: (icon as { hex?: string }).hex,
    };
  }
  return undefined;
}
