let balance = 100;
let spinning = false;
let usedLifeSavings = false;
let bankRequested = false;
let momCardTried = false;
let inPrison = false;
let onIsland = false;
let diceClicks = 0;

const normalSymbols = ["🍒", "🍋", "🍇", "🔔", "⭐", "💎", "7️⃣"];
const prisonSymbols = ["🪨", "🥄", "🔒", "⛓️", "🍞", "🧱", "🐀"];
const islandSymbols = ["🐚", "🥥", "🌴", "🦜", "🍍", "🏝️", "🦀"];

const islandStyle = document.createElement("style");
islandStyle.textContent = `
  body.island-theme {
    background:
      radial-gradient(circle at top, rgba(255, 244, 138, 0.35), transparent 32%),
      linear-gradient(135deg, #0099b8, #00c2a8, #ffe28a);
  }

  body.island-theme::before {
    background-image:
      radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
      radial-gradient(rgba(255,226,138,0.9) 2px, transparent 2px);
    background-size: 55px 55px, 90px 90px;
    opacity: 0.45;
  }

  body.island-theme .marquee {
    background: #00a884;
    color: #fff7b0;
    box-shadow: 0 0 20px #00ffd5, 0 0 40px #ffe28a;
  }

  body.island-theme h1 {
    color: #fff7b0;
    text-shadow: 0 0 12px #00ffd5, 0 0 26px #006b80;
  }

  body.island-theme .note,
  body.island-theme #message {
    color: #fff7b0;
    text-shadow: 0 0 10px #008ea3;
  }

  body.island-theme .panel {
    background: rgba(0, 91, 112, 0.55);
    border-color: #fff7b0;
    box-shadow: 0 0 30px #00ffd5, inset 0 0 25px rgba(255, 255, 255, 0.15);
  }

  body.island-theme .slots {
    background: linear-gradient(#00a884, #006b80);
    border: 2px solid #fff7b0;
  }

  body.island-theme .slots span {
    background: linear-gradient(#fff7d1, #ffd36e);
    border-color: #00ffd5;
    box-shadow: 0 0 18px rgba(0, 255, 213, 0.75);
  }

  body.island-theme #spinBtn {
    background: linear-gradient(#00ffd5, #0099b8);
    color: #00333d;
  }
`;
document.head.appendChild(islandStyle);

const gameEl = document.getElementById("game");
const startBtn = document.getElementById("startBtn");
const diceSecret = document.getElementById("diceSecret");
const adminOpenBtn = document.getElementById("adminOpenBtn");
const adminPanel = document.getElementById("adminPanel");
const adminCloseBtn = document.getElementById("adminCloseBtn");
const gameTitle = document.getElementById("gameTitle");
const gameNote = document.getElementById("gameNote");
const marquee = document.getElementById("marquee");
const balanceLabel = document.getElementById("balanceLabel");
const balanceEl = document.getElementById("balance");
const lastWinEl = document.getElementById("lastWin");
const betEl = document.getElementById("bet");
const slotsEl = document.getElementById("slots");
const messageEl = document.getElementById("message");
const spinBtn = document.getElementById("spinBtn");
const maxBetBtn = document.getElementById("maxBetBtn");
const resetBtn = document.getElementById("resetBtn");
const choiceTitle = document.getElementById("choiceTitle");
const choiceText = document.getElementById("choiceText");
const choiceButtons = document.getElementById("choiceButtons");

function activeSymbols() {
  if (inPrison) return prisonSymbols;
  if (onIsland) return islandSymbols;
  return normalSymbols;
}

function updateTheme() {
  document.body.classList.toggle("prison-theme", inPrison);
  document.body.classList.toggle("island-theme", onIsland && !inPrison);

  if (inPrison) {
    gameTitle.textContent = "🪨 Prison Yard Slots";
    gameNote.textContent = "Prison mode — gambling with rocks now.";
    marquee.textContent = "⛓️ ROCKPOT ZONE ⛓️ ROCKPOT ZONE ⛓️ ROCKPOT ZONE ⛓️";
    balanceLabel.textContent = "Rocks";
  } else if (onIsland) {
    gameTitle.textContent = "🏝️ Suspicious island";
    gameNote.textContent = "Island mode — gambling with seashells now.";
    marquee.textContent = "🐚 SHELLPOT BEACH 🐚 SHELLPOT BEACH 🐚 SHELLPOT BEACH 🐚";
    balanceLabel.textContent = "Shells";
  } else {
    gameTitle.textContent = "🎰 Neon Slot Machine";
    gameNote.textContent = "For fun only — virtual coins, no real money.";
    marquee.textContent = "★ JACKPOT ZONE ★ JACKPOT ZONE ★ JACKPOT ZONE ★";
    balanceLabel.textContent = "Balance";
  }
}

