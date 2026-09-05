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
export function canonicalRecipe(char) {
  const list = RECIPES.filter((item) => item.char === char);
  return list.slice().sort((a, b) => a.parts.length - b.parts.length)[0] || null;
}

export class GameEngine {
  constructor(puzzle) {
    this.puzzle = puzzle;
    this.goal = canonicalRecipe(puzzle.char);
    this.structure = this.goal?.structure || null;
    /** @type {string[]} */
    this.slots = [];
    /** @type {string[]} */
    this.inventory = [];
    /** @type {{ parts: string[], structure: string, result: string | null }[]} */
    this.history = [];
    this.status = "playing";
    this.lastFeedback = "";
    this.knownParts = startingKnownParts(this.goal, puzzle);
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

    this.lastFeedback = explainAttempt({
      parts: this.slots,
      structure: this.structure,
      result,
      target: this.puzzle.char,
      remaining: MAX_GUESSES - this.history.length,
      knownParts: this.knownParts,
      goal: this.goal,
    });
    this.slots = [];

    return { fused: true, result, status: this.status, feedback: this.lastFeedback };
  }

  useHint() {
    if (this.status !== "playing" || !this.goal) return { ok: false, message: "而家唔使提示" };
    const next = this.goal.parts.find((part) => !this.knownParts.includes(part));
    if (!next) {
      return { ok: false, message: "提示已經全部開咗。跟住示範方法砌。" };
    }
    this.knownParts.push(next);
    return { ok: true, message: `新提示：會用到「${next}」` };
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
      remaining: MAX_GUESSES - this.history.length,
      clues: buildClues(this),
      goalStructure: this.goal?.structure || null,
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

  if (input.goal) {
    text += `\n記住：本題要用「${STRUCTURES[input.goal.structure].label}」，已知 ${input.knownParts.join("、")}。`;
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

function startingKnownParts(goal, puzzle) {
  if (!goal) return [];
  const compound = goal.parts.find((part) => RECIPES.some((item) => item.char === part));
  const primitive = goal.parts.find((part) => part !== compound);
  if (puzzle.depth >= 2 && primitive) return [primitive];
  return [goal.parts[0]];
}

function buildClues(engine) {
  const goal = engine.goal;
  if (!goal) return "未有題目。";
  const label = STRUCTURES[goal.structure].label;
  const mid = goal.parts.find((part) => RECIPES.some((item) => item.char === part));
  const lines = [
    `示範（唔係本題）：左右 木 + 木 = 林。砌出嚟可以再用來合成。`,
    `本題結構：${label}（${STRUCTURES[goal.structure].slots} 格）`,
    `已知部件：${engine.knownParts.join("、")}`,
  ];
  if (engine.puzzle.depth >= 2 && mid) {
    lines.push(`呢題要先砌中間字，唔係一次過估晒。`);
  } else {
    lines.push(`一格已知，估另一格，揀啱結構再撳合成。`);
  }
  return lines.join("\n");
}
