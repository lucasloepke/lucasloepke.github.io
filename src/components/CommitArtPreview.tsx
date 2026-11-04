import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ROWS, commitPlan, emptyCells, getRange, idx, isValidCell, monthLabels, stampText } from "../lib/commitArt";

const SHADES = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

/** The real stamp logic drawing a name; its squares paint in when scrolled to. */
export function CommitArtPreview() {
  const { range, cols, cells, months, contributions } = useMemo(() => {
    const range = getRange("2025");
    const cells = stampText(emptyCells(), range, "LUCAS LOEPKE", 4);
    return {
      range,
      cols: range.cols,
      cells,
      months: monthLabels(range),
      contributions: commitPlan(cells, range, "medium").reduce((sum, day) => sum + day.commits, 0),
    };
  }, []);

  return (
    <Link
      to="/commit-art"
      aria-label="Open Commit Art, a drawing tool for the GitHub contribution graph"
      className="flex w-full flex-col justify-center rounded-2xl bg-white/[0.04] p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/10 backdrop-blur-md transition-colors duration-200 hover:bg-white/[0.07] sm:aspect-[460/215] sm:p-5"
    >
      <div aria-hidden>
        <p className="text-sm font-medium text-neutral-100">{contributions.toLocaleString("en-US")} contributions in the last year</p>

        <div className="relative ml-6 mt-3 h-4 text-[10px] leading-none text-neutral-400">
          {months.map((m) => (
            <span key={m.col} className="absolute" style={{ left: `${(m.col / cols) * 100}%` }}>
              {m.text}
            </span>
          ))}
        </div>

        <div className="flex">
          <div className="grid w-6 shrink-0 grid-rows-7 items-center gap-[2px] text-[9px] leading-[0] text-neutral-400">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((day, i) => (
              <span key={i}>{day}</span>
            ))}
          </div>
          <div
            className="grid min-w-0 flex-1 grid-flow-col grid-rows-[repeat(7,auto)] gap-[2px]"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: cols * ROWS }, (_, i) => {
              const col = Math.floor(i / ROWS);
              const row = i % ROWS;
              // Days outside the year stay blank, like the gaps at each end of a real graph.
              if (!isValidCell(range, col, row)) return <span key={i} className="block aspect-square" />;
              const level = cells[idx(col, row)];
              return (
                <span key={i} className="relative block aspect-square rounded-[1.5px]" style={{ background: SHADES[0] }}>
                  {level > 0 && (
                    <span
                      className="paint-square absolute inset-0 rounded-[1.5px]"
                      style={{ background: SHADES[level], transitionDelay: `${col * 22}ms` }}
                    />
                  )}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-end gap-[3px] text-[10px] leading-none text-neutral-400">
          <span className="mr-1">Less</span>
          {SHADES.map((shade) => (
            <span key={shade} className="h-2 w-2 rounded-[1.5px]" style={{ background: shade }} />
          ))}
          <span className="ml-1">More</span>
        </div>
      </div>
    </Link>
  );
}
