import { generateCrossword } from "./generate.js";

export class GameEngine {
  constructor(level = 1) {
    this.level = level;
    this.puzzle = generateCrossword({ seed: 20260906 + level * 97, size: 9 });
    this.fill = this.puzzle.solution.map((row) => row.map((ch) => (ch ? "" : null)));
    this.bank = [...this.puzzle.bank];
    this.slotIndex = 0;
    this.cursor = 0;
    this.status = "playing";
    this.advanceToEmpty();
  }

  get slot() {
    return this.puzzle.slots[this.slotIndex];
  }

  cellValue(r, c) {
    return this.fill[r][c];
  }

  isBlock(r, c) {
    return this.puzzle.solution[r][c] === "";
  }

  selectCell(r, c) {
    if (this.isBlock(r, c)) return;
    const here = this.puzzle.slots.filter((slot) => slot.cells.some((cell) => cell.r === r && cell.c === c));
    if (!here.length) return;
    const same = here.find((slot) => slot.id === this.slot.id);
    const next = same && here.length > 1 ? here.find((slot) => slot.id !== this.slot.id) : here[0];
    this.slotIndex = this.puzzle.slots.indexOf(next);
    this.cursor = next.cells.findIndex((cell) => cell.r === r && cell.c === c);
  }

  place(ch) {
    if (this.status !== "playing") return false;
    const at = this.bank.indexOf(ch);
    if (at < 0) return false;
    const cell = this.slot.cells[this.cursor];
    const old = this.fill[cell.r][cell.c];
    if (old) this.bank.push(old);
    this.bank.splice(at, 1);
    this.fill[cell.r][cell.c] = ch;
    this.advanceToEmpty();
    this.checkWin();
    return true;
  }

  advanceToEmpty() {
    const cells = this.slot.cells;
    for (let i = 0; i < cells.length; i += 1) {
      const idx = (this.cursor + i) % cells.length;
      const cell = cells[idx];
      if (!this.fill[cell.r][cell.c]) {
        this.cursor = idx;
        return;
      }
    }
  }

  clearSlot() {
    this.slot.cells.forEach((cell) => {
      const ch = this.fill[cell.r][cell.c];
      if (ch) {
        this.bank.push(ch);
        this.fill[cell.r][cell.c] = "";
      }
    });
    this.cursor = 0;
    this.status = "playing";
  }

  clearAll() {
    this.fill.forEach((row, r) => {
      row.forEach((ch, c) => {
        if (ch) {
          this.bank.push(ch);
          this.fill[r][c] = "";
        }
      });
    });
    this.cursor = 0;
    this.status = "playing";
  }

  hint() {
    const cell = this.slot.cells.find((item) => !this.fill[item.r][item.c]) || this.slot.cells[this.cursor];
    const answer = this.puzzle.solution[cell.r][cell.c];
    const old = this.fill[cell.r][cell.c];
    if (old === answer) return;
    if (old) this.bank.push(old);
    const at = this.bank.indexOf(answer);
    if (at >= 0) this.bank.splice(at, 1);
    this.fill[cell.r][cell.c] = answer;
    this.advanceToEmpty();
    this.checkWin();
  }

  checkWin() {
    const done = this.puzzle.solution.every((row, r) =>
      row.every((ch, c) => !ch || this.fill[r][c] === ch),
    );
    if (done) this.status = "won";
  }

  snapshot() {
    const slot = this.slot;
    const cursorCell = slot.cells[this.cursor];
    return {
      level: this.level,
      rows: this.puzzle.rows,
      cols: this.puzzle.cols,
      fill: this.fill.map((row) => [...row]),
      solution: this.puzzle.solution,
      bank: [...this.bank],
      slots: this.puzzle.slots,
      slot,
      cursor: { ...cursorCell },
      status: this.status,
      clueText: `${slot.dir === "across" ? "橫" : "直"}${slot.num}　${slot.clue}`,
    };
  }
}