function currencyName() {
  if (inPrison) return "rocks";
  if (onIsland) return "shells";
  return "coins";
}

function updateBalance() {
  updateTheme();
  balanceEl.textContent = balance;
  spinBtn.disabled = balance <= 0 || spinning;
  maxBetBtn.disabled = balance <= 0 || spinning;
  resetBtn.disabled = spinning;
}

function randomSymbol() {
  const symbols = activeSymbols();
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function setSlots(result) {
  slotsEl.innerHTML = result.map(symbol => `<span>${symbol}</span>`).join("");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function spinReels(finalResult) {
  slotsEl.classList.add("spinning");
  slotsEl.classList.remove("win");

  for (let i = 0; i < 18; i++) {
    setSlots([randomSymbol(), randomSymbol(), randomSymbol()]);
    await sleep(75);
  }

  setSlots([finalResult[0], randomSymbol(), randomSymbol()]);
  await sleep(250);
  setSlots([finalResult[0], finalResult[1], randomSymbol()]);
  await sleep(350);
  setSlots(finalResult);
  slotsEl.classList.remove("spinning");
}

async function spin() {
  if (spinning) return;

  const bet = Number(betEl.value);

  if (!bet || bet < 1) {
    messageEl.textContent = "Enter a valid bet.";
    return;
  }

  if (bet > balance) {
    messageEl.textContent = `You do not have enough ${currencyName()}.`;
    return;
  }

  spinning = true;
  balance -= bet;
  lastWinEl.textContent = 0;

  if (inPrison) {
    messageEl.textContent = "Rocks are tumbling...";
  } else if (onIsland) {
    messageEl.textContent = "Shells are spinning...";
  } else {
    messageEl.textContent = "Spinning...";
  }

  updateBalance();

  const result = [randomSymbol(), randomSymbol(), randomSymbol()];
  await spinReels(result);

  let win = 0;
  const currency = currencyName();

  if (result[0] === result[1] && result[1] === result[2]) {
    win = bet * 6;

    if (inPrison) {
      messageEl.textContent = `🪨 ROCKPOT! You won ${win} ${currency}!`;
    } else if (onIsland) {
      messageEl.textContent = `🐚 SHELLPOT! You won ${win} ${currency}!`;
    } else {
      messageEl.textContent = `💥 JACKPOT! You won ${win} ${currency}!`;
    }

    slotsEl.classList.add("win");
  } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
    win = bet * 2;
    messageEl.textContent = `✨ Nice match! You won ${win} ${currency}.`;
    slotsEl.classList.add("win");
  } else {
    if (inPrison) {
      messageEl.textContent = "No match. The rat judges you.";
    } else if (onIsland) {
      messageEl.textContent = "No match. A crab steals one dramatic glance.";
    } else {
      messageEl.textContent = "No match. Try again!";
    }
  }

  balance += win;
  lastWinEl.textContent = win;
  spinning = false;
  updateBalance();

  if (balance <= 0) {
    handleGameOver();
  }
}

function showChoice(title, text, buttons) {
  choiceTitle.textContent = title;
  choiceText.textContent = text;
  choiceButtons.innerHTML = "";

  buttons.forEach(button => {
    const btn = document.createElement("button");
    btn.textContent = button.text;
    btn.addEventListener("click", button.action);
    choiceButtons.appendChild(btn);
  });

  gameEl.classList.remove("not-started");
  gameEl.classList.add("game-over-mode");
  updateBalance();
}

function continueGame(amount, bet, text, prisonMode = false, islandMode = false) {
  inPrison = prisonMode;
  onIsland = islandMode && !prisonMode;
  balance = amount;
  betEl.value = bet;
  lastWinEl.textContent = 0;
  slotsEl.classList.remove("spinning", "win");

  if (inPrison) {
    setSlots(["🪨", "🔒", "🪨"]);
  } else if (onIsland) {
    setSlots(["🐚", "🌴", "🐚"]);
  } else {
    setSlots(["💎", "7️⃣", "💎"]);
  }

  messageEl.textContent = text;
  gameEl.classList.remove("game-over-mode", "not-started");
  updateBalance();
}

function handleGameOver() {
  balance = 0;
  updateBalance();

  if (inPrison) {
    showPrisonChoices();
  } else if (onIsland) {
    showIslandChoices();
  } else if (!usedLifeSavings) {
    showChoice("💀 YOU LOST EVERYTHING 💀", "The machine wipes itself from the screen. Spend your life savings to keep going?", [
      { text: "Spend Life Savings", action: spendLifeSavings },
      { text: "Walk Away", action: resetGame }
    ]);
  } else if (!bankRequested) {
    showBankChoice();
  } else {
    showChaosChoices();
  }
}

function spendLifeSavings() {
  usedLifeSavings = true;
  continueGame(500, 25, "Life savings loaded. Surely this will end well.");
}

function showBankChoice() {
  showChoice("🏦 THE BANK ARC 🏦", "Your life savings are gone. Apply for a bank loan? There is a 50% chance they decline.", [
    { text: "Apply For Bank Loan", action: requestBankLoan },
    { text: "Skip To Bad Ideas", action: showChaosChoices },
    { text: "Pretend This Never Happened", action: resetGame }
  ]);
}

function requestBankLoan() {
  bankRequested = true;

  if (Math.random() < 0.5) {
    continueGame(800, 50, "The bank approved your loan. The machine is impressed.");
  } else {
    showChoice("🏦 LOAN DECLINED 🏦", "The bank looked at your slot history and quietly closed the blinds.", [
      { text: "Open Chaos Menu", action: showChaosChoices },
      { text: "Walk Away With Dignity", action: resetGame }
    ]);
  }
}

function showChaosChoices() {
  showChoice("🚨 CARTOON CHAOS MENU 🚨", "Pick a ridiculous fictional path. Every path can still somehow work out.", [
    { text: "Rob The Bank", action: robBank },
    { text: "Rob The Casino Back", action: robCasino },
    { text: "Try Mom's Card", action: showMomCardChoice },
    { text: "Desperate Side Quests", action: showSideHustles },
    { text: "Wild New Paths", action: showWildScenarios },
    { text: "Reset Life", action: resetGame }
  ]);
}

function robBank() {
  const roll = Math.random();

  if (roll < 0.4) {
    continueGame(1200, 75, "Cartoon bank robbery success. A money bag bonked you on the head.");
  } else if (roll < 0.75) {
    goToJail("🚓 BANK ROBBERY FAILED 🚓", "You tripped over the welcome mat and went directly to prison.");
  } else {
    showChoice("💸 THE BAG HAD COUPONS 💸", "You escaped, but the bag only had expired sandwich coupons.", [
      { text: "Rob The Casino Instead", action: robCasino },
      { text: "Try Side Quests", action: showSideHustles }
    ]);
  }
}

function robCasino() {
  const roll = Math.random();

  if (roll < 0.35) {
    continueGame(1500, 100, "You recovered your winnings in full cartoon logic style.");
  } else if (roll < 0.7) {
    goToJail("🎲 CASINO SECURITY GOT YOU 🎲", "A bouncer named Tiny gently launched you into prison.");
  } else {
    continueGame(400, 25, "Security mistook you for a magician and tipped you.");
  }
}

function showWildScenarios() {
  showChoice("🌪️ WILD SCENARIO MENU 🌪️", "The casino basement has five doors. None of them are normal.", [
    { text: "Crypto Cave", action: cryptoCave },
    { text: "Alien Casino", action: alienCasino },
    { text: "Time Machine", action: timeMachine },
    { text: "Pirate Ship", action: pirateShip },
    { text: "Suspicious Island", action: suspiciousIsland },
    { text: "Back To Chaos", action: showChaosChoices }
  ]);
}

function cryptoCave() {
  const roll = Math.random();

  if (roll < 0.35) {
    continueGame(2000, 125, "Your meme coin exploded upward. You are briefly a genius.");
  } else if (roll < 0.7) {
    continueGame(60, 10, "The coin crashed so hard it left a cartoon crater.");
  } else {
    suspiciousIsland("A crypto yacht party invite appeared. Huge mistake.");
  }
}

function alienCasino() {
  const roll = Math.random();

  if (roll < 0.4) {
    continueGame(1100, 70, "Aliens paid you in shiny space chips. They blink sideways.");
  } else if (roll < 0.75) {
    continueGame(85, 10, "The aliens taxed your winnings in moon dust fees.");
  } else {
    goToJail("👽 SPACE COURT 👽", "The aliens reported you to Earth jail for suspicious dice behavior.");
  }
}

function timeMachine() {
  const roll = Math.random();

  if (roll < 0.33) {
    continueGame(777, 77, "You went back 5 minutes and told yourself the winning numbers.");
  } else if (roll < 0.66) {
    showChoice("🦖 DINOSAUR CASINO 🦖", "You overshot the timeline and a dinosaur is the dealer.", [
      { text: "Bet A Fossil", action: () => continueGame(300, 25, "The fossil somehow counted as casino credit.") },
      { text: "Run Back To Present", action: () => continueGame(150, 15, "You returned with prehistoric pocket change.") }
    ]);
  } else {
    resetGame();
    messageEl.textContent = "Time paradox! Everything reset, but you remember the trauma.";
  }
}

function pirateShip() {
  const roll = Math.random();

  if (roll < 0.4) {
    continueGame(1300, 80, "You joined a pirate crew and found a treasure chest full of chips.");
  } else if (roll < 0.7) {
    suspiciousIsland("The pirates marooned you on a very suspicious private island.");
  } else {
    continueGame(200, 20, "The treasure chest only had chocolate coins. Still counts.");
  }
}

function suspiciousIsland(introText = "You accidentally ended up on a suspicious private island. The vibes are horrible. Escape immediately.") {
  inPrison = false;
  onIsland = true;

  showChoice("🏝️ SUSPICIOUS ISLAND 🏝️", introText, [
    { text: "Gamble With Shells", action: () => continueGame(300, 25, "You found a beach slot machine. Shells are currency now.", false, true) },
    { text: "Steal Speedboat", action: stealSpeedboat },
    { text: "Call Cartoon Helicopter", action: islandHelicopter },
    { text: "Hide In Gift Shop", action: () => continueGame(260, 20, "You escaped into the gift shop and found souvenir shells.", false, true) },
    { text: "Run Into The Jungle", action: jungleEscape }
  ]);
}

function stealSpeedboat() {
  if (Math.random() < 0.55) {
    continueGame(900, 60, "Speedboat escape successful. You sold the boat for casino chips.");
  } else {
    goToJail("🚤 SPEEDBOAT FAIL 🚤", "You drove in a circle for 20 minutes and got arrested by cartoon coast guards.");
  }
}

function islandHelicopter() {
  if (Math.random() < 0.5) {
    continueGame(500, 35, "The helicopter pilot accepted shells and dropped you near the casino.");
  } else {
    showChoice("🚁 WRONG HELICOPTER 🚁", "It was a sightseeing tour. Now everyone is uncomfortable.", [
      { text: "Jump To Pirate Ship", action: pirateShip },
      { text: "Try Speedboat", action: stealSpeedboat },
      { text: "Beach Slot Machine", action: () => continueGame(180, 15, "You got stranded beside a suspicious beach slot machine.", false, true) }
    ]);
  }
}

function jungleEscape() {
  if (Math.random() < 0.45) {
    continueGame(650, 40, "You found a hidden beach exit and a bag of premium shells.", false, true);
  } else {
    showChoice("🌴 LOST IN THE JUNGLE 🌴", "A parrot keeps yelling bad financial advice.", [
      { text: "Listen To Parrot", action: () => continueGame(120, 10, "The parrot gave you questionable shell advice.", false, true) },
      { text: "Back To Island Choices", action: suspiciousIsland }
    ]);
  }
}

function showIslandChoices() {
  onIsland = true;

  showChoice("🐚 OUT OF SHELLS 🐚", "You lost all your shells. The island economy is somehow worse than the casino.", [
    { text: "Collect Shells On Beach", action: () => continueGame(80, 10, "You collected shiny beach shells.", false, true) },
    { text: "Sell Coconut Water", action: coconutStand },
    { text: "Build Raft Back To Casino", action: raftEscape },
    { text: "Crab Poker Tournament", action: crabTournament },
    { text: "Give Up And Reset", action: resetGame }
  ]);
}

function coconutStand() {
  if (Math.random() < 0.6) {
    continueGame(220, 20, "Coconut water business is booming. You are rich in shells.", false, true);
  } else {
    continueGame(45, 5, "Nobody bought coconut water, but a crab donated shells.", false, true);
  }
}

function raftEscape() {
  if (Math.random() < 0.5) {
    continueGame(700, 45, "Your raft worked. You floated back to the casino with converted shell money.");
  } else {
    continueGame(90, 10, "The raft spun in circles. You found more shells instead.", false, true);
  }
}

function crabTournament() {
  if (Math.random() < 0.5) {
    continueGame(500, 35, "You defeated the crab poker champion. The beach respects you.", false, true);
  } else {
    continueGame(35, 5, "The crab bluffed you. You got pity shells.", false, true);
  }
}

function showMomCardChoice() {
  showChoice("💳 MOM CARD INCIDENT 💳", "You consider using Mom's card. Terrible plan. She is probably already watching.", [
    { text: "Try Mom's Card", action: tryMomCard },
    { text: "Do Something Less Suspicious", action: showSideHustles }
  ]);
}

function tryMomCard() {
  momCardTried = true;

  if (Math.random() < 0.7) {
    showChoice("👩 MOM CAUGHT YOU 👩", "Mom says your full name and assigns emergency chores.", [
      { text: "Do Chores For Coins", action: () => continueGame(120, 10, "Chore money acquired. The mop remembers.") },
      { text: "Run To Chaos Menu", action: showChaosChoices }
    ]);
  } else {
    continueGame(300, 20, "Somehow it worked in cartoon logic. Do not question it.");
  }
}

function showSideHustles() {
  showChoice("🧦 DESPERATE SIDE QUESTS 🧦", "Pick a ridiculous path back to the reels.", [
    { text: "Sell Legendary Sock", action: () => continueGame(250, 15, "The sock collector paid way too much.") },
    { text: "Search Couch Cushions", action: couchCushions },
    { text: "Open Lemonade Stand", action: () => continueGame(180, 10, "Lemonade profits secured.") },
    { text: "Challenge Casino Mascot", action: mascotDuel },
    { text: "Finally Quit", action: resetGame }
  ]);
}

function couchCushions() {
  if (Math.random() < 0.5) {
    continueGame(90, 10, "You found coins, crumbs, and one mysterious button.");
  } else {
    showChoice("🛋️ NOTHING BUT LINT 🛋️", "The couch had no coins. It did have emotional damage.", [
      { text: "Try Another Side Quest", action: showSideHustles },
      { text: "Chaos Menu", action: showChaosChoices }
    ]);
  }
}

function mascotDuel() {
  if (Math.random() < 0.5) {
    continueGame(700, 40, "You defeated the casino mascot in a dance battle.");
  } else {
    goToJail("🐔 MASCOT BETRAYAL 🐔", "The mascot was undercover security. Prison time.");
  }
}

function goToJail(title, text) {
  onIsland = false;

  showChoice(title, text, [
    { text: "Enter Prison Yard", action: () => continueGame(35, 5, "You lost your coins. You now gamble with rocks.", true) }
  ]);
}

function showPrisonChoices() {
  showChoice("⛓️ OUT OF ROCKS ⛓️", "You lost all your rocks. The prison yard economy is brutal.", [
    { text: "Collect Rocks In Yard", action: () => continueGame(40, 5, "You collected premium gambling rocks.", true) },
    { text: "Trade Soup For Rocks", action: tradeSoup },
    { text: "Dig Cartoon Tunnel", action: digTunnel },
    { text: "Prison Rock Tournament", action: prisonTournament },
    { text: "Serve Your Time", action: resetGame }
  ]);
}

function tradeSoup() {
  if (Math.random() < 0.6) {
    continueGame(75, 10, "Soup trade complete. You are rich in rocks.", true);
  } else {
    continueGame(15, 5, "The soup was too watery. You got pity rocks.", true);
  }
}

function digTunnel() {
  if (Math.random() < 0.45) {
    continueGame(600, 35, "You escaped through a cartoon tunnel and found a wallet full of casino chips.");
  } else {
    continueGame(25, 5, "Tunnel collapsed into the snack room. You found rocks.", true);
  }
}

function prisonTournament() {
  if (Math.random() < 0.5) {
    continueGame(200, 15, "You won the prison rock tournament. The rat applauds.", true);
  } else {
    continueGame(20, 5, "You lost the tournament but got participation rocks.", true);
  }
}

function maxBet() {
  betEl.value = Math.min(balance, inPrison ? 20 : onIsland ? 35 : 50);

  if (inPrison) {
    messageEl.textContent = "Max rock bet set!";
  } else if (onIsland) {
    messageEl.textContent = "Max shell bet set!";
  } else {
    messageEl.textContent = "Max bet set!";
  }
}

function resetGame() {
  balance = 100;
  spinning = false;
  usedLifeSavings = false;
  bankRequested = false;
  momCardTried = false;
  inPrison = false;
  onIsland = false;
  betEl.value = 10;
  lastWinEl.textContent = 0;
  gameEl.classList.remove("game-over-mode", "not-started");
  slotsEl.classList.remove("spinning", "win");
  setSlots(["🍒", "🍋", "🍇"]);
  messageEl.textContent = "Place your bet and spin!";
  updateBalance();
}

function startGame() {
  gameEl.classList.remove("not-started");
  resetGame();
}

function unlockAdmin() {
  diceClicks++;

  if (diceClicks >= 2) {
    gameEl.classList.add("admin-unlocked");
    diceSecret.textContent = "🛠️";
  }
}

function closeAdmin() {
  adminPanel.classList.remove("open");
}

function adminAddMoney(amount) {
  gameEl.classList.remove("not-started", "game-over-mode");
  balance += amount;
  messageEl.textContent = `Admin added ${amount} ${currencyName()}.`;
  updateBalance();
}

function runAdminAction(action) {
  closeAdmin();

  if (action === "coins500") adminAddMoney(500);
  if (action === "coins5000") adminAddMoney(5000);
  if (action === "normal") continueGame(1000, 50, "Admin sent you back to the casino.");
  if (action === "prison") continueGame(150, 10, "Admin activated prison mode.", true);
  if (action === "life") {
    usedLifeSavings = false;
    balance = 0;
    handleGameOver();
  }
  if (action === "bank") showBankChoice();
  if (action === "chaos") showChaosChoices();
  if (action === "mom") showMomCardChoice();
  if (action === "side") showSideHustles();
  if (action === "wild") showWildScenarios();
  if (action === "crypto") cryptoCave();
  if (action === "alien") alienCasino();
  if (action === "time") timeMachine();
  if (action === "pirate") pirateShip();
  if (action === "island") suspiciousIsland();
  if (action === "jail") goToJail("🚓 ADMIN JAIL WARP 🚓", "Admin sent you directly to prison.");
  if (action === "prisonChoices") {
    inPrison = true;
    onIsland = false;
    showPrisonChoices();
  }
  if (action === "gameOver") {
    balance = 0;
    handleGameOver();
  }
}

diceSecret.addEventListener("click", unlockAdmin);
adminOpenBtn.addEventListener("click", () => adminPanel.classList.add("open"));
adminCloseBtn.addEventListener("click", closeAdmin);
startBtn.addEventListener("click", startGame);
spinBtn.addEventListener("click", spin);
maxBetBtn.addEventListener("click", maxBet);
resetBtn.addEventListener("click", resetGame);

document.querySelectorAll("[data-admin]").forEach(button => {
  button.addEventListener("click", () => runAdminAction(button.dataset.admin));
});

updateBalance();
