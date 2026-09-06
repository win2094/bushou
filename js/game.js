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
    return this.review();
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
    return this.review();
  }

  slotLabel(slot) {
    return `${slot.dir === "across" ? "橫" : "直"}${slot.num}`;
  }

  slotState(slot) {
    const letters = slot.cells.map((cell) => this.fill[cell.r][cell.c] || "");
    if (letters.some((ch) => !ch)) return { state: "open", wrong: [] };
    const wrong = slot.cells.filter((cell) => this.fill[cell.r][cell.c] !== this.puzzle.solution[cell.r][cell.c]);
    return { state: wrong.length ? "bad" : "ok", wrong };
  }

  review() {
    const reports = this.puzzle.slots.map((slot) => ({ slot, ...this.slotState(slot) }));
    const just = reports.find((item) => item.slot.id === this.slot.id);
    const filled = this.puzzle.solution.every((row, r) => row.every((ch, c) => !ch || this.fill[r][c]));
    const allOk = reports.every((item) => item.state === "ok");

    if (filled && allOk) {
      this.status = "won";
      return { kind: "won", message: `第 ${this.level} 關全對！` };
    }
    if (filled && !allOk) {
      this.status = "playing";
      const bad = reports.filter((item) => item.state === "bad");
      const lines = bad.map((item) => {
        const places = item.wrong.map((cell) => {
          const idx = item.slot.cells.findIndex((pos) => pos.r === cell.r && pos.c === cell.c);
          return `第${idx + 1}格`;
        });
        return `${this.slotLabel(item.slot)}錯咗（${places.join("、")}）`;
      });
      return { kind: "fail", message: `全部填咗但未全對。${lines.join("；")}` };
    }
    if (just.state === "ok") {
      return { kind: "ok", message: `${this.slotLabel(just.slot)}啱晒：${just.slot.word}` };
    }
    if (just.state === "bad") {
      const places = just.wrong.map((cell) => {
        const idx = just.slot.cells.findIndex((pos) => pos.r === cell.r && pos.c === cell.c);
        return `第${idx + 1}格「${this.fill[cell.r][cell.c]}」`;
      });
      return { kind: "miss", message: `${this.slotLabel(just.slot)}唔啱，${places.join("、")}要改。` };
    }
    const left = this.puzzle.solution.flat().filter(Boolean).length - this.fill.flat().filter(Boolean).length;
    return { kind: "place", message: `仲有 ${left} 格。跟住填${this.slotLabel(this.slot)}。` };
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
      clueText: `${this.slotLabel(slot)}　${slot.clue}`,
      marks: this.puzzle.slots.map((item) => ({ slot: item, ...this.slotState(item) })),
      progress: {
        filled: this.fill.flat().filter(Boolean).length,
        total: this.puzzle.solution.flat().filter(Boolean).length,
        correctWords: this.puzzle.slots.filter((item) => this.slotState(item).state === "ok").length,
        totalWords: this.puzzle.slots.length,
      },
    };
  }
}
