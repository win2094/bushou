import { GameEngine } from "./game.js";
import { GameView } from "./ui.js";
import { launchFireworks, playSfx, showToast } from "./feedback.js";

const els = {
  clue: document.querySelector("#clue"),
  level: document.querySelector("#level"),
  progress: document.querySelector("#progress"),
  grid: document.querySelector("#grid"),
  bank: document.querySelector("#bank"),
  modal: document.querySelector("#modal"),
  toast: document.querySelector("#toast"),
  fireworks: document.querySelector("#fireworks"),
};

let engine = new GameEngine(1);
let nextTimer = 0;
const view = new GameView(els, {
  onCell: (r, c) => {
    engine.selectCell(r, c);
    view.render(engine.snapshot());
  },
  onChar: (ch) => {
    const result = engine.place(ch);
    view.render(engine.snapshot());
    if (result) handleResult(result);
  },
});

document.querySelector("#clear").addEventListener("click", () => {
  engine.clearAll();
  els.toast.classList.add("hide");
  view.render(engine.snapshot());
  showToast(els.toast, "已清空，重新填過。", "info");
});
document.querySelector("#hint").addEventListener("click", () => {
  const result = engine.hint();
  view.render(engine.snapshot());
  if (result) handleResult(result);
});
document.querySelector("#next").addEventListener("click", nextLevel);
document.querySelector("#play-again").addEventListener("click", () => {
  const title = els.modal.querySelector("[data-modal-title]").textContent;
  if (title === "點玩") {
    view.hideModal();
    return;
  }
  nextLevel();
});
document.querySelector("#how-to").addEventListener("click", () => {
  els.modal.classList.remove("hide");
  els.modal.querySelector("[data-modal-title]").textContent = "點玩";
  els.modal.querySelector("[data-modal-body]").textContent =
    "撳格揀橫詞或直詞，再撳下面字庫。填滿一條會即刻話你知啱定錯；錯格會變紅。全對有煙花同音效，之後自動下一題。";
});

function handleResult(result) {
  if (result.kind === "won") {
    playSfx("win");
    showToast(els.toast, result.message, "win");
    launchFireworks(els.fireworks);
    window.clearTimeout(nextTimer);
    nextTimer = window.setTimeout(nextLevel, 2300);
    return;
  }
  if (result.kind === "miss" || result.kind === "fail") {
    playSfx("miss");
    showToast(els.toast, result.message, "fail");
    els.grid.classList.add("shake");
    window.setTimeout(() => els.grid.classList.remove("shake"), 420);
    return;
  }
  if (result.kind === "ok") {
    showToast(els.toast, result.message, "ok");
    return;
  }
  showToast(els.toast, result.message, "info");
}

function nextLevel() {
  window.clearTimeout(nextTimer);
  view.hideModal();
  els.toast.classList.add("hide");
  els.fireworks.classList.add("hide");
  engine = new GameEngine(engine.level + 1);
  view.render(engine.snapshot());
  showToast(els.toast, `第 ${engine.level} 關，撳提示再填字。`, "info");
}

view.render(engine.snapshot());
showToast(els.toast, "撳格，再撳下面嘅字。填滿一條就會話你知啱唔啱。", "info");
