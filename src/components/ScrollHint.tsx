import { useEffect, useState } from "react";

const HIDE_AFTER_PX = 40;
const SHOW_AFTER_MS = 5000;

/**
 * Faint chevron for visitors still on the first screen after a few seconds.
 * Anyone who has already scrolled has found the page, so it never returns for them.
 */
export function ScrollHint({ targetId }: { targetId: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.scrollY < HIDE_AFTER_PX) setVisible(true);
    }, SHOW_AFTER_MS);

    const onScroll = () => {
      if (window.scrollY < HIDE_AFTER_PX) return;
      window.clearTimeout(timer);
      setVisible(false);
      window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <a
      href={`#${targetId}`}
      aria-label="Scroll down to see more"
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      className={`scroll-hint fixed inset-x-0 bottom-5 z-20 mx-auto flex h-11 w-11 items-center justify-center text-white hover:text-white/80 ${
        visible ? "opacity-40" : "pointer-events-none opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="scroll-hint-chevron h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </a>
  );
}
