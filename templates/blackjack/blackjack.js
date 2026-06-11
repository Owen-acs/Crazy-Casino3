const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

let deck = [], player = [], dealer = [], over = true;
const score = { wins: 0, losses: 0, pushes: 0 };

const el = id => document.getElementById(id);

function buildDeck() {
  deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push({ r, s });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function value(hand) {
  let total = 0, aces = 0;
  for (const c of hand) {
    if (c.r === "A") { total += 11; aces++; }
    else if (["K", "Q", "J"].includes(c.r)) total += 10;
    else total += +c.r;
  }
  while (total > 21 && aces) { total -= 10; aces--; }
  return total;
}

function cardEl(c, hidden) {
  const d = document.createElement("div");
  const red = c.s === "♥" || c.s === "♦";
  d.className = "card" + (hidden ? " hidden" : red ? " red" : "");
  d.style.setProperty("--tilt", (Math.random() * 10 - 5) + "deg");
  d.textContent = hidden ? "" : c.r + c.s;
  return d;
}

function render(hideHole) {
  const pc = el("playerCards"), dc = el("dealerCards");
  pc.innerHTML = "";
  dc.innerHTML = "";

  player.forEach(c => pc.appendChild(cardEl(c, false)));
  dealer.forEach((c, i) => dc.appendChild(cardEl(c, hideHole && i === 1)));

  el("playerTotal").textContent = value(player);
  el("dealerTotal").textContent = hideHole ? value([dealer[0]]) : value(dealer);
}

function setControls(playing) {
  el("dealBtn").disabled = playing;
  el("hitBtn").disabled = !playing;
  el("standBtn").disabled = !playing;
}

function updateScore() {
  el("wins").textContent = score.wins;
  el("losses").textContent = score.losses;
  el("pushes").textContent = score.pushes;
}

function finish(msg) {
  over = true;
  setControls(false);
  render(false);
  el("status").textContent = msg;
}

function deal() {
  buildDeck();
  player = [deck.pop(), deck.pop()];
  dealer = [deck.pop(), deck.pop()];
  over = false;
  setControls(true);
  render(true);
  el("status").textContent = "Hit or Stand?";

  if (value(player) === 21) stand();
}

function hit() {
  if (over) return;
  player.push(deck.pop());
  render(true);
  if (value(player) > 21) {
    score.losses++;
    updateScore();
    finish("Bust! You lose 💥");
  }
}

function stand() {
  if (over) return;
  while (value(dealer) < 17) dealer.push(deck.pop());

  const p = value(player), d = value(dealer);
  if (d > 21 || p > d) { score.wins++; finish("You win! 🎉"); }
  else if (p < d) { score.losses++; finish("Dealer wins 😔"); }
  else { score.pushes++; finish("Push — it's a tie 🤝"); }
  updateScore();
}

el("dealBtn").addEventListener("click", deal);
el("hitBtn").addEventListener("click", hit);
el("standBtn").addEventListener("click", stand);