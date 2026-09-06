import { GameEngine, pickDailyPuzzle, pickRandomPuzzle } from "./game.js";
import { GameView } from "./ui.js";

const els = {
  colBanks: document.querySelector("#col-banks"),
  board: document.querySelector("#board"),
  tray: document.querySelector("#tray"),
  meta: document.querySelector("#meta"),
  tip: document.querySelector("#tip"),
  modal: document.querySelector("#modal"),
};

let engine = new GameEngine(pickDailyPuzzle());
const view = new GameView(els, {
  onSelect: (r, c) => {
    engine.select(r, c);
    view.render(engine.snapshot());
  },
  onPlace: (ch) => {
    engine.place(ch);
    view.render(engine.snapshot());
    if (engine.status === "won") {
      view.showModal("全部接通", "每一行、每一列都係詞語。", "成");
    }
  },
  onClear: () => {
    engine.clearSelected();
    view.render(engine.snapshot());
  },
});

document.querySelector("#new-game").addEventListener("click", () => {
  view.hideModal();
  engine = new GameEngine(pickRandomPuzzle());
  view.render(engine.snapshot());
});
document.querySelector("#hint").addEventListener("click", () => {
  engine.hint();
  view.render(engine.snapshot());
});
document.querySelector("#how-to").addEventListener("click", () => {
  view.showModal(
    "點玩",
    "好似 Knotwords：每行每列外面嗰排字，全部都要放進嗰行／列。交點要同時啱橫同直。撳一格，再撳下面可用嘅字。",
    "字",
  );
});
document.querySelector("#play-again").addEventListener("click", () => {
  const title = document.querySelector("[data-modal-title]").textContent;
  if (title === "點玩") {
    view.hideModal();
    return;
  }
  view.hideModal();
  engine = new GameEngine(pickRandomPuzzle());
  view.render(engine.snapshot());
});

view.render(engine.snapshot());
