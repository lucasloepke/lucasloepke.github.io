import { ROWS, idx, isValidCell, type CalendarRange, type Level } from "./commitArt";

export interface Sticker {
  id: string;
  label: string;
  /** Rows of shade levels 1-4; "." leaves whatever is underneath. */
  pixels: string[];
}

export const STICKERS: Sticker[] = [
  {
    id: "cat",
    label: "Cat",
    pixels: [
      "..4.....4..",
      ".414...414.",
      ".411444114.",
      "41111131114",
      "41141114114",
      "41111411113",
      "31314141113",
    ],
  },
  {
    id: "invader",
    label: "Space invader",
    pixels: [
      "..4.....4..",
      "...4...4...",
      "..4444444..",
      ".44.444.44.",
      "44444444444",
      "4.4444444.4",
      "4.4.....4.4",
    ],
  },
  {
    id: "ghost",
    label: "Ghost",
    pixels: [
      "..44444..",
      ".4444444.",
      "441444144",
      "441444144",
      "444444444",
      "444444444",
      "4.44.44.4",
    ],
  },
  {
    id: "pacman",
    label: "Pac-Man",
    pixels: [
      "..444..",
      ".44444.",
      "44444..",
      "4444...",
      "44444..",
      ".44444.",
      "..444..",
    ],
  },
  {
    id: "heart",
    label: "Heart",
    pixels: [
      ".44.44.",
      "4444444",
      "4444444",
      ".44444.",
      "..444..",
      "...4...",
    ],
  },
  {
    id: "star",
    label: "Star",
    pixels: [
      "...4...",
      "...4...",
      "4444444",
      ".44444.",
      "..444..",
      ".44.44.",
      ".4...4.",
    ],
  },
  {
    id: "smiley",
    label: "Smiley",
    pixels: [
      "..444..",
      ".41114.",
      "4141414",
      "4111114",
      "4311134",
      ".43334.",
      "..444..",
    ],
  },
  {
    id: "coffee",
    label: "Coffee",
    pixels: [
      "..4.4...",
      ".4.4....",
      "444444..",
      "41111444",
      "411114.4",
      "41111444",
      ".4444...",
    ],
  },
];

/** Shade by cell index for a sticker centered on (col, row), kept inside the graph. */
export function stickerCells(
  sticker: Sticker,
  range: CalendarRange,
  col: number,
  row: number,
): Map<number, Level> {
  const height = sticker.pixels.length;
  const width = sticker.pixels[0].length;
  const left = Math.max(0, Math.min(col - Math.floor(width / 2), range.cols - width));
  const top = Math.max(0, Math.min(row - Math.floor(height / 2), ROWS - height));

  const placed = new Map<number, Level>();
  sticker.pixels.forEach((line, y) => {
    [...line].forEach((px, x) => {
      if (px !== "." && isValidCell(range, left + x, top + y)) {
        placed.set(idx(left + x, top + y), Number(px) as Level);
      }
    });
  });
  return placed;
}
