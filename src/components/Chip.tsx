import type { SimpleIconResult } from "../utils/simpleIcons";
import { getSimpleIcon } from "../utils/simpleIcons";

interface ChipProps {
  label: string;
  iconSlug?: string;
  icon?: SimpleIconResult | null;
  /** Optional custom SVG icon string */
  customIconSvg?: string;
  /** Optional emoji (e.g. flag) shown instead of icon when set */
  emoji?: string;
}

export function Chip({ label, iconSlug, icon, customIconSvg, emoji }: ChipProps) {
  const resolvedIcon = emoji ? null : (icon ?? (iconSlug ? getSimpleIcon(iconSlug) : null));
  const iconSvg = customIconSvg || (resolvedIcon ? resolvedIcon.svg : undefined);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm text-neutral-700 transition-colors duration-150 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
      title={label}
    >
      {emoji ? (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-base leading-none" aria-hidden>
          {emoji}
        </span>
      ) : iconSvg ? (
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center text-current [&>svg]:h-4 [&>svg]:w-4 [&>svg_path]:fill-current [&>svg_circle]:fill-current"
          dangerouslySetInnerHTML={{ __html: iconSvg }}
          aria-hidden
        />
      ) : (
        <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500" aria-hidden />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}
