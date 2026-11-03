import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Container } from "../components/Container";
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
  imageToCells,
  isValidCell,
  maxTextChars,
  randomFill,
  rangeOptions,
  sanitizeRepoName,
  stampText,
  type IntensityId,
  type Level,
} from "../lib/commitArt";

// GitHub's dark-theme contribution colors.
const SHADES = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
const PAGE_PATH = "/commit-art";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
  const [cells, setCells] = useState<Level[]>(initial.cells ?? emptyCells());
  const [brush, setBrush] = useState<Level>(4);
  const [intensity, setIntensity] = useState<IntensityId>(initial.intensity ?? "medium");
  const [text, setText] = useState("");
  const [repoName, setRepoName] = useState(`commit-art-${initial.rangeId ?? defaultRangeId()}`);
  const [toast, setToast] = useState<string | null>(null);
  const history = useRef<Level[][]>([]);
  const stroke = useRef<{ value: Level } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

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

  const onPointerDown = (e: React.PointerEvent) => {
    const cell = cellFromEvent(e);
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

  const onImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      commit(imageToCells(img, range));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setToast("Couldn't read that image");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

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

  const monthLabels = useMemo(() => {
    const labels: { col: number; text: string }[] = [];
    let lastMonth = -1;
    for (let col = 0; col < range.cols; col++) {
      for (let row = 0; row < ROWS; row++) {
        if (!isValidCell(range, col, row)) continue;
        const d = new Date(cellDate(range, col, row));
        const m = d.getUTCMonth();
        if (m !== lastMonth && (col === 0 || d.getUTCDate() <= 7)) {
          const prev = labels[labels.length - 1];
          if (!prev || col - prev.col >= 3) labels.push({ col, text: MONTHS[m] });
          lastMonth = m;
        }
        break;
      }
    }
    return labels;
  }, [range]);

  const empty = plan.length === 0;
  const textTooLong = text.length > maxTextChars(range);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b1220] pt-8 pb-16 sm:pt-10">
      <title>Commit Art</title>
      <meta name="robots" content="noindex, nofollow" />

      <Container className="route-transition text-neutral-200">
        <p className="text-xs font-medium uppercase tracking-widest text-[#39d353]">Experimental</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Commit Art</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Draw on your GitHub contribution graph. Paint the squares below, download a script, and run it.
          It creates a new repo full of empty commits dated to match your drawing.
        </p>

        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ["Draw", "Click and drag on the grid. Click a square again to erase it. You can also stamp text or import an image."],
            ["Download", "Pick the year it should appear in, then download the script."],
            ["Run", "Open a terminal (Git Bash on Windows) in any folder and run it. It builds the repo and walks you through pushing."],
          ].map(([title, body], i) => (
            <li key={title} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#26a641] text-xs font-bold text-[#0b1220]">
                  {i + 1}
                </span>
                <span className="font-semibold text-white">{title}</span>
              </div>
              <p className="mt-2 text-sm text-neutral-400">{body}</p>
            </li>
          ))}
        </ol>

        {/* ------------------------------------------------ editor */}
        <section className="mt-8 rounded-xl border border-neutral-800 bg-[#0d1117] p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-neutral-400">Year</span>
              <select
                value={rangeId}
                onChange={(e) => changeRange(e.target.value)}
                className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-white"
              >
                {rangeOptions().map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-400">Brush</span>
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Brush shade">
                {([1, 2, 3, 4, 0] as Level[]).map((lv) => (
                  <button
                    key={lv}
                    type="button"
                    role="radio"
                    aria-checked={brush === lv}
                    aria-label={lv === 0 ? "Eraser" : `Shade ${lv}`}
                    title={lv === 0 ? "Eraser" : `Shade ${lv}`}
                    onClick={() => setBrush(lv)}
                    className={`flex h-7 w-7 items-center justify-center rounded-md border-2 transition ${
                      brush === lv ? "border-white" : "border-transparent hover:border-neutral-600"
                    }`}
                  >
                    {lv === 0 ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l10-10a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L11 21M22 21H7M5 11l9 9" />
                      </svg>
                    ) : (
                      <span className="h-4 w-4 rounded-[3px]" style={{ background: SHADES[lv] }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* grid */}
          <div className="mt-5 overflow-x-auto pb-2">
            <div className="inline-block select-none">
              <div className="relative ml-8 h-4 text-[11px] text-neutral-500">
                {monthLabels.map((m) => (
                  <span key={m.col} className="absolute" style={{ left: m.col * 14 }}>
                    {m.text}
                  </span>
                ))}
              </div>
              <div className="flex">
                <div className="mr-2 grid w-6 grid-rows-7 gap-[3px] text-[10px] leading-[11px] text-neutral-500">
                  {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
                <div
                  className="grid grid-flow-col grid-rows-7 gap-[3px]"
                  style={{ touchAction: "none" }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {Array.from({ length: range.cols * ROWS }, (_, i) => {
                    const col = Math.floor(i / ROWS);
                    const row = i % ROWS;
                    const valid = isValidCell(range, col, row);
                    const level = cells[idx(col, row)];
                    return (
                      <div
                        key={i}
                        data-col={col}
                        data-row={row}
                        title={valid ? `${formatDate(cellDate(range, col, row))}${level ? ` · ${INTENSITY_PRESETS[intensity].counts[level - 1]} commits` : ""}` : undefined}
                        className={`h-[11px] w-[11px] rounded-[2px] ${valid ? "cursor-pointer outline-1 outline-white/10 hover:outline" : ""}`}
                        style={{
                          background: valid ? SHADES[level] : "transparent",
                          opacity: valid ? 1 : 0,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-neutral-500">
                Less
                {SHADES.map((c) => (
                  <span key={c} className="h-[11px] w-[11px] rounded-[2px]" style={{ background: c }} />
                ))}
                More
              </div>
            </div>
          </div>

          {/* tools */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-800 pt-4">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (text.trim()) commit(stampText(cells, range, text, brush || 4));
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type text…"
                maxLength={20}
                className={`w-36 rounded-md border bg-neutral-900 px-2.5 py-1.5 text-sm text-white placeholder:text-neutral-500 ${
                  textTooLong ? "border-amber-500" : "border-neutral-700"
                }`}
              />
              <ToolButton type="submit">Stamp text</ToolButton>
            </form>
            <ToolButton onClick={() => fileInput.current?.click()}>Import image</ToolButton>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImage(f);
                e.target.value = "";
              }}
            />
            <ToolButton onClick={() => commit(randomFill(range))}>Random</ToolButton>
            <ToolButton onClick={invert}>Invert</ToolButton>
            <ToolButton onClick={undo}>Undo</ToolButton>
            <ToolButton onClick={() => commit(emptyCells())}>Clear</ToolButton>
          </div>
          {textTooLong && (
            <p className="mt-2 text-xs text-amber-400">
              Only about {maxTextChars(range)} characters fit; the rest will be cut off.
            </p>
          )}
        </section>

        {/* ------------------------------------------------ export */}
        <section className="mt-6 grid gap-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 sm:grid-cols-2 sm:p-5">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-neutral-400">Shade strength</div>
              <div className="mt-1.5 inline-flex rounded-md border border-neutral-700 p-0.5">
                {(Object.keys(INTENSITY_PRESETS) as IntensityId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setIntensity(id)}
                    className={`rounded px-3 py-1 text-sm transition ${
                      intensity === id ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {INTENSITY_PRESETS[id].label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">
                Commits per shade: {INTENSITY_PRESETS[intensity].counts.join(" / ")}. GitHub sets shades relative to
                your busiest days, so go higher if you already have real activity in this range.
              </p>
            </div>
            <label className="block">
              <span className="text-sm text-neutral-400">Repo name</span>
              <input
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                onBlur={() => setRepoName(sanitizeRepoName(repoName))}
                className="mt-1.5 block w-full rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-sm text-white"
              />
            </label>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="text-sm text-neutral-400">
              {empty ? (
                "Draw something to generate a script."
              ) : (
                <>
                  <span className="text-2xl font-semibold text-white">{totalCommits.toLocaleString()}</span> commits on{" "}
                  <span className="text-white">{plan.length}</span> days in {range.label}
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={empty}
                onClick={download}
                className="rounded-md bg-[#238636] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Download script
              </button>
              <ToolButton disabled={empty} onClick={() => copy(script, "Script copied")}>
                Copy script
              </ToolButton>
              <ToolButton onClick={() => copy(shareUrl, "Link copied")}>Copy share link</ToolButton>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ run */}
        <section className="mt-6 rounded-xl border border-neutral-800 p-4 sm:p-5">
          <h2 className="font-semibold text-white">Running the script</h2>
          <p className="mt-2 text-sm text-neutral-400">
            In a terminal (macOS, Linux, or Git Bash on Windows), from the folder you downloaded it to:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-[#0d1117] px-4 py-3 text-sm text-[#39d353]">
            <code>bash commit-art.sh</code>
          </pre>
          <p className="mt-3 text-sm text-neutral-400">
            It makes a new folder called <code className="text-neutral-200">{sanitizeRepoName(repoName)}</code> with
            the commits inside. If you have the{" "}
            <a href="https://cli.github.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              GitHub CLI
            </a>{" "}
            signed in, it can create and push the repo for you; otherwise it prints the two commands to run.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-neutral-400">
            <li>
              • Your git email (<code className="text-neutral-200">git config user.email</code>) must be a verified email on
              your GitHub account.
            </li>
            <li>• The repo should be public, or turn on “Include private contributions” on your profile.</li>
            <li>• "Past 12 months" is what your profile shows by default, but it shifts left a column every week. Past years stay put and show up when you click that year on your profile; pick one you didn't use much.</li>
            <li>• To undo, delete the repo on GitHub and the squares disappear.</li>
          </ul>
        </section>
      </Container>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-neutral-800 px-4 py-2 text-sm text-white shadow-lg"
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
      className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 transition hover:border-neutral-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    />
  );
}
