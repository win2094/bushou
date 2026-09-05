import { MAX_GUESSES, PUZZLES, SLOTS_PER_GUESS } from "./data.js";

/** @typedef {"correct" | "present" | "absent" | "empty"} TileState */

/**
 * Pure game engine. No DOM access.
 */
export class GameEngine {
  /**
   * @param {import("./data.js").Puzzle} puzzle
   */
  constructor(puzzle) {
    this.puzzle = puzzle;
    /** @type {string[][]} */
    this.guesses = Array.from({ length: MAX_GUESSES }, () => []);
    /** @type {TileState[][]} */
    this.evaluations = Array.from({ length: MAX_GUESSES }, () =>
      Array(SLOTS_PER_GUESS).fill("empty"),
    );
    this.rowIndex = 0;
    this.status = "playing"; // playing | won | lost
  }

  get currentGuess() {
    return this.guesses[this.rowIndex];
  }

  get answer() {
    return this.puzzle.parts;
  }

  canSubmit() {
    return (
      this.status === "playing" &&
      this.currentGuess.length === this.answer.length
    );
  }

  /**
   * @param {string} part
   * @returns {boolean}
   */
  addPart(part) {
    if (this.status !== "playing") return false;
    if (this.currentGuess.length >= this.answer.length) return false;
    this.currentGuess.push(part);
    return true;
  }

  deletePart() {
    if (this.status !== "playing") return false;
    if (this.currentGuess.length === 0) return false;
    this.currentGuess.pop();
    return true;
  }

  /**
   * @returns {{
   *   submitted: boolean,
   *   evaluation: TileState[],
   *   status: string,
   *   message?: string
   * }}
   */
  submit() {
    if (this.status !== "playing") {
      return { submitted: false, evaluation: [], status: this.status };
    }
    if (this.currentGuess.length === 0) {
      return {
        submitted: false,
        evaluation: [],
        status: this.status,
        message: "請先點選部件",
      };
    }
    if (this.currentGuess.length !== this.answer.length) {
      return {
        submitted: false,
        evaluation: [],
        status: this.status,
        message: `呢題要 ${this.answer.length} 個部件先可以送出`,
      };
    }

    const submittedRow = this.rowIndex;
    const evaluation = evaluateGuess(this.currentGuess, this.answer);
    this.evaluations[submittedRow] = padEvaluation(evaluation);
    const won = evaluation.every((state) => state === "correct");

    if (won) {
      this.status = "won";
    } else if (this.rowIndex >= MAX_GUESSES - 1) {
      this.status = "lost";
    } else {
      this.rowIndex += 1;
    }

    return {
      submitted: true,
      evaluation: this.evaluations[submittedRow],
      status: this.status,
    };
  }

  snapshot() {
    return {
      puzzle: this.puzzle,
      guesses: this.guesses.map((row) => [...row]),
      evaluations: this.evaluations.map((row) => [...row]),
      rowIndex: this.rowIndex,
      status: this.status,
      canSubmit: this.canSubmit(),
    };
  }
}

/**
 * Wordle-style evaluation with duplicate handling.
 * @param {string[]} guess
 * @param {string[]} answer
 * @returns {TileState[]}
 */
export function evaluateGuess(guess, answer) {
  /** @type {TileState[]} */
  const result = Array(guess.length).fill("absent");
  const remaining = {};

  for (let i = 0; i < answer.length; i += 1) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
    } else {
      remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < guess.length; i += 1) {
    if (result[i] === "correct") continue;
    const part = guess[i];
    if (remaining[part] > 0) {
      result[i] = "present";
      remaining[part] -= 1;
    }
  }

  return result;
}

/**
 * @param {TileState[]} evaluation
 * @returns {TileState[]}
 */
function padEvaluation(evaluation) {
  const padded = Array(SLOTS_PER_GUESS).fill("empty");
  evaluation.forEach((state, index) => {
    padded[index] = state;
  });
  return padded;
}

/**
 * Deterministic daily puzzle from local calendar date.
 * @param {Date} [date]
 */
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

/**
 * Highest color for each keyboard key seen so far.
 * @param {string[][]} guesses
 * @param {TileState[][]} evaluations
 * @returns {Record<string, TileState>}
 */
export function keyboardHints(guesses, evaluations) {
  const rank = { empty: 0, absent: 1, present: 2, correct: 3 };
  /** @type {Record<string, TileState>} */
  const hints = {};

  guesses.forEach((row, rowIndex) => {
    row.forEach((part, colIndex) => {
      const state = evaluations[rowIndex][colIndex];
      if (!state || state === "empty") return;
      if (!hints[part] || rank[state] > rank[hints[part]]) {
        hints[part] = state;
      }
    });
  });

  return hints;
}
