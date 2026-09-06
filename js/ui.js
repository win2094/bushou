export class GameView {
  constructor(els, handlers) {
    this.els = els;
    this.handlers = handlers;
  }

  render(state) {
    this.els.clue.textContent = state.clueText;
    this.els.level.textContent = `第 ${state.level} 關`;
    this.els.progress.textContent = `已填 ${state.progress.filled}/${state.progress.total}　啱咗 ${state.progress.correctWords}/${state.progress.totalWords} 條詞`;
    this.renderGrid(state);
    this.renderBank(state);
  }

  renderGrid(state) {
    const box = this.els.grid;
    box.style.gridTemplateColumns = `repeat(${state.cols}, minmax(0, 1fr))`;
    box.replaceChildren();
    const active = new Set(state.slot.cells.map((cell) => `${cell.r},${cell.c}`));
    const wrong = new Set();
    const good = new Set();
    state.marks.forEach((mark) => {
      if (mark.state === "ok") {
        mark.slot.cells.forEach((cell) => good.add(`${cell.r},${cell.c}`));
      }
      if (mark.state === "bad") {
        mark.wrong.forEach((cell) => wrong.add(`${cell.r},${cell.c}`));
      }
    });
    const starts = {};
    state.slots.forEach((slot) => {
      const key = `${slot.cells[0].r},${slot.cells[0].c}`;
      starts[key] = slot.num;
    });

    for (let r = 0; r < state.rows; r += 1) {
      for (let c = 0; c < state.cols; c += 1) {
        const cell = document.createElement("button");
        cell.type = "button";
        const block = !state.solution[r][c];
        const key = `${r},${c}`;
        cell.className = "x-cell";
        if (block) {
          cell.classList.add("x-block");
          cell.disabled = true;
        } else {
          cell.textContent = state.fill[r][c] || "";
          if (active.has(key)) cell.classList.add("x-word");
          if (good.has(key)) cell.classList.add("x-ok");
          if (wrong.has(key)) cell.classList.add("x-bad");
          if (state.cursor.r === r && state.cursor.c === c) cell.classList.add("x-on");
          if (starts[key]) {
            const num = document.createElement("span");
            num.className = "x-num";
            num.textContent = starts[key];
            cell.appendChild(num);
          }
          cell.addEventListener("click", () => this.handlers.onCell(r, c));
        }
        box.appendChild(cell);
      }
    }
  }

  renderBank(state) {
    const box = this.els.bank;
    box.replaceChildren();
    state.bank.forEach((ch) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bank-key";
      btn.textContent = ch;
      btn.addEventListener("click", () => this.handlers.onChar(ch));
      box.appendChild(btn);
    });
  }

  showWin(level) {
    this.els.modal.classList.remove("hide");
    this.els.modal.querySelector("[data-modal-title]").textContent = `第 ${level} 關完成`;
    this.els.modal.querySelector("[data-modal-body]").textContent = "可以再開一題，題目由詞庫隨機生成。";
  }

  hideModal() {
    this.els.modal.classList.add("hide");
  }
}
