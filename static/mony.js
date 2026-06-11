const STORAGE_KEY = "crazy-casino-mony";

function loadBalances() {
    try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (_) {}
    return { Chips: 500, Rocks: 0, Shells: 0, Dollars: 0 };
}

function saveBalances() {
    sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ Chips, Rocks, Shells, Dollars })
    );
}

const saved = loadBalances();
export var Chips = saved.Chips ?? 500;
export var Rocks = saved.Rocks ?? 0;
export var Shells = saved.Shells ?? 0;
export var Dollars = saved.Dollars ?? 0;

export var chipsValue = 2
export var RocksValue = 0.5
export var ShellsValue = 3
export var DollarsValue = 1

export function Convert(type, quantity, toType)
{
    var rates = {
        chips: chipsValue,
        rocks: RocksValue,
        shells: ShellsValue,
        dollars: DollarsValue
    }

    var from = String(type).toLowerCase()
    var to = String(toType).toLowerCase()

    if (!rates.hasOwnProperty(from) || !rates.hasOwnProperty(to))
    {
        return
    }

    if (from === to)
    {
        return
    }

    quantity = Number(quantity)
    if (isNaN(quantity) || quantity <= 0)
    {
        return
    }

    // Convert source quantity to dollars, then to target currency
    var dollarsAmount = quantity * rates[from]
    var targetAmount = dollarsAmount / rates[to]

    // round to 4 decimal places to avoid floating precision noise
    targetAmount = Math.round(targetAmount * 10000) / 10000

    // subtract from source balance
    if (from === 'chips') Chips -= quantity
    else if (from === 'rocks') Rocks -= quantity
    else if (from === 'shells') Shells -= quantity
    else if (from === 'dollars') Dollars -= quantity

    // add to target balance
    if (to === 'chips') AddChips(targetAmount)
    else if (to === 'rocks') AddRocks(targetAmount)
    else if (to === 'shells') AddShells(targetAmount)
    else if (to === 'dollars') AddDollars(targetAmount)

    saveBalances();
}

export function addChips(amount) {
    Chips += amount;
    saveBalances();
}

export function spendChips(amount) {
    Chips = Math.max(0, Chips - amount);
    saveBalances();
}

