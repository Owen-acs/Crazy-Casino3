var bet = 0;
var betOn = null;
var wins = 0;

const landedOnText = document.getElementById("landedOnText");
const rollBtn = document.getElementById("rollBtn");

function rollTheWheel() {
    let landOn = Math.floor(Math.random() * 38);
    if (landOn === 37) {
        landOn = "00";
    }
    landedOnText.textContent = `Landed on: ${landOn}`;
    let win;
    

}

rollBtn.addEventListener("click", rollTheWheel);
