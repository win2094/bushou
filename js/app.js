import { GameEngine, pickDailyPuzzle, pickRandomPuzzle } from "./game.js";
import { GameView } from "./ui.js";

const els = {
  grid: document.querySelector("#grid"),
  keyboard: document.querySelector("#keyboard"),
  toast: document.querySelector("#toast"),
  modal: document.querySelector("#modal"),
  title: document.querySelector("#title"),
  hint: document.querySelector("#hint"),
  submit: document.querySelector("#submit-top"),
};

let engine = new GameEngine(pickDailyPuzzle());
const view = new GameView(els, {
  onPart: (part) => {
    if (!engine.addPart(part)) {
      view.showToast("這一列已經滿了");
      return;
    }
    view.render(engine.snapshot());
  },
  onDelete: () => {
    engine.deletePart();
    view.render(engine.snapshot());
  },
  onSubmit: submitGuess,
});

els.submit.addEventListener("click", submitGuess);
document.querySelector("#new-game").addEventListener("click", startRandomGame);
document.querySelector("#play-again").addEventListener("click", startRandomGame);
document.querySelector("#how-to").addEventListener("click", () => {
  view.showToast("依序點選部件，湊齊後按送出");
});

function submitGuess() {
  const result = engine.submit();
  if (!result.submitted) {
    if (result.message) view.showToast(result.message);
    view.render(engine.snapshot());
    return;
  }

  view.render(engine.snapshot());

  if (result.status === "won") {
    view.showModal({
      title: "合成成功",
      body: engine.puzzle.hint,
      reveal: engine.puzzle.char,
    });
  } else if (result.status === "lost") {
    view.showModal({
      title: "再試一題",
      body: `正確拆法：${engine.puzzle.parts.join(" + ")}`,
      reveal: engine.puzzle.char,
    });
  }
}

function startRandomGame() {
  view.hideModal();
  engine = new GameEngine(pickRandomPuzzle());
  view.render(engine.snapshot());
}

view.render(engine.snapshot());
