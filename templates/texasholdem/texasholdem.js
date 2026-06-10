const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

const playerHandEl = document.getElementById("playerHand");
const opponentHandEl = document.getElementById("opponentHand");
const communityCardsEl = document.getElementById("communityCards");
const statusEl = document.getElementById("status");
const chipsEl = document.getElementById("chips");
const potEl = document.getElementById("pot");
const stageEl = document.getElementById("stage");

const newHandBtn = document.getElementById("newHandBtn");
const foldBtn = document.getElementById("foldBtn");
const checkBtn = document.getElementById("checkBtn");
const betBtn = document.getElementById("betBtn");

let deck = [];
let playerHand = [];
let opponentHand = [];
let communityCards = [];
let chips = 1000;
let pot = 0;
let stage = "ready";
let handActive = false;

function createDeck() {
  const freshDeck = [];

  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      freshDeck.push({
        rank,
        suit,
        red: suit === "♥" || suit === "♦",
        value: ranks.length - ranks.indexOf(rank)
      });
    });
  });

  return freshDeck;
}

function shuffle(cards) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function draw() {
  return deck.pop();
}

function cardText(card) {
  return `${card.rank}${card.suit}`;
}

function renderCard(card, hidden = false, index = 0) {
  const cardEl = document.createElement("div");
  cardEl.className = `card ${card.red ? "red" : ""} ${hidden ? "hidden" : ""}`;
  cardEl.textContent = hidden ? "?" : cardText(card);
  cardEl.style.setProperty("--tilt", `${(index % 2 === 0 ? -1 : 1) * (2 + index)}deg`);
  cardEl.style.animationDelay = `${index * 0.06}s`;
  return cardEl;
}

function renderPlaceholder(text = "") {
  const el = document.createElement("div");
  el.className = "placeholder";
  el.textContent = text;
  return el;
}

function render() {
  playerHandEl.innerHTML = "";
  opponentHandEl.innerHTML = "";
  communityCardsEl.innerHTML = "";

  playerHand.forEach((card, index) => playerHandEl.appendChild(renderCard(card, false, index)));
  opponentHand.forEach((card, index) => opponentHandEl.appendChild(renderCard(card, handActive, index)));

  for (let i = 0; i < 5; i++) {
    if (communityCards[i]) {
      communityCardsEl.appendChild(renderCard(communityCards[i], false, i));
    } else {
      communityCardsEl.appendChild(renderPlaceholder("★"));
    }
  }

  chipsEl.textContent = `$${chips}`;
  potEl.textContent = `$${pot}`;
  stageEl.textContent = stage[0].toUpperCase() + stage.slice(1);
  foldBtn.disabled = !handActive;
  checkBtn.disabled = !handActive;
  betBtn.disabled = !handActive || chips < 50;
}

function setStatus(message) {
  statusEl.textContent = message;
}

function newHand() {
  deck = shuffle(createDeck());
  playerHand = [draw(), draw()];
  opponentHand = [draw(), draw()];
  communityCards = [];
  pot = 100;
  chips = Math.max(0, chips - 50);
  stage = "pre-flop";
  handActive = true;

  setStatus("Cards dealt. Check to reveal the flop or bet to build the pot.");
  render();
}

function advanceStage() {
  if (!handActive) return;

  if (stage === "pre-flop") {
    communityCards.push(draw(), draw(), draw());
    stage = "flop";
    setStatus("The flop is out. Check or bet.");
  } else if (stage === "flop") {
    communityCards.push(draw());
    stage = "turn";
    setStatus("The turn card is out. One more card to go.");
  } else if (stage === "turn") {
    communityCards.push(draw());
    stage = "river";
    setStatus("The river is out. Check to showdown or bet once more.");
  } else if (stage === "river") {
    showdown();
    return;
  }

  render();
}

function bet() {
  if (!handActive || chips < 50) return;

  chips -= 50;
  pot += 100;
  setStatus("You bet $50. Opponent calls. Dealing continues...");
  advanceStage();
}

function fold() {
  if (!handActive) return;

  handActive = false;
  stage = "folded";
  pot = 0;
  setStatus("You folded. Opponent wins the pot.");
  render();
}

function bestHighCard(cards) {
  return Math.max(...cards.map((card) => card.value));
}

function countPairs(cards) {
  const counts = {};

  cards.forEach((card) => {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  });

  return Object.values(counts).filter((count) => count >= 2).length;
}

function handScore(hand) {
  const cards = [...hand, ...communityCards];
  return countPairs(cards) * 100 + bestHighCard(cards);
}

function showdown() {
  const playerScore = handScore(playerHand);
  const opponentScore = handScore(opponentHand);

  handActive = false;
  stage = "showdown";

  if (playerScore > opponentScore) {
    chips += pot;
    setStatus(`Showdown! You win $${pot} with the better hand.`);
  } else if (playerScore < opponentScore) {
    setStatus("Showdown! Opponent wins this hand.");
  } else {
    chips += Math.floor(pot / 2);
    setStatus("Showdown! It's a tie, so you split the pot.");
  }

  pot = 0;
  render();
}

newHandBtn.addEventListener("click", newHand);
checkBtn.addEventListener("click", advanceStage);
betBtn.addEventListener("click", bet);
foldBtn.addEventListener("click", fold);

render();
