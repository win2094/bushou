import { MAX_GUESSES, PUZZLES, RECIPES, STRUCTURES } from "./data.js";

function recipeKey(structure, parts) {
  return `${structure}:${parts.join(",")}`;
}

const RECIPE_MAP = new Map(
  RECIPES.map((recipe) => [recipeKey(recipe.structure, recipe.parts), recipe]),
);

function primitivesOf(token, seen = new Set()) {
  if (seen.has(token)) return [token];
  seen.add(token);
  const recipe = RECIPES.find((item) => item.char === token);
  if (!recipe) return [token];
  return recipe.parts.flatMap((part) => primitivesOf(part, seen));
}

/**
 * @param {import("./data.js").PUZZLES[number]} puzzle
 */
export class GameEngine {
  constructor(puzzle) {
    this.puzzle = puzzle;
    this.structure = null;
    /** @type {string[]} */
    this.slots = [];
    /** @type {string[]} */
    this.inventory = [];
    /** @type {{ parts: string[], structure: string, result: string | null }[]} */
    this.history = [];
    this.status = "playing";
    this.lastFeedback = "";
    this.revealedStructure = false;
    this.revealedPart = "";
  }

  get structureInfo() {
    return this.structure ? STRUCTURES[this.structure] : null;
  }

  get slotLimit() {
    return this.structureInfo?.slots || 0;
  }

  canFuse() {
    return (
      this.status === "playing" &&
      Boolean(this.structure) &&
      this.slots.length === this.slotLimit
    );
  }

  selectStructure(id) {
    if (this.status !== "playing") return false;
    if (!STRUCTURES[id]) return false;
    this.structure = id;
    this.slots = [];
    return true;
  }

  addPart(part) {
    if (this.status !== "playing") return false;
    if (!this.structure) return false;
    if (this.slots.length >= this.slotLimit) return false;
    this.slots.push(part);
    return true;
  }

  deletePart() {
    if (this.status !== "playing") return false;
    if (this.slots.length === 0) return false;
    this.slots.pop();
    return true;
  }

  fuse() {
    if (!this.canFuse()) {
      return {
        fused: false,
        message: this.structure ? "槽位未填滿" : "先揀左右／上下／品字結構",
      };
    }

    const recipe = RECIPE_MAP.get(recipeKey(this.structure, this.slots));
    const result = recipe?.char || null;
    this.history.push({
      parts: [...this.slots],
      structure: this.structure,
      result,
    });

    if (result && !this.inventory.includes(result) && result !== this.puzzle.char) {
      this.inventory.push(result);
    }

    const won = result === this.puzzle.char;
    if (won) {
      this.status = "won";
    } else if (this.history.length >= MAX_GUESSES) {
      this.status = "lost";
    }

    this.unlockHints();
    this.lastFeedback = explainAttempt({
      parts: this.slots,
      structure: this.structure,
      result,
      target: this.puzzle.char,
      remaining: MAX_GUESSES - this.history.length,
      revealedStructure: this.revealedStructure,
      revealedPart: this.revealedPart,
    });
    this.slots = [];

    return { fused: true, result, status: this.status, feedback: this.lastFeedback };
  }

  unlockHints() {
    if (this.history.length >= 1) this.revealedStructure = true;
    if (this.history.length >= 2 && !this.revealedPart) {
      const targetRecipe = RECIPES.find((item) => item.char === this.puzzle.char);
      this.revealedPart = targetRecipe?.parts[0] || "";
    }
  }

  snapshot() {
    return {
      puzzle: this.puzzle,
      structure: this.structure,
      slots: [...this.slots],
      inventory: [...this.inventory],
      history: this.history.map((item) => ({ ...item, parts: [...item.parts] })),
      status: this.status,
      canFuse: this.canFuse(),
      feedback: this.lastFeedback,
      revealedStructure: this.revealedStructure,
      revealedPart: this.revealedPart,
      remaining: MAX_GUESSES - this.history.length,
    };
  }
}

export function explainAttempt(input) {
  const formula = `${STRUCTURES[input.structure].label} ${input.parts.join(" + ")}`;
  if (input.result === input.target) {
    return `砌成「${input.result}」！就係本題。`;
  }

  const guessPrim = new Set(input.parts.flatMap((part) => primitivesOf(part)));
  const targetPrim = new Set(primitivesOf(input.target));
  const shared = [...guessPrim].filter((part) => targetPrim.has(part));

  let text = input.result
    ? `砌成咗「${input.result}」，但唔係本題。`
    : `「${formula}」砌唔成字。結構定部件可能錯咗。`;

  if (shared.length) {
    text += `\n同本題重疊嘅部件：${shared.join("、")}。其餘要換走。`;
  } else {
    text += "\n呢次用嘅部件同本題完全唔重疊，換一批再試。";
  }

  if (input.revealedStructure) {
    const need = RECIPES.find((item) => item.char === input.target);
    if (need) text += `\n提示：本題係「${STRUCTURES[need.structure].label}」結構。`;
  }
  if (input.revealedPart) {
    text += `\n提示：合成途中會用到「${input.revealedPart}」。`;
  }
  text += input.remaining > 0 ? `\n仲有 ${input.remaining} 次合成。` : "\n機會用晒。";
  return text;
}

export function pickDailyPuzzle(date = new Date()) {
  const hard = PUZZLES.filter((item) => item.depth >= 2);
  const pool = hard.length ? hard : PUZZLES;
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % 2147483647;
  }
  return pool[hash % pool.length];
}

export function pickRandomPuzzle() {
  return PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
}
