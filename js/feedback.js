const urls = {
  win: new URL("../audio/win.wav", import.meta.url).href,
  word: new URL("../audio/word.wav", import.meta.url).href,
  miss: new URL("../audio/miss.wav", import.meta.url).href,
};

const players = {};

function getPlayer(name) {
  if (!players[name]) {
    const audio = new Audio(urls[name]);
    audio.preload = "auto";
    players[name] = audio;
  }
  return players[name];
}

export function unlockAudio() {
  Object.keys(urls).forEach((name) => {
    const audio = getPlayer(name);
    audio.muted = true;
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      })
      .catch(() => {
        audio.muted = false;
      });
  });
}

export function playSfx(name) {
  const audio = getPlayer(name);
  audio.muted = false;
  audio.volume = name === "miss" ? 0.8 : 1;
  try {
    audio.currentTime = 0;
  } catch {
    /* ignore */
  }
  const start = audio.play();
  if (start) start.catch(() => {});
}

export function showToast(el, text, kind) {
  el.textContent = text;
  el.className = `toast toast-${kind}`;
  el.classList.remove("hide");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    if (kind !== "fail") el.classList.add("hide");
  }, kind === "win" ? 2200 : 2600);
}

export function launchFireworks(canvas) {
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fit = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  fit();
  canvas.classList.remove("hide");

  if (reduce) {
    window.setTimeout(() => canvas.classList.add("hide"), 800);
    return;
  }

  const bursts = [];
  const colors = ["#ff4d6d", "#ffd166", "#06d6a0", "#4cc9f0", "#f72585", "#fff"];

  function burst(x, y) {
    const count = 42;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2.2 + Math.random() * 3.4;
      bursts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors[i % colors.length],
      });
    }
  }

  burst(canvas.width * 0.3, canvas.height * 0.28);
  burst(canvas.width * 0.7, canvas.height * 0.22);
  window.setTimeout(() => burst(canvas.width * 0.5, canvas.height * 0.18), 220);

  const start = performance.now();
  function frame(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bursts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04;
      p.life -= 0.016;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (now - start < 2200) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.add("hide");
    }
  }
  requestAnimationFrame(frame);
}
