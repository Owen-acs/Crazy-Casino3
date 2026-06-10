const balanceText = document.getElementById("balance-text");

var Coins;

function StartGame()
{
    Coins = 500;
    balanceText.innerText = `Your balance is ${Coins}`;
}
