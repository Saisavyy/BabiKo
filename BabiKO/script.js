const canvas = document.querySelector("#starfield");
const ctx = canvas.getContext("2d");
const cursorGlow = document.querySelector(".cursor-glow");
const nameOutput = document.querySelector("#nameOutput");
const letterName = document.querySelector("#letterName");
const typedLetter = document.querySelector("#typedLetter");
const letterPanel = document.querySelector("#letterPanel");
const toast = document.querySelector("#toast");
const reasonText = document.querySelector("#reasonText");

const reasons = [
  "You make simple days feel rare.",
  "Your laugh lives rent-free in my favorite memories.",
  "You make love feel calm, brave, and real.",
  "You are soft where the world is sharp.",
  "Every version of tomorrow sounds better with you in it.",
  "You turn ordinary minutes into something I want to keep.",
  "You are my favorite hello and the hardest goodbye."
];

const letter = `Hi babi!

I know we've been through a lot, and there are things we didn't understand. But I hope we both choose to be better—for us, for our love, and for the gentle future we still deserve.

Please be careful, talk to me properly, and always take care of yourself. I can forgive—I already have—because you are still my baby.

So, I want you to know that I love you so much. I'm sorry for every time I made you sad. I love you so much, okay? Mwamwa!

No matter what, I hope we keep finding our way back to kindness, honesty, and the little things that make us us.`;

let stars = [];
let particles = [];
let audioContext;
let musicTimer;
let typingTimer;
let toastTimer;
let reasonIndex = 0;
let lastSpark = 0;

nameOutput.textContent = "babi";
letterName.textContent = "babi";

function fitCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const total = Math.min(160, Math.floor(window.innerWidth * window.innerHeight / 9000));
  stars = Array.from({ length: total }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.8 + 0.3,
    speed: Math.random() * 0.35 + 0.08,
    twinkle: Math.random() * Math.PI * 2
  }));
}

function drawHeart(x, y, size, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.beginPath();
  ctx.moveTo(0, 0.35);
  ctx.bezierCurveTo(-1.25, -0.45, -0.72, -1.45, 0, -0.82);
  ctx.bezierCurveTo(0.72, -1.45, 1.25, -0.45, 0, 0.35);
  ctx.fillStyle = `rgba(255, 91, 145, ${alpha})`;
  ctx.fill();
  ctx.restore();
}

function animateSky() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  stars.forEach(star => {
    star.y += star.speed;
    star.twinkle += 0.03;
    if (star.y > window.innerHeight + 8) {
      star.y = -8;
      star.x = Math.random() * window.innerWidth;
    }
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 247, 251, ${0.35 + Math.sin(star.twinkle) * 0.25})`;
    ctx.fill();
  });

  particles = particles.filter(particle => particle.life > 0);
  particles.forEach(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy -= 0.015;
    particle.life -= 0.012;
    drawHeart(particle.x, particle.y, particle.size, Math.max(particle.life, 0));
  });
  requestAnimationFrame(animateSky);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function burstHearts(x, y, amount = 18) {
  for (let index = 0; index < amount; index += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3.4 - 0.8,
      size: Math.random() * 9 + 5,
      life: Math.random() * 0.45 + 0.55
    });
  }
}

function typeLetter() {
  window.clearInterval(typingTimer);
  typedLetter.textContent = "";
  let character = 0;
  typingTimer = window.setInterval(() => {
    typedLetter.textContent += letter[character] || "";
    character += 1;
    if (character >= letter.length) window.clearInterval(typingTimer);
  }, 16);
}

function floatingHeart(x, y) {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = "♥";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.style.fontSize = `${Math.random() * 20 + 18}px`;
  document.body.append(heart);
  heart.addEventListener("animationend", () => heart.remove());
}

function createSpark(x, y) {
  if (Date.now() - lastSpark < 45) return;
  lastSpark = Date.now();
  const spark = document.createElement("span");
  spark.className = "spark";
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  document.body.append(spark);
  spark.addEventListener("animationend", () => spark.remove());
}

function playNote(frequency, startTime, duration) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.04);
}

function toggleMusic() {
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = undefined;
    showToast("Music paused.");
    return;
  }
  audioContext = audioContext || new AudioContext();
  const melody = [392, 440, 523.25, 659.25, 587.33, 523.25, 440, 392];
  let note = 0;
  const playMelody = () => {
    const time = audioContext.currentTime;
    playNote(melody[note % melody.length], time, 0.42);
    playNote(melody[(note + 2) % melody.length] / 2, time, 0.5);
    note += 1;
  };
  playMelody();
  musicTimer = window.setInterval(playMelody, 520);
  showToast("Soft music playing.");
}

window.addEventListener("resize", fitCanvas);
window.addEventListener("pointermove", event => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
  createSpark(event.clientX, event.clientY);
});
window.addEventListener("click", event => floatingHeart(event.clientX, event.clientY));

document.querySelector("#musicToggle").addEventListener("click", toggleMusic);
document.querySelector("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("theme-moon");
  showToast(document.body.classList.contains("theme-moon") ? "Moonlight theme on." : "Rose theme on.");
});
document.querySelector("#launchHearts").addEventListener("click", () => {
  burstHearts(window.innerWidth / 2, window.innerHeight / 2, 48);
  showToast("Hearts delivered.");
});
document.querySelector("#openLetter").addEventListener("click", () => {
  letterPanel.classList.add("open");
  typeLetter();
  burstHearts(window.innerWidth / 2, window.innerHeight / 2, 24);
});
document.querySelector("#closeLetter").addEventListener("click", () => letterPanel.classList.remove("open"));
document.querySelector("#newReason").addEventListener("click", () => {
  reasonIndex = (reasonIndex + 1) % reasons.length;
  reasonText.textContent = reasons[reasonIndex];
});
document.querySelectorAll(".memory-card").forEach(card => {
  card.addEventListener("click", () => {
    reasonText.textContent = card.dataset.message;
    const box = card.getBoundingClientRect();
    burstHearts(box.left + card.offsetWidth / 2, box.top + 40, 16);
    showToast(card.dataset.message);
  });
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") letterPanel.classList.remove("open");
});

fitCanvas();
animateSky();
