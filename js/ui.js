export class GameView {
  constructor(els, handlers) {
    this.els = els;
    this.handlers = handlers;
  }

  render(state) {
    this.renderColBanks(state);
    this.renderBoard(state);
    this.renderTray(state);
    this.els.meta.textContent = `${state.puzzle.title} · ${state.size}×${state.size}`;
    if (state.status === "won") {
      this.els.tip.textContent = "全部詞語都通咗。";
    } else {
      this.els.tip.textContent = "撳一格，再撳下面可用嘅字。橫直都要砌成詞。";
    }
  }

  renderColBanks(state) {
    const box = this.els.colBanks;
    box.style.gridTemplateColumns = `3.2rem repeat(${state.size}, minmax(0, 1fr))`;
    box.replaceChildren();
    box.appendChild(corner());
    for (let c = 0; c < state.size; c += 1) {
      box.appendChild(bankStack(state.colBanks[c], state.colUsed[c]));
    }
  }

  renderBoard(state) {
    const box = this.els.board;
    box.replaceChildren();
    for (let r = 0; r < state.size; r += 1) {
      const row = document.createElement("div");
      row.className = "board-row";
      row.style.gridTemplateColumns = `3.2rem repeat(${state.size}, minmax(0, 1fr))`;

      row.appendChild(bankStack(state.rowBanks[r], state.rowUsed[r]));
      for (let c = 0; c < state.size; c += 1) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = state.grid[r][c];
        const on = state.selected.r === r && state.selected.c === c;
        btn.className = `cell ${on ? "cell-on" : ""} ${state.grid[r][c] ? "cell-fill" : ""}`;
        btn.addEventListener("click", () => this.handlers.onSelect(r, c));
        row.appendChild(btn);
      }
      box.appendChild(row);
    }
  }

  renderTray(state) {
    const tray = this.els.tray;
    tray.replaceChildren();
    if (state.status === "won") {
      const done = document.createElement("p");
      done.className = "tray-msg";
      done.textContent = "完成";
      tray.appendChild(done);
      return;
    }
    if (!state.options.length) {
      const msg = document.createElement("p");
      msg.className = "tray-msg";
      msg.textContent = "呢格暫時冇得放，試下清其他格。";
      tray.appendChild(msg);
    } else {
      state.options.forEach((ch) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tile";
        btn.textContent = ch;
        btn.addEventListener("click", () => this.handlers.onPlace(ch));
        tray.appendChild(btn);
      });
    }
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "tile tile-clear";
    clear.textContent = "清格";
    clear.addEventListener("click", () => this.handlers.onClear());
    tray.appendChild(clear);
  }

  showModal(title, body, reveal) {
    this.els.modal.classList.remove("hide");
    this.els.modal.querySelector("[data-modal-title]").textContent = title;
    this.els.modal.querySelector("[data-modal-body]").textContent = body;
    this.els.modal.querySelector("[data-modal-reveal]").textContent = reveal;
  }

  hideModal() {
    this.els.modal.classList.add("hide");
  }
}

function corner() {
  const el = document.createElement("div");
  return el;
}

function bankStack(bank, used) {
  const wrap = document.createElement("div");
  wrap.className = "bank";
  const leftover = [...used];
  bank.forEach((ch) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    const idx = leftover.indexOf(ch);
    if (idx >= 0) {
      leftover.splice(idx, 1);
      chip.classList.add("chip-used");
    }
    chip.textContent = ch;
    wrap.appendChild(chip);
  });
  return wrap;
}
