const sounds = {
  win: new Audio("./audio/win.wav"),
  miss: new Audio("./audio/miss.wav"),
};

Object.values(sounds).forEach((audio) => {
  audio.preload = "auto";
});

export function playSfx(name) {
  const src = sounds[name];
  if (!src) return;
  const clip = src.cloneNode();
  clip.volume = name === "win" ? 0.9 : 0.75;
  clip.play().catch(() => {});
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
