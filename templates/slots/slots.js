// Slots game logic: reels, betting, balance, free spins, life-savings, UI updates
(function () {
  const symbols = [
    { s: '🍒', w: 40, pay: 2 },
    { s: '🍋', w: 30, pay: 2 },
    { s: '🍊', w: 15, pay: 3 },
    { s: '🔔', w: 8, pay: 5 },
    { s: '💎', w: 5, pay: 10 },
    { s: '7️⃣', w: 2, pay: 25 }
  ];

  const reelEls = Array.from(document.querySelectorAll('.reel'));
  const balanceEl = document.getElementById('balanceValue');
  const lifeEl = document.getElementById('lifeValue');
  const freeEl = document.getElementById('freeValue');
  const winEl = document.getElementById('winValue');
  const betInput = document.getElementById('betInput');
  const spinBtn = document.getElementById('spinBtn');
  const freeSpinBtn = document.getElementById('freeSpinBtn');
  const message = document.getElementById('message');
  const actionPanel = document.getElementById('actionPanel');
  const actionText = document.getElementById('actionText');
  const actionButtons = document.getElementById('actionButtons');
  const resetBtn = document.getElementById('resetBtn');
  const maxBetBtn = document.getElementById('maxBetBtn');

  let spinning = false;

  // parse initial values from DOM (fallback defaults)
  let balance = parseCurrency(balanceEl.textContent) || 250;
  let lifeSavings = parseCurrency(lifeEl.textContent) || 600;
  let freeSpins = parseInt(freeEl.textContent, 10) || 1;
  let lastWin = parseCurrency(winEl.textContent) || 0;

  function parseCurrency(text) {
    const n = parseInt((text || '').replace(/[^0-9-]/g, ''), 10);
    return Number.isNaN(n) ? 0 : n;
  }

  function fmt(n) {
    return '$' + n.toString();
  }

  function updateUI() {
    balanceEl.textContent = fmt(balance);
    lifeEl.textContent = fmt(lifeSavings);
    freeEl.textContent = String(freeSpins);
    winEl.textContent = fmt(lastWin);
    betInput.min = 5;
    betInput.step = 5;
    if (balance < 5 && freeSpins <= 0 && lifeSavings <= 0) {
      spinBtn.disabled = true;
      message.textContent = 'Out of money — try resetting or add life savings.';
    } else {
      spinBtn.disabled = false;
    }
  }

  function weightedRandom() {
    const total = symbols.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    for (const sym of symbols) {
      if (r < sym.w) return sym;
      r -= sym.w;
    }
    return symbols[0];
  }

  function spinOnce(useFree) {
    if (spinning) return;
    let bet = Math.max(5, Math.floor(Number(betInput.value) || 5));
    bet = Math.max(5, Math.floor(bet / 5) * 5);

    if (!useFree && balance < bet) {
      // Not enough funds; offer life savings
      if (lifeSavings > 0) {
        showAction('Insufficient balance. Use life savings to refill your balance?', [
          { label: 'Use life savings', action: () => { balance += lifeSavings; lifeSavings = 0; hideAction(); updateUI(); spinOnce(false); } },
          { label: 'Cancel', action: () => { hideAction(); } }
        ]);
      } else {
        message.textContent = 'Not enough balance. Try a smaller bet or use a free spin.';
      }
      return;
    }

    spinning = true;
    message.textContent = useFree ? 'Using free spin…' : 'Spinning… good luck!';
    if (!useFree) balance -= bet;
    updateUI();

    // start spin animation
    reelEls.forEach((r) => { r.classList.add('spin'); r.textContent = '❔'; });

    // determine results (staggered stops)
    const results = [weightedRandom(), weightedRandom(), weightedRandom()];

    const stopDelay = [700, 920, 1180];
    results.forEach((res, i) => {
      setTimeout(() => {
        reelEls[i].classList.remove('spin');
        reelEls[i].textContent = res.s;
        // small pop animation on stop
        reelEls[i].classList.add('win');
        setTimeout(() => reelEls[i].classList.remove('win'), 700);
        // last reel resolves payout
        if (i === results.length - 1) {
          finalize(results, bet, useFree);
        }
      }, stopDelay[i]);
    });
  }

  function finalize(results, bet, usedFree) {
    // Check matches
    const symStr = results.map((r) => r.s).join('|');
    let payout = 0;
    const counts = {};
    results.forEach(r => counts[r.s] = (counts[r.s] || 0) + 1);
    const top = Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
    const topCount = counts[top] || 0;

    if (topCount === 3) {
      // three of a kind
      const symObj = symbols.find(x=>x.s===top);
      payout = bet * (symObj ? symObj.pay * 3 : 8);
      message.textContent = `Jackpot! ${symObj ? symObj.s : ''} x3 — you win ${fmt(payout)}!`;
    } else if (topCount === 2) {
      const symObj = symbols.find(x=>x.s===top);
      payout = bet * (symObj ? Math.max(2, symObj.pay) : 2);
      message.textContent = `Nice! Two matching symbols — you win ${fmt(payout)}.`;
    } else {
      // small random consolation chance
      if (Math.random() < 0.06) {
        payout = Math.floor(bet * 0.5);
        message.textContent = `Lucky! Small consolation ${fmt(payout)}.`;
      } else {
        message.textContent = usedFree ? 'Free spin ended. No win.' : 'No win. Try again!';
      }
    }

    if (payout > 0) {
      balance += payout;
      lastWin = payout;
      // bonus reward: small chance to grant free spin
      if (Math.random() < 0.12) { freeSpins += 1; message.textContent += ' Bonus free spin awarded!'; }
    }

    // if used free spin, decrement
    if (usedFree) freeSpins = Math.max(0, freeSpins - 1);

    // unlock small life boost if balance goes negative (defensive)
    if (balance < 0 && lifeSavings > 0) {
      showAction('Balance negative. Use life savings to recover?', [
        { label: 'Use life savings', action: () => { balance += lifeSavings; lifeSavings = 0; hideAction(); updateUI(); } },
        { label: 'Decline', action: () => { hideAction(); } }
      ]);
    }

    updateUI();
    spinning = false;
  }

  function showAction(text, buttons) {
    actionText.textContent = text;
    actionButtons.innerHTML = '';
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.textContent = b.label;
      btn.className = 'primary-btn';
      btn.addEventListener('click', b.action);
      actionButtons.appendChild(btn);
    });
    actionPanel.classList.remove('hidden');
  }

  function hideAction() {
    actionPanel.classList.add('hidden');
    actionText.textContent = '';
    actionButtons.innerHTML = '';
  }

  // wire controls
  spinBtn.addEventListener('click', () => spinOnce(false));
  freeSpinBtn.addEventListener('click', () => {
    if (freeSpins <= 0) { message.textContent = 'No free spins available.'; return; }
    spinOnce(true);
  });

  maxBetBtn.addEventListener('click', () => {
    const max = Math.max(5, balance);
    betInput.value = Math.max(5, Math.floor(max / 5) * 5);
  });

  resetBtn.addEventListener('click', () => {
    balance = 250; lifeSavings = 600; freeSpins = 1; lastWin = 0; hideAction(); updateUI();
    reelEls.forEach(r => r.textContent = '?');
    message.textContent = 'Game reset.';
  });

  // init
  updateUI();
  // small idle animation on reels
  reelEls.forEach((r, i) => {
    r.addEventListener('click', () => {
      r.classList.add('win');
      setTimeout(() => r.classList.remove('win'), 500);
    });
  });

})();
