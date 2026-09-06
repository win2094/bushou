import { GameEngine } from "./game.js";
import { GameView } from "./ui.js";

const els = {
  clue: document.querySelector("#clue"),
  level: document.querySelector("#level"),
  grid: document.querySelector("#grid"),
  bank: document.querySelector("#bank"),
  modal: document.querySelector("#modal"),
};

let engine = new GameEngine(1);
const view = new GameView(els, {
  onCell: (r, c) => {
    engine.selectCell(r, c);
    view.render(engine.snapshot());
  },
  onChar: (ch) => {
    engine.place(ch);
    view.render(engine.snapshot());
    if (engine.status === "won") view.showWin(engine.level);
  },
});

document.querySelector("#clear").addEventListener("click", () => {
  engine.clearAll();
  view.render(engine.snapshot());
});
document.querySelector("#hint").addEventListener("click", () => {
  engine.hint();
  view.render(engine.snapshot());
  if (engine.status === "won") view.showWin(engine.level);
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
    "撳格揀一條橫詞或直詞，再撳下面字庫填入。再撳同一格可以轉橫／直。提示會寫喺上面。詞庫喺 js/lexicon.js，加詞之後會參與隨機出題。";
});

function nextLevel() {
  view.hideModal();
  engine = new GameEngine(engine.level + 1);
  view.render(engine.snapshot());
}

view.render(engine.snapshot());
