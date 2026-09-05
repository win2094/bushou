import { GameEngine, pickDailyPuzzle, pickRandomPuzzle } from "./game.js";
import { GameView } from "./ui.js";
import { RECIPES, STRUCTURES } from "./data.js";

const els = {
  structures: document.querySelector("#structures"),
  bench: document.querySelector("#bench"),
  history: document.querySelector("#history"),
  keyboard: document.querySelector("#keyboard"),
  toast: document.querySelector("#toast"),
  modal: document.querySelector("#modal"),
  hint: document.querySelector("#hint"),
  riddle: document.querySelector("#riddle"),
  clues: document.querySelector("#clues"),
  feedback: document.querySelector("#feedback"),
};

let engine = new GameEngine(pickDailyPuzzle());
const view = new GameView(els, {
  onStructure: (id) => {
    engine.selectStructure(id);
    view.render(engine.snapshot());
  },
  onPart: (part) => {
    if (!engine.structure) {
      view.showToast("先揀左右、上下或者品字");
      return;
    }
    if (!engine.addPart(part)) {
      view.showToast("槽滿咗，可以撳合成或者刪除");
      return;
    }
    view.render(engine.snapshot());
  },
  onDelete: () => {
    engine.deletePart();
    view.render(engine.snapshot());
  },
  onFuse: fuse,
});

document.querySelector("#more-hint").addEventListener("click", () => {
  const result = engine.useHint();
  view.showToast(result.message);
  view.render(engine.snapshot());
});
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
    reveal: "林→淋",
    body: "綠色提示一開局就話你知結構同至少一個部件。跟示範：揀左右，撳木，再撳木，撳合成，出林。林會留低再攞去砌本題。唔識就撳再要一個提示。",
    action: "明白",
    mode: "help",
  });
});

function fuse() {
  const result = engine.fuse();
  if (!result.fused) {
    view.showToast(result.message);
    view.render(engine.snapshot());
    return;
  }
  view.render(engine.snapshot());
  if (result.status === "won") {
    const recipe = RECIPES.find((item) => item.char === engine.puzzle.char);
    view.showModal({
      title: "砌中喇",
      reveal: engine.puzzle.char,
      body: `${STRUCTURES[recipe.structure].label} ${recipe.parts.join(" + ")} = ${engine.puzzle.char}`,
      action: "再玩一題",
      mode: "result",
    });
  } else if (result.status === "lost") {
    const recipe = RECIPES.find((item) => item.char === engine.puzzle.char);
    view.showModal({
      title: "答案係呢個字",
      reveal: engine.puzzle.char,
      body: `其中一條路：${STRUCTURES[recipe.structure].label} ${recipe.parts.join(" + ")}`,
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
