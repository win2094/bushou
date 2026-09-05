import { GameEngine, pickDailyPuzzle, pickRandomPuzzle } from "./game.js";
import { GameView } from "./ui.js";

const els = {
  grid: document.querySelector("#grid"),
  keyboard: document.querySelector("#keyboard"),
  toast: document.querySelector("#toast"),
  modal: document.querySelector("#modal"),
  title: document.querySelector("#title"),
  hint: document.querySelector("#hint"),
  goal: document.querySelector("#goal"),
  submit: document.querySelector("#submit-top"),
};

let engine = new GameEngine(pickDailyPuzzle());
const view = new GameView(els, {
  onPart: (part) => {
    if (!engine.addPart(part)) {
      view.showToast(`呢題淨係要 ${engine.answer.length} 個部件，撳「送出」`);
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
document.querySelector("#play-again").addEventListener("click", () => {
  if (view.modalMode === "help") {
    view.hideModal();
    return;
  }
  startRandomGame();
});
document.querySelector("#how-to").addEventListener("click", () => {
  view.showModal({
    title: "點玩",
    reveal: "林",
    body: "唔係估兩個字，係估 1 個漢字點拆。例如木 + 木 = 林。由左到右揀啱嘅部件，撳送出。你有 5 次機會。",
    action: "明白",
    mode: "help",
  });
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
      title: "砌中喇",
      body: `${engine.puzzle.parts.join(" + ")} = ${engine.puzzle.char}。${engine.puzzle.hint}`,
      reveal: engine.puzzle.char,
      action: "再玩一題",
      mode: "result",
    });
  } else if (result.status === "lost") {
    view.showModal({
      title: "答案係呢個字",
      body: `${engine.puzzle.parts.join(" + ")} = ${engine.puzzle.char}`,
      reveal: engine.puzzle.char,
      action: "再玩一題",
      mode: "result",
    });
  }
}

function startRandomGame() {
  view.hideModal();
  engine = new GameEngine(pickRandomPuzzle());
  view.render(engine.snapshot());
}

view.render(engine.snapshot());
