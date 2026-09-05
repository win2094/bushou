import { KEYBOARD_ROWS, MAX_GUESSES, SLOTS_PER_GUESS } from "./data.js";
import { keyboardHints } from "./game.js";

const TILE_COLORS = {
  unused: "bg-stone-100 border-stone-200 text-transparent",
  empty: "bg-white border-stone-300 text-stone-800",
  filled: "bg-white border-stone-800 text-stone-900",
  correct: "bg-emerald-600 border-emerald-600 text-white",
  present: "bg-amber-400 border-amber-400 text-stone-900",
  absent: "bg-stone-400 border-stone-400 text-white",
};

const KEY_COLORS = {
  unused: "bg-stone-200 text-stone-900 active:bg-stone-300",
  correct: "bg-emerald-600 text-white",
  present: "bg-amber-400 text-stone-900",
  absent: "bg-stone-400 text-white",
};

export class GameView {
  /**
   * @param {{
   *   grid: HTMLElement,
   *   keyboard: HTMLElement,
   *   toast: HTMLElement,
   *   modal: HTMLElement,
   *   title: HTMLElement,
   *   hint: HTMLElement,
   *   goal: HTMLElement,
   *   submit: HTMLButtonElement,
   * }} els
   * @param {{
   *   onPart: (part: string) => void,
   *   onDelete: () => void,
   *   onSubmit: () => void,
   * }} handlers
   */
  constructor(els, handlers) {
    this.els = els;
    this.handlers = handlers;
    this.modalMode = "result";
    this.buildGrid();
    this.buildKeyboard();
  }

  buildGrid() {
    this.els.grid.replaceChildren();
    this.els.grid.style.gridTemplateColumns = `repeat(${SLOTS_PER_GUESS}, minmax(0, 1fr))`;

    for (let r = 0; r < MAX_GUESSES; r += 1) {
      for (let c = 0; c < SLOTS_PER_GUESS; c += 1) {
        const tile = document.createElement("div");
        tile.dataset.row = String(r);
        tile.dataset.col = String(c);
        tile.className = tileClass("empty");
        this.els.grid.appendChild(tile);
      }
    }
  }

  buildKeyboard() {
    const root = this.els.keyboard;
    root.replaceChildren();

    KEYBOARD_ROWS.forEach((row) => {
      root.appendChild(this.makeKeyRow(row));
    });

    const actions = document.createElement("div");
    actions.className = "flex gap-2 w-full";
    actions.append(
      this.makeActionKey("刪除", "delete", "bg-stone-700 text-white"),
      this.makeActionKey("送出", "submit", "bg-emerald-700 text-white flex-1"),
    );
    root.appendChild(actions);
  }

  /**
   * @param {string[]} parts
   */
  makeKeyRow(parts) {
    const row = document.createElement("div");
    row.className = "grid grid-cols-6 gap-1.5 w-full";
    parts.forEach((part) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.part = part;
      btn.textContent = part;
      btn.className = keyClass("unused");
      btn.addEventListener("click", () => this.handlers.onPart(part));
      row.appendChild(btn);
    });
    return row;
  }

  /**
   * @param {string} label
   * @param {string} action
   * @param {string} color
   */
  makeActionKey(label, action, color) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.action = action;
    btn.textContent = label;
    btn.className = `min-h-12 px-5 rounded-xl text-lg font-semibold tracking-wide ${color} active:scale-[0.98]`;
    btn.addEventListener("click", () => {
      if (action === "delete") this.handlers.onDelete();
      if (action === "submit") this.handlers.onSubmit();
    });
    return btn;
  }

  /**
   * @param {ReturnType<import("./game.js").GameEngine["snapshot"]>} state
   */
  render(state) {
    this.renderGrid(state);
    this.renderKeyboard(state);
    const n = state.puzzle.parts.length;
    this.els.hint.textContent = `砌 1 個漢字 · 用 ${n} 個部件`;
    this.els.goal.textContent = `？ = ${Array.from({ length: n }, () => "□").join(" + ")}`;
    this.els.submit.disabled = !state.canSubmit;
    this.els.submit.classList.toggle("opacity-40", !state.canSubmit);
  }

  /**
   * @param {ReturnType<import("./game.js").GameEngine["snapshot"]>} state
   */
  renderGrid(state) {
    for (let r = 0; r < MAX_GUESSES; r += 1) {
      for (let c = 0; c < SLOTS_PER_GUESS; c += 1) {
        const tile = this.els.grid.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        const needed = state.puzzle.parts.length;
        const unused = c >= needed;
        const letter = unused ? "" : state.guesses[r][c] || "";
        const evalState = unused ? "unused" : state.evaluations[r][c];
        const isCurrent = !unused && r === state.rowIndex && state.status === "playing";
        const visual = unused ? "unused" : evalState !== "empty" ? evalState : letter ? "filled" : "empty";
        tile.textContent = letter;
        tile.className = tileClass(visual);
        tile.classList.toggle("ring-2", isCurrent && c === state.guesses[r].length);
        tile.classList.toggle("ring-emerald-500", isCurrent && c === state.guesses[r].length);
      }
    }
  }

  /**
   * @param {ReturnType<import("./game.js").GameEngine["snapshot"]>} state
   */
  renderKeyboard(state) {
    const hints = keyboardHints(state.guesses, state.evaluations);
    this.els.keyboard.querySelectorAll("[data-part]").forEach((btn) => {
      const part = btn.dataset.part;
      const hint = hints[part] || "unused";
      btn.className = keyClass(hint);
    });
  }

  /**
   * @param {string} message
   */
  showToast(message) {
    const toast = this.els.toast;
    toast.textContent = message;
    toast.classList.remove("opacity-0", "pointer-events-none");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      toast.classList.add("opacity-0", "pointer-events-none");
    }, 1600);
  }

  /**
   * @param {{ title: string, body: string, reveal: string, action?: string, mode?: string }} content
   */
  showModal(content) {
    this.modalMode = content.mode || "result";
    this.els.modal.querySelector("[data-modal-title]").textContent = content.title;
    this.els.modal.querySelector("[data-modal-body]").textContent = content.body;
    this.els.modal.querySelector("[data-modal-reveal]").textContent = content.reveal;
    this.els.modal.querySelector("#play-again").textContent = content.action || "再玩一題";
    this.els.modal.classList.remove("hidden");
  }

  hideModal() {
    this.els.modal.classList.add("hidden");
  }
}

function tileClass(state) {
  return [
    "aspect-square min-w-0 w-full rounded-lg border-2 flex items-center justify-center",
    "text-2xl font-semibold select-none",
    TILE_COLORS[state] || TILE_COLORS.empty,
  ].join(" ");
}

function keyClass(state) {
  return [
    "min-h-12 rounded-xl text-xl font-medium select-none",
    "active:scale-[0.97] touch-manipulation",
    KEY_COLORS[state] || KEY_COLORS.unused,
  ].join(" ");
}
