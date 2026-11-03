// Core logic for the Commit Art tool: maps a 7-row grid onto GitHub's
// contribution calendar, and generates a bash script that recreates the
// drawing as backdated empty commits via `git fast-import`.

export const ROWS = 7;
export const MAX_COLS = 54; // a leap year starting on Saturday needs 54 weeks
export const DAY_MS = 86_400_000;

export type Level = 0 | 1 | 2 | 3 | 4;

export interface CalendarRange {
  id: string; // "rolling" or a year like "2025"
  label: string;
  start: number; // UTC ms of the Sunday in the first column
  min: number; // first valid day (UTC ms, midnight)
  max: number; // last valid day (UTC ms, midnight)
  cols: number;
}

/** Commits generated for shade levels 1-4. */
export const INTENSITY_PRESETS = {
  low: { label: "Low", counts: [1, 2, 3, 4] },
  medium: { label: "Medium", counts: [1, 4, 8, 12] },
  high: { label: "High", counts: [2, 8, 16, 24] },
} as const;
export type IntensityId = keyof typeof INTENSITY_PRESETS;

function utcMidnight(y: number, m: number, d: number) {
  return Date.UTC(y, m, d);
}

export function todayUtc(): number {
  const now = new Date();
  return utcMidnight(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getRange(id: string): CalendarRange {
  const today = todayUtc();
  if (id === "rolling") {
    const dow = new Date(today).getUTCDay();
    const start = today - (dow + 52 * 7) * DAY_MS;
    return { id, label: "Past 12 months", start, min: start, max: today, cols: 53 };
  }
  const year = Number(id);
  const jan1 = utcMidnight(year, 0, 1);
  const dec31 = utcMidnight(year, 11, 31);
  const start = jan1 - new Date(jan1).getUTCDay() * DAY_MS;
  const cols = Math.floor((dec31 - start) / DAY_MS / 7) + 1;
  return { id, label: String(year), start, min: jan1, max: Math.min(dec31, today), cols };
}

export function rangeOptions(): { id: string; label: string }[] {
  const thisYear = new Date().getFullYear();
  const opts = [{ id: "rolling", label: "Past 12 months" }];
  for (let y = thisYear; y >= 2008; y--) opts.push({ id: String(y), label: String(y) });
  return opts;
}

export function cellDate(range: CalendarRange, col: number, row: number): number {
  return range.start + (col * 7 + row) * DAY_MS;
}

export function isValidCell(range: CalendarRange, col: number, row: number): boolean {
  if (col >= range.cols) return false;
  const t = cellDate(range, col, row);
  return t >= range.min && t <= range.max;
}

export const idx = (col: number, row: number) => col * ROWS + row;

export function emptyCells(): Level[] {
  return new Array<Level>(MAX_COLS * ROWS).fill(0);
}

export function formatDate(t: number): string {
  return new Date(t).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* ---------------------------------------------------------------- font */

// 3x5 pixel font. '#' = on.
const FONT: Record<string, string[]> = {
  A: [".#.", "#.#", "###", "#.#", "#.#"],
  B: ["##.", "#.#", "##.", "#.#", "##."],
  C: [".##", "#..", "#..", "#..", ".##"],
  D: ["##.", "#.#", "#.#", "#.#", "##."],
  E: ["###", "#..", "##.", "#..", "###"],
  F: ["###", "#..", "##.", "#..", "#.."],
  G: [".##", "#..", "#.#", "#.#", ".##"],
  H: ["#.#", "#.#", "###", "#.#", "#.#"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  J: ["..#", "..#", "..#", "#.#", ".#."],
  K: ["#.#", "#.#", "##.", "#.#", "#.#"],
  L: ["#..", "#..", "#..", "#..", "###"],
  M: ["#.#", "###", "###", "#.#", "#.#"],
  N: ["##.", "#.#", "#.#", "#.#", "#.#"],
  O: [".#.", "#.#", "#.#", "#.#", ".#."],
  P: ["##.", "#.#", "##.", "#..", "#.."],
  Q: [".#.", "#.#", "#.#", "##.", ".##"],
  R: ["##.", "#.#", "##.", "#.#", "#.#"],
  S: [".##", "#..", ".#.", "..#", "##."],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  V: ["#.#", "#.#", "#.#", "#.#", ".#."],
  W: ["#.#", "#.#", "###", "###", "#.#"],
  X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  Y: ["#.#", "#.#", ".#.", ".#.", ".#."],
  Z: ["###", "..#", ".#.", "#..", "###"],
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["##.", "..#", ".#.", "#..", "###"],
  "3": ["##.", "..#", ".#.", "..#", "##."],
  "4": ["#.#", "#.#", "###", "..#", "..#"],
  "5": ["###", "#..", "##.", "..#", "##."],
  "6": [".##", "#..", "###", "#.#", "###"],
  "7": ["###", "..#", ".#.", ".#.", ".#."],
  "8": ["###", "#.#", "###", "#.#", "###"],
  "9": ["###", "#.#", "###", "..#", "##."],
  " ": ["...", "...", "...", "...", "..."],
  "!": [".#.", ".#.", ".#.", "...", ".#."],
  "?": ["##.", "..#", ".#.", "...", ".#."],
  "-": ["...", "...", "###", "...", "..."],
  "+": ["...", ".#.", "###", ".#.", "..."],
  ".": ["...", "...", "...", "...", ".#."],
  ":": ["...", ".#.", "...", ".#.", "..."],
  "/": ["..#", "..#", ".#.", "#..", "#.."],
  "<": ["..#", ".#.", "#..", ".#.", "..#"],
  ">": ["#..", ".#.", "..#", ".#.", "#.."],
};

export const FONT_CHARS = Object.keys(FONT).join("");

/** Width in columns of `text` rendered with 1-column spacing. */
export function textWidth(text: string): number {
  return text.length ? text.length * 4 - 1 : 0;
}

/** Stamp text centered in the range, rows 1-5. Unknown chars are skipped. */
export function stampText(cells: Level[], range: CalendarRange, text: string, level: Level): Level[] {
  const chars = [...text.toUpperCase()].filter((c) => FONT[c]);
  const next = cells.slice();
  const offset = Math.floor((range.cols - textWidth(chars.join(""))) / 2);
  chars.forEach((ch, i) => {
    FONT[ch].forEach((line, r) => {
      [...line].forEach((px, c) => {
        if (px !== "#") return;
        const col = offset + i * 4 + c;
        const row = r + 1;
        if (col >= 0 && col < range.cols) next[idx(col, row)] = level;
      });
    });
  });
  return next;
}

export function maxTextChars(range: CalendarRange): number {
  return Math.floor((range.cols + 1) / 4);
}

/* -------------------------------------------------------------- random */

export function randomFill(range: CalendarRange): Level[] {
  const next = emptyCells();
  for (let col = 0; col < range.cols; col++) {
    for (let row = 0; row < ROWS; row++) {
      const weekend = row === 0 || row === 6;
      if (Math.random() > (weekend ? 0.3 : 0.7)) continue;
      const r = Math.random();
      next[idx(col, row)] = (r < 0.45 ? 1 : r < 0.75 ? 2 : r < 0.92 ? 3 : 4) as Level;
    }
  }
  return next;
}

/* --------------------------------------------------------- share links */

// Run-length encoding: level letter (a-e = 0-4) followed by run length.
export function encodeCells(cells: Level[], cols: number): string {
  let out = "";
  const flat = cells.slice(0, cols * ROWS);
  for (let i = 0; i < flat.length; ) {
    let j = i;
    while (j < flat.length && flat[j] === flat[i]) j++;
    out += "abcde"[flat[i]] + (j - i);
    i = j;
  }
  return out;
}

export function decodeCells(s: string): Level[] | null {
  const next = emptyCells();
  let i = 0;
  for (const m of s.matchAll(/([a-e])(\d+)/g)) {
    const level = "abcde".indexOf(m[1]) as Level;
    for (let k = 0; k < Number(m[2]) && i < next.length; k++) next[i++] = level;
  }
  return i > 0 ? next : null;
}

/* -------------------------------------------------------------- script */

export interface ScriptOptions {
  cells: Level[];
  range: CalendarRange;
  intensity: IntensityId;
  repoName: string;
  shareUrl: string;
}

export function commitPlan(cells: Level[], range: CalendarRange, intensity: IntensityId) {
  const counts = INTENSITY_PRESETS[intensity].counts;
  const days: { date: number; commits: number }[] = [];
  for (let col = 0; col < range.cols; col++) {
    for (let row = 0; row < ROWS; row++) {
      const level = cells[idx(col, row)];
      if (level && isValidCell(range, col, row)) {
        days.push({ date: cellDate(range, col, row), commits: counts[level - 1] });
      }
    }
  }
  return days;
}

export function sanitizeRepoName(name: string): string {
  return name.trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "commit-art";
}

export function buildScript({ cells, range, intensity, repoName, shareUrl }: ScriptOptions): string {
  const repo = sanitizeRepoName(repoName);
  const plan = commitPlan(cells, range, intensity);
  const total = plan.reduce((s, d) => s + d.commits, 0);
  // Noon UTC keeps every commit on the intended day; GitHub buckets by UTC.
  const lines = plan.map((d) => `${(d.date + DAY_MS / 2) / 1000} ${d.commits}`).join("\n");

  return `#!/usr/bin/env bash
# Commit Art: paints your GitHub contribution graph.
# Made with https://lucasloepke.github.io/commit-art
# Edit this drawing: ${shareUrl}
#
# Creates a new local repo "${repo}" containing ${total} empty, backdated
# commits (${range.label}), then helps you push it to GitHub.
# Undo any time by deleting the repo on GitHub.
set -euo pipefail

REPO="${repo}"

# ask PROMPT DEFAULT NO_TTY_ANSWER: reads a reply from the terminal.
ask() {
  local a
  if { exec 3</dev/tty; } 2>/dev/null; then
    read -r -p "$1" a <&3 || a=""
    exec 3<&-
    echo "\${a:-$2}"
  else
    echo "$3"
  fi
}

NAME="$(git config user.name || true)"
EMAIL="$(git config user.email || true)"
if [ -z "$NAME" ] || [ -z "$EMAIL" ]; then
  echo "Git doesn't know who you are yet. Run these, then try again:"
  echo '  git config --global user.name "Your Name"'
  echo '  git config --global user.email "you@example.com"'
  exit 1
fi

echo "Commit Art: ${total} commits across ${plan.length} days (${range.label})"
echo "Author: $NAME <$EMAIL>"
echo "This email must be verified on your GitHub account, or the squares won't show up."
case "$(ask "Continue? [Y/n] " y y)" in [nN]*) exit 0 ;; esac

if [ -e "$REPO" ]; then
  echo "A folder named '$REPO' already exists here. Delete or rename it and rerun."
  exit 1
fi
mkdir "$REPO"
cd "$REPO"
git init -q
git symbolic-ref HEAD refs/heads/main

first=1
while read -r ts n; do
  [ -z "$ts" ] && continue
  for ((i = 0; i < n; i++)); do
    t=$((ts + i * 60))
    printf 'commit refs/heads/main\\nauthor %s <%s> %d +0000\\ncommitter %s <%s> %d +0000\\ndata <<EOM\\npixel\\nEOM\\n' \\
      "$NAME" "$EMAIL" "$t" "$NAME" "$EMAIL" "$t"
    if [ "$first" = 1 ]; then
      printf 'M 644 inline README.md\\ndata <<EOM\\n# %s\\n\\nPainted with [Commit Art](https://lucasloepke.github.io/commit-art).\\nEOM\\n' "$REPO"
      first=0
    fi
    printf '\\n'
  done
done <<'PIXELS' | git fast-import --quiet
${lines}
PIXELS
git reset -q --hard main
echo "Created $(git rev-list --count main) commits in ./$REPO"

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  case "$(ask "Create public GitHub repo '$REPO' and push it now with gh? [Y/n] " y n)" in
    [nN]*) ;;
    *)
      gh repo create "$REPO" --public --source=. --remote=origin --push
      echo "Done! Your profile can take a few minutes to update."
      exit 0
      ;;
  esac
fi

cat <<EOF

Last step: push it to GitHub.
  1. Create an EMPTY public repo named '$REPO' at https://github.com/new
     (no README, no license).
  2. Run:
       cd "$REPO"
       git remote add origin https://github.com/YOUR-USERNAME/$REPO.git
       git push -u origin main

Your profile can take a few minutes to update.
EOF
`;
}
