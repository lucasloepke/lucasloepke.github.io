import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Container } from "../components/Container";
import { Seo } from "../components/Seo";
import {
  INTENSITY_PRESETS,
  ROWS,
  buildScript,
  cellDate,
  commitPlan,
  decodeCells,
  emptyCells,
  encodeCells,
  formatDate,
  getRange,
  idx,
  isValidCell,
  maxTextChars,
  monthLabels,
  randomFill,
  rangeOptions,
  sanitizeRepoName,
  stampText,
  type IntensityId,
  type Level,
} from "../lib/commitArt";
import { STICKERS, stickerCells, type Sticker } from "../lib/commitArtStickers";

// GitHub's dark-theme contribution colors.
const SHADES = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
const PAGE_PATH = "/commit-art";

function defaultRangeId() {
  return String(new Date().getFullYear() - 1);
}

function readHash() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const r = params.get("r");
  const p = params.get("p");
  const s = params.get("s");
  return {
    rangeId: r && (r === "rolling" || /^\d{4}$/.test(r)) ? r : null,
    cells: p ? decodeCells(p) : null,
    intensity: s && s in INTENSITY_PRESETS ? (s as IntensityId) : null,
  };
}

export function CommitArt() {
  const initial = useMemo(readHash, []);
  const [rangeId, setRangeId] = useState(initial.rangeId ?? defaultRangeId());
  const [cells, setCells] = useState<Level[]>(
    () => initial.cells ?? stampText(emptyCells(), getRange(initial.rangeId ?? defaultRangeId()), "HELLO", 4),
  );
  const [brush, setBrush] = useState<Level>(4);
  const [intensity, setIntensity] = useState<IntensityId>(initial.intensity ?? "medium");
  const [text, setText] = useState("");
  const [repoName, setRepoName] = useState(`commit-art-${initial.rangeId ?? defaultRangeId()}`);
  const [toast, setToast] = useState<string | null>(null);
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [hoverCell, setHoverCell] = useState<{ col: number; row: number } | null>(null);
  const history = useRef<Level[][]>([]);
  const stroke = useRef<{ value: Level } | null>(null);

  const range = useMemo(() => getRange(rangeId), [rangeId]);

  const commit = useCallback((next: Level[]) => {
    setCells((prev) => {
      history.current.push(prev);
      if (history.current.length > 100) history.current.shift();
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    const prev = history.current.pop();
    if (prev) setCells(prev);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
      if (e.key === "Escape") setSticker(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ----------------------------------------------------------- painting */

  const paint = useCallback((col: number, row: number, value: Level) => {
    setCells((prev) => {
      const i = idx(col, row);
      if (prev[i] === value) return prev;
      const next = prev.slice();
      next[i] = value;
      return next;
    });
  }, []);

  const cellFromEvent = (e: React.PointerEvent) => {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const col = el?.dataset.col;
    const row = el?.dataset.row;
    if (col === undefined || row === undefined) return null;
    return { col: Number(col), row: Number(row) };
  };

  const stickerPreview = useMemo(
    () => (sticker && hoverCell ? stickerCells(sticker, range, hoverCell.col, hoverCell.row) : null),
    [sticker, hoverCell, range],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    const cell = cellFromEvent(e);
    if (sticker) {
      if (!cell) return;
      e.preventDefault();
      const next = cells.slice();
      stickerCells(sticker, range, cell.col, cell.row).forEach((level, i) => {
        next[i] = level;
      });
      commit(next);
      return;
    }
    if (!cell || !isValidCell(range, cell.col, cell.row)) return;
    e.preventDefault();
    history.current.push(cells);
    const current = cells[idx(cell.col, cell.row)];
    // Clicking a square already at the brush shade erases instead.
    const value: Level = e.button === 2 || (brush !== 0 && current === brush) ? 0 : brush;
    stroke.current = { value };
    paint(cell.col, cell.row, value);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (sticker) {
      const cell = cellFromEvent(e);
      if (cell) setHoverCell(cell);
      return;
    }
    if (!stroke.current) return;
    const cell = cellFromEvent(e);
    if (cell && isValidCell(range, cell.col, cell.row)) paint(cell.col, cell.row, stroke.current.value);
  };

  useEffect(() => {
    const end = () => (stroke.current = null);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  /* -------------------------------------------------------------- tools */

  const invert = () =>
    commit(cells.map((v, i) => (Math.floor(i / ROWS) < range.cols ? ((4 - v) as Level) : v)));

  const changeRange = (id: string) => {
    setRangeId(id);
    setRepoName((name) => (/^commit-art-(\d{4}|rolling)$/.test(name) ? `commit-art-${id}` : name));
  };

  /* ------------------------------------------------------------- output */

  const plan = useMemo(() => commitPlan(cells, range, intensity), [cells, range, intensity]);
  const totalCommits = plan.reduce((s, d) => s + d.commits, 0);

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams({ r: rangeId, s: intensity, p: encodeCells(cells, range.cols) });
    return `${window.location.origin}${PAGE_PATH}#${params.toString()}`;
  }, [cells, range.cols, rangeId, intensity]);

  const script = useMemo(
    () => buildScript({ cells, range, intensity, repoName, shareUrl }),
    [cells, range, intensity, repoName, shareUrl],
  );

  const copy = async (value: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast(msg);
    } catch {
      setToast("Copy failed. Try the download button.");
    }
  };

  const download = () => {
    const blob = new Blob([script], { type: "text/x-shellscript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "commit-art.sh";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  /* ---------------------------------------------------------- rendering */

  const months = useMemo(() => monthLabels(range), [range]);

  const empty = plan.length === 0;
  const textTooLong = text.length > maxTextChars(range);

  return (
    <div className="pb-24 pt-12 sm:pt-20">
      <Seo
        title="GitHub Contribution Graph Art Generator | Commit Art"
        description="Draw pixel art on your GitHub contribution graph. Paint squares, stamp text, or place stickers, then run a free script that builds the commits."
        path={PAGE_PATH}
        image="https://lucasloepke.github.io/og-commit-art.png"
        imageAlt="Commit Art: the words COMMIT ART drawn in green on a GitHub contribution graph"
      />

      <Container className="route-transition">
        <header className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-50 sm:text-5xl">Commit Art</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-200/75">
            Draw on your GitHub contribution graph. It becomes a real repo of empty, backdated commits, and deleting
            the repo erases the drawing.
          </p>
        </header>

        <section
          aria-label="Drawing canvas"
          className="mt-12 rounded-3xl bg-white/[0.04] p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/10 backdrop-blur-md sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <select
              aria-label="Year"
              value={rangeId}
              onChange={(e) => changeRange(e.target.value)}
              className="min-h-9 cursor-pointer rounded-lg bg-white/10 px-3 text-sm font-medium text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {rangeOptions().map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-sm tabular-nums text-neutral-400" aria-live="polite">
              {empty ? (
                "Nothing drawn yet"
              ) : (
                <>
                  <span className="font-medium text-neutral-100">{totalCommits.toLocaleString()}</span> commits on{" "}
                  <span className="font-medium text-neutral-100">{plan.length}</span> days
                </>
              )}
            </p>
          </div>

          <div className="mt-5 overflow-x-auto pb-1">
            <div className="min-w-[52rem] select-none">
              <div className="relative ml-8 h-5 text-[11px] text-neutral-400">
                {months.map((m) => (
                  <span key={m.col} className="absolute" style={{ left: `${(m.col / range.cols) * 100}%` }}>
                    {m.text}
                  </span>
                ))}
              </div>
              <div className="flex">
                <div className="grid w-8 shrink-0 grid-rows-7 items-center gap-[3px] text-[10px] leading-none text-neutral-400">
                  {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
                <div
                  className="grid min-w-0 flex-1 grid-flow-col grid-rows-[repeat(7,auto)] gap-[3px]"
                  style={{ gridTemplateColumns: `repeat(${range.cols}, minmax(0, 1fr))`, touchAction: "pan-x pan-y" }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerLeave={() => setHoverCell(null)}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {Array.from({ length: range.cols * ROWS }, (_, i) => {
                    const col = Math.floor(i / ROWS);
                    const row = i % ROWS;
                    const valid = isValidCell(range, col, row);
                    const level = stickerPreview?.get(i) ?? cells[idx(col, row)];
                    return (
                      <div
                        key={i}
                        data-col={col}
                        data-row={row}
                        title={valid ? `${formatDate(cellDate(range, col, row))}${level ? ` · ${INTENSITY_PRESETS[intensity].counts[level - 1]} commits` : ""}` : undefined}
                        className={`aspect-square rounded-[3px] ${
                          !valid ? "" : sticker ? "cursor-copy" : "cursor-pointer outline-1 outline-white/40 hover:outline"
                        }`}
                        style={{ background: valid ? SHADES[level] : "transparent" }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-neutral-400 sm:hidden">Tap squares to paint. Swipe to see the whole year.</p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 pt-3">
            <div className="flex items-center" role="radiogroup" aria-label="Brush shade">
              {([1, 2, 3, 4, 0] as Level[]).map((lv) => (
                <button
                  key={lv}
                  type="button"
                  role="radio"
                  aria-checked={brush === lv}
                  aria-label={lv === 0 ? "Eraser" : `Shade ${lv}`}
                  title={lv === 0 ? "Eraser" : `Shade ${lv}`}
                  onClick={() => setBrush(lv)}
                  className="flex h-11 w-9 cursor-pointer items-center justify-center"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md transition-shadow duration-150 ${
                      brush === lv ? "ring-2 ring-white ring-offset-2 ring-offset-[#0d1524]" : ""
                    }`}
                    style={lv === 0 ? undefined : { background: SHADES[lv] }}
                  >
                    {lv === 0 && (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l10-10a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L11 21M22 21H7M5 11l9 9" />
                      </svg>
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-1">
              <form
                className="mr-2 flex items-center gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim()) commit(stampText(cells, range, text, brush || 4));
                }}
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type text"
                  aria-label="Text to stamp"
                  maxLength={20}
                  className={`h-9 w-32 rounded-lg bg-white/10 px-3 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                    textTooLong ? "ring-2 ring-amber-400 focus:ring-amber-400" : "focus:ring-accent"
                  }`}
                />
                <ToolButton type="submit">Stamp</ToolButton>
              </form>
              <ToolButton onClick={() => commit(randomFill(range))}>Random</ToolButton>
              <ToolButton onClick={invert}>Invert</ToolButton>
              <ToolButton onClick={undo}>Undo</ToolButton>
              <ToolButton onClick={() => commit(emptyCells())}>Clear</ToolButton>
            </div>
          </div>
          {textTooLong && (
            <p className="mt-2 text-xs text-amber-400">
              Only about {maxTextChars(range)} characters fit; the rest will be cut off.
            </p>
          )}

          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="flex flex-wrap gap-1" role="group" aria-label="Stickers">
              {STICKERS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={sticker?.id === s.id}
                  aria-label={`${s.label} sticker`}
                  title={s.label}
                  onClick={() => setSticker(sticker?.id === s.id ? null : s)}
                  className={`flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg px-1.5 transition-colors duration-150 ${
                    sticker?.id === s.id ? "bg-white/20 ring-1 ring-white/60" : "hover:bg-white/10"
                  }`}
                >
                  <StickerThumb sticker={s} />
                </button>
              ))}
            </div>
            <p className="mt-2 min-h-5 text-sm text-neutral-400" aria-live="polite">
              {sticker
                ? `Click the graph to place the ${sticker.label.toLowerCase()}. Press Esc or click it again when you're done.`
                : "Pick a sticker, then place it anywhere on the graph."}
            </p>
          </div>
        </section>

        <section className="mt-12 text-center" aria-label="Get your script">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button type="button" disabled={empty} onClick={download} className="glass-button glass-button-primary cursor-pointer">
              <span>Download script</span>
            </button>
            <button type="button" onClick={() => copy(shareUrl, "Link copied")} className="glass-button cursor-pointer">
              <span>Copy share link</span>
            </button>
          </div>
          <p className="mt-5 text-sm text-neutral-400">Then run it from the folder you downloaded it to:</p>
          <code className="mt-2 inline-block rounded-lg bg-white/[0.06] px-3 py-1.5 font-mono text-sm text-neutral-100">
            bash commit-art.sh
          </code>
        </section>

        <div className="mx-auto mt-12 max-w-2xl divide-y divide-white/10 border-y border-white/10 text-sm">
          <details className="group">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-medium text-neutral-100">
              <h2>Options</h2>
              <Chevron />
            </summary>
            <div className="space-y-5 pb-5">
              <div>
                <div className="text-neutral-400">Shade strength</div>
                <div className="mt-2 inline-flex rounded-lg bg-white/10 p-0.5">
                  {(Object.keys(INTENSITY_PRESETS) as IntensityId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setIntensity(id)}
                      className={`min-h-9 cursor-pointer rounded-md px-3 transition-colors duration-150 ${
                        intensity === id ? "bg-white/15 text-white" : "text-neutral-300 hover:text-white"
                      }`}
                    >
                      {INTENSITY_PRESETS[id].label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-neutral-400">
                  Commits per shade: {INTENSITY_PRESETS[intensity].counts.join(" / ")}. GitHub sets shades relative to
                  your busiest days, so go higher if you already have real activity in this range.
                </p>
              </div>
              <label className="block">
                <span className="text-neutral-400">Repo name</span>
                <input
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  onBlur={() => setRepoName(sanitizeRepoName(repoName))}
                  className="mt-2 block h-9 w-full rounded-lg bg-white/10 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <button
                type="button"
                disabled={empty}
                onClick={() => copy(script, "Script copied")}
                className="cursor-pointer font-medium text-accent-text transition-colors duration-150 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Copy the script instead
              </button>
            </div>
          </details>

          <details className="group">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-medium text-neutral-100">
              <h2>How it works</h2>
              <Chevron />
            </summary>
            <div className="space-y-3 pb-5 leading-relaxed text-neutral-400">
              <p>
                Past days can be painted because a Git commit's date is just a field in the commit, set by whoever
                creates it. GitHub places each commit on your graph using that date, not the day it was pushed. So the
                script creates empty commits stamped with the days you painted, and darker squares get more commits.
              </p>
              <p>
                The script runs in a terminal (macOS, Linux, or Git Bash on Windows) and makes a new folder called{" "}
                <code className="text-neutral-200">{sanitizeRepoName(repoName)}</code> with the commits inside. If you
                have the{" "}
                <a href="https://cli.github.com" target="_blank" rel="noopener noreferrer" className="text-accent-text hover:underline">
                  GitHub CLI
                </a>{" "}
                signed in, it can create and push the repo for you; otherwise it prints the two commands to run.
              </p>
              <p>
                Your git email (<code className="text-neutral-200">git config user.email</code>) must be verified on
                your GitHub account. The repo should be public, or turn on “Include private contributions” on your
                profile.
              </p>
              <p>
                “Past 12 months” is what your profile shows by default, but it shifts left a column every week. Past
                years stay put and show up when you click that year on your profile, so pick one you didn't use much.
              </p>
              <p>To undo, delete the repo on GitHub and the squares disappear.</p>
            </div>
          </details>
        </div>
      </Container>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white shadow-lg ring-1 ring-white/20 backdrop-blur-xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function ToolButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="min-h-11 cursor-pointer rounded-lg px-2.5 text-sm font-medium text-neutral-300 transition-colors duration-150 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    />
  );
}

function StickerThumb({ sticker }: { sticker: Sticker }) {
  return (
    <span
      aria-hidden
      className="grid gap-px"
      style={{ gridTemplateColumns: `repeat(${sticker.pixels[0].length}, 2px)`, gridAutoRows: "2px" }}
    >
      {sticker.pixels.flatMap((line, y) =>
        [...line].map((px, x) => (
          <span key={`${x}-${y}`} style={px === "." ? undefined : { background: SHADES[Number(px)] }} />
        )),
      )}
    </span>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
