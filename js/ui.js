import { KEYBOARD_ROWS, MAX_GUESSES, STRUCTURES } from "./data.js";

const KEY_COLORS = {
  unused: "bg-stone-200 text-stone-900 active:bg-stone-300",
  inventory: "bg-emerald-100 text-emerald-900 border border-emerald-400",
};

export class GameView {
  constructor(els, handlers) {
    this.els = els;
    this.handlers = handlers;
    this.modalMode = "result";
    this.buildStructures();
    this.buildKeyboard();
  }

  buildStructures() {
    this.els.structures.replaceChildren();
    Object.values(STRUCTURES).forEach((info) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.structure = info.id;
      btn.textContent = info.label;
      btn.className = structureClass(false, false);
      btn.addEventListener("click", () => this.handlers.onStructure(info.id));
      this.els.structures.appendChild(btn);
    });
  }

  buildKeyboard() {
    const root = this.els.keyboard;
    root.replaceChildren();
    KEYBOARD_ROWS.forEach((row) => {
      const wrap = document.createElement("div");
      wrap.className = "grid grid-cols-6 gap-1.5 w-full";
      row.forEach((part) => wrap.appendChild(this.makeKey(part, "unused")));
      root.appendChild(wrap);
    });

    const inventory = document.createElement("div");
    inventory.id = "inventory-keys";
    inventory.className = "flex flex-wrap gap-1.5 w-full min-h-8";
    root.appendChild(inventory);

    const actions = document.createElement("div");
    actions.className = "flex gap-2 w-full";
    actions.append(
      this.makeAction("刪除", "delete", "bg-stone-700 text-white"),
      this.makeAction("合成", "fuse", "bg-emerald-700 text-white flex-1"),
    );
    root.appendChild(actions);
  }

  makeKey(part, kind) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.part = part;
    btn.textContent = part;
    btn.className = keyClass(kind);
    btn.addEventListener("click", () => this.handlers.onPart(part));
    return btn;
  }

  makeAction(label, action, color) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.action = action;
    btn.textContent = label;
    btn.className = `min-h-12 px-5 rounded-xl text-lg font-semibold ${color} active:scale-[0.98]`;
    btn.addEventListener("click", () => {
      if (action === "delete") this.handlers.onDelete();
      if (action === "fuse") this.handlers.onFuse();
    });
    return btn;
  }

  render(state) {
    this.renderStructures(state);
    this.renderBench(state);
    this.renderHistory(state);
    this.renderInventory(state);
    this.els.hint.textContent = `砌 1 個漢字 · 剩 ${state.remaining} 次合成`;
    this.els.riddle.textContent = state.puzzle.hint;
    this.els.clues.textContent = state.clues;
    this.els.feedback.textContent = state.feedback || "跟住上面提示砌。示範：木 + 木，左右，合成「林」。";
    const fuseBtn = this.els.keyboard.querySelector('[data-action="fuse"]');
    if (fuseBtn) {
      fuseBtn.disabled = !state.canFuse;
      fuseBtn.classList.toggle("opacity-40", !state.canFuse);
    }
  }

  renderStructures(state) {
    this.els.structures.querySelectorAll("[data-structure]").forEach((btn) => {
      const recommended = btn.dataset.structure === state.goalStructure;
      btn.className = structureClass(btn.dataset.structure === state.structure, recommended);
      btn.textContent = recommended
        ? `${STRUCTURES[btn.dataset.structure].label}·本題`
        : STRUCTURES[btn.dataset.structure].label;
    });
  }

  renderBench(state) {
    const limit = state.structure ? STRUCTURES[state.structure].slots : 2;
    this.els.bench.replaceChildren();
    for (let i = 0; i < limit; i += 1) {
      const cell = document.createElement("div");
      const filled = state.slots[i] || "";
      cell.textContent = filled || "＋";
      cell.className = [
        "min-h-16 min-w-16 flex-1 rounded-2xl border-2 flex items-center justify-center text-3xl font-semibold",
        filled ? "border-stone-800 bg-white" : "border-dashed border-stone-300 text-stone-300",
      ].join(" ");
      this.els.bench.appendChild(cell);
      if (i < limit - 1) {
        const plus = document.createElement("span");
        plus.textContent = "+";
        plus.className = "text-2xl text-stone-400 font-semibold";
        this.els.bench.appendChild(plus);
      }
    }
  }

  renderHistory(state) {
    this.els.history.replaceChildren();
    for (let i = 0; i < MAX_GUESSES; i += 1) {
      const item = state.history[i];
      const row = document.createElement("div");
      row.className =
        "min-h-12 rounded-xl border border-stone-200 bg-white px-3 flex items-center justify-between gap-2 text-base";
      if (!item) {
        row.innerHTML = `<span class="text-stone-300">第 ${i + 1} 次</span><span class="text-stone-300">—</span>`;
      } else if (item.result) {
        row.innerHTML = `<span>${STRUCTURES[item.structure].label} ${item.parts.join("+")}</span><span class="text-2xl font-bold">${item.result}</span>`;
      } else {
        row.innerHTML = `<span>${STRUCTURES[item.structure].label} ${item.parts.join("+")}</span><span class="text-stone-400">砌唔成</span>`;
      }
      this.els.history.appendChild(row);
    }
  }

  renderInventory(state) {
    const box = this.els.keyboard.querySelector("#inventory-keys");
    if (!box) return;
    box.replaceChildren();
    if (!state.inventory.length) {
      const empty = document.createElement("p");
      empty.className = "text-sm text-stone-500";
      empty.textContent = "已發現嘅中間字會出現喺呢度，可以再撳去合成。";
      box.appendChild(empty);
      return;
    }
    state.inventory.forEach((part) => box.appendChild(this.makeKey(part, "inventory")));
  }

  showToast(message) {
    const toast = this.els.toast;
    toast.textContent = message;
    toast.classList.remove("opacity-0", "pointer-events-none");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      toast.classList.add("opacity-0", "pointer-events-none");
    }, 1600);
  }

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

function structureClass(active, recommended) {
  return [
    "min-h-12 flex-1 rounded-xl text-lg font-semibold border-2",
    active
      ? "bg-emerald-700 text-white border-emerald-700"
      : recommended
        ? "bg-emerald-50 text-emerald-900 border-emerald-400"
        : "bg-white text-stone-800 border-stone-200",
  ].join(" ");
}

function keyClass(kind) {
  return [
    "min-h-12 min-w-12 px-3 rounded-xl text-xl font-medium select-none",
    "active:scale-[0.97] touch-manipulation",
    KEY_COLORS[kind] || KEY_COLORS.unused,
  ].join(" ");
}
