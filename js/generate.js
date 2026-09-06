import { LEXICON } from "./lexicon.js";

const EMPTY = "";

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function emptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(EMPTY));
}

function inBounds(size, r, c) {
  return r >= 0 && c >= 0 && r < size && c < size;
}

function letterAt(grid, r, c) {
  if (!inBounds(grid.length, r, c)) return EMPTY;
  return grid[r][c];
}

function canPlace(grid, word, r, c, dir) {
  const size = grid.length;
  const dr = dir === "down" ? 1 : 0;
  const dc = dir === "across" ? 1 : 0;
  const before = { r: r - dr, c: c - dc };
  const after = { r: r + dr * word.length, c: c + dc * word.length };
  if (letterAt(grid, before.r, before.c)) return false;
  if (letterAt(grid, after.r, after.c)) return false;

  let crosses = 0;
  for (let i = 0; i < word.length; i += 1) {
    const rr = r + dr * i;
    const cc = c + dc * i;
    if (!inBounds(size, rr, cc)) return false;
    const here = grid[rr][cc];
    const ch = word[i];
    if (here && here !== ch) return false;
    if (here === ch) {
      crosses += 1;
    } else {
      const sideA = dir === "across" ? letterAt(grid, rr - 1, cc) : letterAt(grid, rr, cc - 1);
      const sideB = dir === "across" ? letterAt(grid, rr + 1, cc) : letterAt(grid, rr, cc + 1);
      if (sideA || sideB) return false;
    }
  }
  return crosses >= 1 || !grid.some((row) => row.some(Boolean));
}

function place(grid, word, r, c, dir) {
  const dr = dir === "down" ? 1 : 0;
  const dc = dir === "across" ? 1 : 0;
  const cells = [];
  for (let i = 0; i < word.length; i += 1) {
    const rr = r + dr * i;
    const cc = c + dc * i;
    grid[rr][cc] = word[i];
    cells.push({ r: rr, c: cc });
  }
  return cells;
}

function findPlacements(grid, word) {
  const size = grid.length;
  const spots = [];
  const filled = [];
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (grid[r][c]) filled.push({ r, c, ch: grid[r][c] });
    }
  }
  if (!filled.length) {
    const r = Math.floor(size / 3);
    const c = Math.max(0, Math.floor((size - word.length) / 2));
    if (canPlace(grid, word, r, c, "across")) spots.push({ r, c, dir: "across" });
    return spots;
  }
  for (let i = 0; i < word.length; i += 1) {
    const ch = word[i];
    filled
      .filter((cell) => cell.ch === ch)
      .forEach((cell) => {
        const across = { r: cell.r, c: cell.c - i, dir: "across" };
        const down = { r: cell.r - i, c: cell.c, dir: "down" };
        if (canPlace(grid, word, across.r, across.c, "across")) spots.push(across);
        if (canPlace(grid, word, down.r, down.c, "down")) spots.push(down);
      });
  }
  return spots;
}

function buildSlots(grid, placed) {
  const starts = new Map();
  let num = 1;
  const slots = placed.map((item) => {
    const key = `${item.cells[0].r},${item.cells[0].c}`;
    if (!starts.has(key)) {
      starts.set(key, num);
      num += 1;
    }
    return {
      id: `${item.dir}-${item.cells[0].r}-${item.cells[0].c}`,
      num: starts.get(key),
      dir: item.dir,
      word: item.word,
      clue: item.clue,
      cells: item.cells,
    };
  });
  slots.sort((a, b) => a.num - b.num || (a.dir === "across" ? -1 : 1));
  return slots;
}

function trimPuzzle(grid, slots) {
  let minR = grid.length;
  let minC = grid.length;
  let maxR = 0;
  let maxC = 0;
  grid.forEach((row, r) => {
    row.forEach((ch, c) => {
      if (ch) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    });
  });
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const next = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => grid[r + minR][c + minC] || EMPTY),
  );
  const shifted = slots.map((slot) => ({
    ...slot,
    cells: slot.cells.map((cell) => ({ r: cell.r - minR, c: cell.c - minC })),
  }));
  return { grid: next, slots: shifted };
}

function attempt(lexicon, rand, size) {
  const grid = emptyGrid(size);
  const words = shuffle(lexicon, rand).filter((item) => item.word.length >= 2 && item.word.length <= 5);
  const placed = [];
  words.forEach((entry) => {
    const spots = shuffle(findPlacements(grid, entry.word), rand);
    if (!spots.length) return;
    const spot = spots[0];
    const cells = place(grid, entry.word, spot.r, spot.c, spot.dir);
    placed.push({ ...entry, dir: spot.dir, cells });
  });
  return { grid, placed };
}

/**
 * @param {{ seed?: number, size?: number, lexicon?: typeof LEXICON }} [opts]
 */
export function generateCrossword(opts = {}) {
  const seed = opts.seed ?? Date.now();
  const size = opts.size ?? 9;
  const lexicon = opts.lexicon ?? LEXICON;
  const rand = mulberry32(seed);
  let best = null;
  for (let i = 0; i < 28; i += 1) {
    const result = attempt(lexicon, rand, size);
    if (result.placed.length < 4) continue;
    if (!best || result.placed.length > best.placed.length) best = result;
  }
  if (!best) best = attempt(lexicon, rand, size);
  const slots = buildSlots(best.grid, best.placed);
  const trimmed = trimPuzzle(best.grid, slots);
  const letters = trimmed.grid.flat().filter(Boolean);
  return {
    seed,
    rows: trimmed.grid.length,
    cols: trimmed.grid[0].length,
    solution: trimmed.grid,
    slots: trimmed.slots,
    bank: shuffle(letters, rand),
  };
}
