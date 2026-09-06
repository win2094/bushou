import { PUZZLES } from "./data.js";

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function subtractOnce(bank, used) {
  const leftover = [...bank];
  used.forEach((ch) => {
    const index = leftover.indexOf(ch);
    if (index >= 0) leftover.splice(index, 1);
  });
  return leftover;
}

export class GameEngine {
  constructor(puzzle) {
    this.puzzle = puzzle;
    this.size = puzzle.solution.length;
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(""));
    this.rowBanks = puzzle.solution.map((row) => shuffle(row));
    this.colBanks = Array.from({ length: this.size }, (_, c) =>
      shuffle(puzzle.solution.map((row) => row[c])),
    );
    this.selected = { r: 0, c: 0 };
    this.status = "playing";
  }

  rowUsed(r) {
    return this.grid[r].filter(Boolean);
  }

  colUsed(c) {
    return this.grid.map((row) => row[c]).filter(Boolean);
  }

  remainingRow(r) {
    return subtractOnce(this.puzzle.solution[r], this.rowUsed(r));
  }

  remainingCol(c) {
    return subtractOnce(
      this.puzzle.solution.map((row) => row[c]),
      this.colUsed(c),
    );
  }

  optionsAt(r, c) {
    if (this.grid[r][c]) return [this.grid[r][c]];
    const rowLeft = this.remainingRow(r);
    const colLeft = this.remainingCol(c);
    const colSet = new Map();
    colLeft.forEach((ch) => colSet.set(ch, (colSet.get(ch) || 0) + 1));
    const opts = [];
    const seen = new Map();
    rowLeft.forEach((ch) => {
      const have = colSet.get(ch) || 0;
      const used = seen.get(ch) || 0;
      if (have > used) {
        opts.push(ch);
        seen.set(ch, used + 1);
      }
    });
    return [...new Set(opts)];
  }

  select(r, c) {
    this.selected = { r, c };
  }

  place(ch) {
    if (this.status !== "playing") return false;
    const { r, c } = this.selected;
    if (this.grid[r][c]) this.grid[r][c] = "";
    if (!this.optionsAt(r, c).includes(ch)) return false;
    this.grid[r][c] = ch;
    this.checkWin();
    return true;
  }

  clearSelected() {
    if (this.status !== "playing") return;
    const { r, c } = this.selected;
    this.grid[r][c] = "";
  }

  hint() {
    if (this.status !== "playing") return false;
    for (let r = 0; r < this.size; r += 1) {
      for (let c = 0; c < this.size; c += 1) {
        if (!this.grid[r][c]) {
          this.grid[r][c] = this.puzzle.solution[r][c];
          this.selected = { r, c };
          this.checkWin();
          return true;
        }
      }
    }
    return false;
  }

  checkWin() {
    const done = this.grid.every((row, r) =>
      row.every((ch, c) => ch === this.puzzle.solution[r][c]),
    );
    if (done) this.status = "won";
  }

  snapshot() {
    const { r, c } = this.selected;
    return {
      puzzle: this.puzzle,
      size: this.size,
      grid: this.grid.map((row) => [...row]),
      rowBanks: this.rowBanks.map((row) => [...row]),
      colBanks: this.colBanks.map((col) => [...col]),
      rowUsed: Array.from({ length: this.size }, (_, i) => this.rowUsed(i)),
      colUsed: Array.from({ length: this.size }, (_, i) => this.colUsed(i)),
      selected: { ...this.selected },
      options: this.optionsAt(r, c),
      status: this.status,
    };
  }
}

export function pickDailyPuzzle(date = new Date()) {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % 2147483647;
  }
  return PUZZLES[hash % PUZZLES.length];
}

export function pickRandomPuzzle() {
  return PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
}
