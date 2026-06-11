const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

let chips = 1000;
let betAmount = 0;
let selectedBet = null; // {type, value}
let wins = 0;

const chipsEl = document.getElementById("chips");
const betAmountEl = document.getElementById("betAmount");
const winsEl = document.getElementById("wins");
const landedOnText = document.getElementById("landedOnText");
const resultCard = document.getElementById("resultCard");
const rollBtn = document.getElementById("rollBtn");
const numberGrid = document.getElementById("numberGrid");
const wheelStrip = document.getElementById("wheelStrip");

function isRed(n) { return RED_NUMBERS.includes(n); }
function colorClass(n) { return n === 0 ? "green" : isRed(n) ? "red" : "black"; }

function updateUI() {
  chipsEl.textContent = chips;
  betAmountEl.textContent = betAmount;
  winsEl.textContent = wins;
}

function clearSelection() {
  document.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));
}

// Build wheel strip (0..36 with colors)
for (let i = 0; i <= 36; i++) {
  const cell = document.createElement("div");
  cell.className = "wheel-cell " + colorClass(i);
  cell.textContent = i;
  cell.dataset.wheel = i;
  wheelStrip.appendChild(cell);
}

// Build number grid 0..36
for (let i = 0; i <= 36; i++) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "action-button number-btn " + colorClass(i);
  btn.textContent = i;
  btn.dataset.number = i;
  numberGrid.appendChild(btn);
}

// Chip buttons
document.querySelectorAll("[data-chip]").forEach(btn => {
  btn.addEventListener("click", () => {
    const add = parseInt(btn.dataset.chip);
    if (betAmount + add <= chips) {
      betAmount += add;
      updateUI();
    } else {
      landedOnText.textContent = "Not enough chips for that bet.";
    }
  });
});

document.getElementById("clearBetBtn").addEventListener("click", () => {
  betAmount = 0;
  selectedBet = null;
  clearSelection();
  updateUI();
  landedOnText.textContent = "Bet cleared.";
});

// Outside bets
document.querySelectorAll("[data-bet]").forEach(btn => {
  btn.addEventListener("click", () => {
    clearSelection();
    btn.classList.add("selected");
    selectedBet = { type: btn.dataset.bet };
    landedOnText.textContent = `Bet placed on ${btn.textContent}.`;
  });
});

// Number bets
numberGrid.querySelectorAll("[data-number]").forEach(btn => {
  btn.addEventListener("click", () => {
    clearSelection();
    btn.classList.add("selected");
    selectedBet = { type: "number", value: parseInt(btn.dataset.number) };
    landedOnText.textContent = `Bet placed on ${btn.textContent}.`;
  });
});

function checkWin(landOn) {
  if (!selectedBet) return 0;
  const t = selectedBet.type;
  if (t === "number") return selectedBet.value === landOn ? 35 : 0;
  if (landOn === 0) return 0;
  if (t === "red") return isRed(landOn) ? 1 : 0;
  if (t === "black") return !isRed(landOn) ? 1 : 0;
  if (t === "even") return landOn % 2 === 0 ? 1 : 0;
  if (t === "odd") return landOn % 2 === 1 ? 1 : 0;
  if (t === "low") return landOn <= 18 ? 1 : 0;
  if (t === "high") return landOn >= 19 ? 1 : 0;
  return 0;
}

function highlightWheel(landOn) {
  wheelStrip.querySelectorAll(".wheel-cell").forEach(c => c.classList.remove("landed"));
  const cell = wheelStrip.querySelector(`[data-wheel="${landOn}"]`);
  if (cell) {
    cell.classList.add("landed");
    cell.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

function rollTheWheel() {
  if (betAmount <= 0) {
    landedOnText.textContent = "Add a bet amount first!";
    return;
  }
  if (!selectedBet) {
    landedOnText.textContent = "Select where to bet first!";
    return;
  }
  if (betAmount > chips) {
    landedOnText.textContent = "Not enough chips!";
    return;
  }

  chips -= betAmount;
  const landOn = Math.floor(Math.random() * 37); // 0..36

  resultCard.textContent = landOn;
  resultCard.className = "card " + colorClass(landOn);
  highlightWheel(landOn);

  const payout = checkWin(landOn);
  if (payout > 0) {
    const winnings = betAmount * (payout + 1);
    chips += winnings;
    wins++;
    landedOnText.textContent = `Landed on ${landOn} (${colorClass(landOn)}). You won ${winnings} chips!`;
  } else {
    landedOnText.textContent = `Landed on ${landOn} (${colorClass(landOn)}). You lost ${betAmount} chips.`;
  }

  betAmount = 0;
  selectedBet = null;
  clearSelection();
  updateUI();
}

rollBtn.addEventListener("click", rollTheWheel);
updateUI();