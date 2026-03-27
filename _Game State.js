// Game State
let money = 0;
let bowlsSold = 0;
let chefCount = 0;
let chefCost = 50;

// DOM Elements
const moneyDisplay = document.getElementById('money');
const bowlsDisplay = document.getElementById('bowls');
const chefCountDisplay = document.getElementById('chef-count');
const cookBtn = document.getElementById('cook-btn');
const buyChefBtn = document.getElementById('buy-chef');

// Cooking Logic
function sellRamen() {
    money += 10;
    bowlsSold += 1;
    updateDisplay();
}

// Upgrade Logic
function buyChef() {
    if (money >= chefCost) {
        money -= chefCost;
        chefCount++;
        chefCost = Math.floor(chefCost * 1.5); // Increase price for next chef
        updateDisplay();
    }
}

// Update the UI
function updateDisplay() {
    moneyDisplay.innerText = money;
    bowlsDisplay.innerText = bowlsSold;
    chefCountDisplay.innerText = chefCount;
    buyChefBtn.innerText = `Hire Apprentice (Cost: $${chefCost})`;
    
    // Disable upgrade button if not enough money
    buyChefBtn.disabled = money < chefCost;
}

// Automatic Cooking (Idle Income)
setInterval(() => {
    if (chefCount > 0) {
        money += (chefCount * 10);
        bowlsSold += chefCount;
        updateDisplay();
    }
}, 1000);

// Event Listeners
cookBtn.addEventListener('click', sellRamen);
buyChefBtn.addEventListener('click', buyChef);