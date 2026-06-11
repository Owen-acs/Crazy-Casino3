import { Chips, addChips, spendChips } from "../../static/mony.js";
const SYMBOLS = ["🍒", "🍋", "🔔", "⭐", "💎", "7️⃣"];
const WILD = "7️⃣";
const SCATTER = "💎";

const PAYOUTS = {
  "7️⃣": 60,
  "💎": 30,
  "⭐": 18,
  "🔔": 12,
  "🍋": 7,
  "🍒": 5,
};

// Weighted reel strips: rarer symbols appear less often.
const WEIGHTS = { "🍒": 6, "🍋": 5, "🔔": 4, "⭐": 3, "💎": 2, "7️⃣": 1 };
const WEIGHTED = Object.entries(WEIGHTS).flatMap(([s, w]) => Array(w).fill(s));

let bet = 10;
let lastWin = 0;
let spinning = false;
let autoplay = false;

const reelsEl = document.getElementById("reels");
const cards = [...reelsEl.querySelectorAll(".card")];
const statusEl = document.getElementById("status");
const chipsEl = document.getElementById("chips");
const betEl = document.getElementById("bet");
const lastWinEl = document.getElementById("lastWin");
const winBanner = document.getElementById("winBanner");
const spinBtn = document.getElementById("spin");
const betUpBtn = document.getElementById("betUp");
const betDownBtn = document.getElementById("betDown");
const maxBetBtn = document.getElementById("maxBet");
const autoBtn = document.getElementById("auto");
const resetBtn = document.getElementById("reset");

let audioCtx = null;
function tone(freq, duration = 0.12, type = "sine", gain = 0.08) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g).connect(audioCtx.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
  } catch (_) {}
}

function render() {
  chipsEl.textContent = String(Chips);
  betEl.textContent = bet;
  lastWinEl.textContent = lastWin;
}

function showBanner(text) {
  winBanner.textContent = text;
  winBanner.classList.add("show");
  setTimeout(() => winBanner.classList.remove("show"), 2200);
}

function buildPaytable() {
  const list = document.getElementById("paytable");
  list.innerHTML = "";
  Object.entries(PAYOUTS).forEach(([sym, mult]) => {
    const li = document.createElement("li");
    const note = sym === WILD ? " (wild)" : sym === SCATTER ? " (scatter)" : "";
    li.innerHTML = `<span>${sym}${sym}${sym}${note}</span><b>x${mult}</b>`;
    list.appendChild(li);
  });
  const scatter = document.createElement("li");
  scatter.innerHTML = `<span>3 ${SCATTER} = Free Spin</span><b>🎁</b>`;
  list.appendChild(scatter);
}

function rand() {
  return WEIGHTED[Math.floor(Math.random() * WEIGHTED.length)];
}

// Wilds substitute for any symbol when forming a three-of-a-kind.
function evaluate(result) {
  const scatters = result.filter((s) => s === SCATTER).length;
  const freeSpin = scatters === 3;

  let winnings = 0;
  for (const target of SYMBOLS) {
    if (target === WILD) continue;
    if (result.every((s) => s === target || s === WILD)) {
      winnings = Math.max(winnings, bet * PAYOUTS[target]);
    }
  }
  if (result.every((s) => s === WILD)) winnings = bet * PAYOUTS[WILD];

  if (winnings === 0) {
    const counts = {};
    result.forEach((s) => (counts[s] = (counts[s] || 0) + 1));
    const wilds = counts[WILD] || 0;
    const pair = Object.entries(counts).some(([s, n]) => s !== WILD && n + wilds >= 2);
    if (pair || wilds >= 2) winnings = Math.floor(bet * 0.6);
  }

  return { winnings, freeSpin };
}

function spin(isFree = false) {
  if (spinning) return;
  if (!isFree && bet > Chips) {
    statusEl.textContent = "Not enough chips for that bet!";
    stopAuto();
    return;
  }

  spinning = true;
  toggleControls(true);

  if (!isFree) spendChips(bet);
  lastWin = 0;
  render();
  statusEl.textContent = isFree ? "Free spin! 🎁" : "Spinning...";

  cards.forEach((c) => {
    c.classList.add("spinning");
    c.classList.remove("win");
  });

  const result = [rand(), rand(), rand()];

  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.remove("spinning");
      card.textContent = result[i];
      tone(420 + i * 90, 0.08, "triangle");
      if (i === cards.length - 1) finishSpin(result);
    }, 600 + i * 550);
  });

  const flicker = setInterval(() => {
    cards.forEach((card) => {
      if (card.classList.contains("spinning")) card.textContent = rand();
    });
  }, 90);
  setTimeout(() => clearInterval(flicker), 600 + cards.length * 550);
}

function finishSpin(result) {
  const { winnings, freeSpin } = evaluate(result);

  if (winnings > 0) {
    addChips(winnings);
    lastWin = winnings;
    cards.forEach((c) => c.classList.add("win"));
    statusEl.textContent = `You won ${winnings} chips! 🎉`;
    [660, 880, 1040].forEach((f, i) => setTimeout(() => tone(f, 0.15, "square", 0.06), i * 120));
    if (winnings >= bet * 18) showBanner(`BIG WIN! +${winnings}`);
    else showBanner(`WIN +${winnings}`);
  } else {
    statusEl.textContent = "No match. Spin again!";
  }

  render();
  spinning = false;
  toggleControls(false);

  if (freeSpin) {
    statusEl.textContent += " 3 💎 — Free Spin!";
    showBanner("FREE SPIN! 🎁");
    setTimeout(() => spin(true), 1100);
    return;
  }

  if (Chips < 5) {
    statusEl.textContent = "Out of chips! Press Reset to play again.";
    spinBtn.disabled = true;
    stopAuto();
    return;
  }

  if (autoplay) setTimeout(() => spin(), 900);
}

function toggleControls(disabled) {
  [spinBtn, betUpBtn, betDownBtn, maxBetBtn].forEach((b) => (b.disabled = disabled));
}

function stopAuto() {
  autoplay = false;
  autoBtn.textContent = "Auto";
  autoBtn.classList.remove("active");
}

betUpBtn.addEventListener("click", () => {
  if (spinning) return;
  bet = Math.min(bet + 5, Math.max(5, Chips));
  render();
});

betDownBtn.addEventListener("click", () => {
  if (spinning) return;
  bet = Math.max(5, bet - 5);
  render();
});

maxBetBtn.addEventListener("click", () => {
  if (spinning) return;
  bet = Math.max(5, Math.floor(Chips / 5) * 5);
  render();
});

autoBtn.addEventListener("click", () => {
  if (Chips < 5) return;
  autoplay = !autoplay;
  autoBtn.textContent = autoplay ? "Stop" : "Auto";
  autoBtn.classList.toggle("active", autoplay);
  if (autoplay && !spinning) spin();
});

resetBtn.addEventListener("click", () => {
  if (spinning) return;
  stopAuto();
  bet = 10;
  lastWin = 0;
  statusEl.textContent = "Spin to win the jackpot!";
  spinBtn.disabled = Chips < 5;
  render();
});

spinBtn.addEventListener("click", () => spin());

buildPaytable();
render();