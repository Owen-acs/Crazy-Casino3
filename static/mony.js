var Chips = 500
var Rocks = 0
var Shells = 0
var Dollars = 0

var chipsValue = 2
var RocksValue = 0.5
var ShellsValue = 3
var DollarsValue = 1

function AddChips(amount)
{
    Chips += amount
}

function AddRocks(amount)
{
    Rocks += amount
}

function AddShells(amount)
{
    Shells += amount
}

function AddDollars(amount)
{
    Dollars += amount
}
function Convert(type, quantity, toType)
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
}


