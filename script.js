// --- MASSIVELY BUFFED ECONOMY ---
const RAMEN_DB = [
    { name: "Basic Ramen", price: 50 },          // Buffed from 10
    { name: "Shio", price: 150 },                // Buffed from 15
    { name: "Shoyu", price: 400 },               // Buffed from 25
    { name: "Miso", price: 1000 },               // Buffed from 40
    { name: "Tonkotsu", price: 3000 },           // Buffed from 65
    { name: "Spicy Beef", price: 8000 },         // Buffed from 100
    { name: "Seafood", price: 20000 },           // Big jump
    { name: "Veggie", price: 50000 },
    { name: "Chicken Paitan", price: 120000 },
    { name: "Tsukemen", price: 300000 },         // Now you are making big money
    { name: "Kuro Mayu", price: 750000 },
    { name: "Truffle Shio", price: 1500000 },
    { name: "Wagyu Beef", price: 3000000 },
    { name: "Lobster Tail", price: 5000000 },
    { name: "Emperor's Gold", price: 8000000 },
    { name: "Dragon's Breath", price: 15000000 } // You are a billionaire now.
];

// --- INITIAL STATE ---
let gameState = {
    money: 0,
    menuLevel: 0, 
    chefLevel: 0, 
    marketingLevel: 0,
    hasVIP: false,
    hasGolden: false,
    chefSpeed: 2000, 
    arrivalSpeed: 3000
};

let seats = Array.from({length: 10}, () => ({ occupied: false, orderName: "", orderPrice: 0, isVIP: false, colorIndex: 0 }));

// Random shirt colors for realism
const shirtColors = ["#457b9d", "#e63946", "#2a9d8f", "#8338ec", "#ffb703", "#3a0ca3"];

loadGame();
updateUI();
runCustomerLoop();
runChefLoop();

// --- GAME LOGIC ---

function customerArrives() {
    let emptySeats = [];
    seats.forEach((s, i) => { if(!s.occupied) emptySeats.push(i); });

    if (emptySeats.length > 0) {
        let rIndex = emptySeats[Math.floor(Math.random() * emptySeats.length)];
        let availableMenu = RAMEN_DB.slice(0, gameState.menuLevel + 1);
        let chosen = availableMenu[Math.floor(Math.random() * availableMenu.length)];
        
        seats[rIndex].occupied = true;
        seats[rIndex].orderName = chosen.name;
        seats[rIndex].orderPrice = chosen.price;
        seats[rIndex].isVIP = (gameState.hasVIP && Math.random() < 0.1);
        seats[rIndex].colorIndex = Math.floor(Math.random() * shirtColors.length);

        updateUI();
    }
}

function serveCustomer(index) {
    if (seats[index].occupied) {
        let basePrice = seats[index].orderPrice;
        if (seats[index].isVIP) basePrice *= 5;
        if (gameState.hasGolden) basePrice *= 2;
        
        let seatEl = document.getElementById(`seat-${index}`);
        let customerDiv = seatEl.querySelector('.customer-wrapper');
        
        if(customerDiv) {
            customerDiv.innerHTML = `<span style="font-weight:bold; font-size:1.2rem; color:#2a9d8f;">+$${basePrice.toLocaleString()}</span>`;
            customerDiv.classList.add('served-anim');
        }

        setTimeout(() => {
            gameState.money += basePrice;
            seats[index].occupied = false;
            saveGame();
            updateUI();
        }, 500); 
    }
}

// --- UPGRADE FUNCTIONS ---

function buyRecipe() {
    let cost = 100 * Math.pow(2.2, gameState.menuLevel); 
    if (gameState.money >= cost && gameState.menuLevel < RAMEN_DB.length - 1) {
        gameState.money -= cost;
        gameState.menuLevel++;
        saveGame();
        updateUI();
    }
}

function buyChef() {
    let cost = gameState.chefLevel === 0 ? 250 : 500 * Math.pow(3, gameState.chefLevel);
    if (gameState.money >= cost && gameState.chefLevel < 5) {
        gameState.money -= cost;
        gameState.chefLevel++;
        gameState.chefSpeed = 2000 - (gameState.chefLevel * 300);
        saveGame();
        updateUI();
    }
}

function buyMarketing() {
    let cost = 150 * Math.pow(3, gameState.marketingLevel);
    if (gameState.money >= cost && gameState.marketingLevel < 5) {
        gameState.money -= cost;
        gameState.marketingLevel++;
        gameState.arrivalSpeed = 3000 - (gameState.marketingLevel * 400);
        saveGame();
        updateUI();
    }
}

function buyVIP() {
    if (gameState.money >= 20000 && !gameState.hasVIP) {
        gameState.money -= 20000;
        gameState.hasVIP = true;
        saveGame();
        updateUI();
    }
}

function buyGoldenBowls() {
    if (gameState.money >= 50000 && !gameState.hasGolden) {
        gameState.money -= 50000;
        gameState.hasGolden = true;
        saveGame();
        updateUI();
    }
}

// --- TIMERS ---
function runCustomerLoop() { customerArrives(); setTimeout(runCustomerLoop, gameState.arrivalSpeed); }
function runChefLoop() {
    if(gameState.chefLevel > 0) {
        let occupied = [];
        seats.forEach((s, i) => { if(s.occupied) occupied.push(i); });
        if(occupied.length > 0) serveCustomer(occupied[0]); 
    }
    setTimeout(runChefLoop, gameState.chefSpeed);
}

// --- UTILITY ---

function updateUI() {
    document.getElementById('money').innerText = "$" + gameState.money.toLocaleString();
    document.getElementById('top-menu').innerText = RAMEN_DB[gameState.menuLevel].name;
    document.getElementById('multiplier-text').innerText = gameState.hasGolden ? "x2" : "x1";

    seats.forEach((seat, i) => {
        let seatEl = document.getElementById(`seat-${i}`);
        
        // This injects the new realistic CSS people!
        if (seat.occupied && !seatEl.innerHTML.includes('customer-wrapper')) {
            let vipClass = seat.isVIP ? "vip-person" : "";
            let shirtColor = seat.isVIP ? "gold" : shirtColors[seat.colorIndex];
            
            seatEl.innerHTML = `
                <div class="customer-wrapper">
                    <div class="person ${vipClass}">
                        <div class="head"></div>
                        <div class="body" style="background: ${shirtColor}"></div>
                    </div>
                    <span class="order-tag">${seat.orderName}</span>
                </div>`;
            seatEl.style.borderColor = seat.isVIP ? "gold" : "#e63946";
            
        } else if (!seat.occupied) {
            seatEl.innerHTML = `<span class="empty-text">Empty</span>`;
            seatEl.style.borderColor = "#ccc";
        }
    });

    let btnRecipe = document.getElementById('btn-recipe');
    if (gameState.menuLevel >= RAMEN_DB.length - 1) {
        btnRecipe.innerText = "All Recipes Unlocked!"; btnRecipe.disabled = true;
    } else {
        let recipeCost = 100 * Math.pow(2.2, gameState.menuLevel);
        btnRecipe.innerText = `Research: ${RAMEN_DB[gameState.menuLevel+1].name} ($${recipeCost.toLocaleString(undefined, {maximumFractionDigits:0})})`;
        btnRecipe.disabled = gameState.money < recipeCost;
    }

    let btnChef = document.getElementById('btn-chef');
    if (gameState.chefLevel >= 5) {
        btnChef.innerText = "Chef Max Speed!"; btnChef.disabled = true;
    } else {
        let chefCost = gameState.chefLevel === 0 ? 250 : 500 * Math.pow(3, gameState.chefLevel);
        let prefix = gameState.chefLevel === 0 ? "Hire Chef" : `Upgrade Chef Lv${gameState.chefLevel + 1}`;
        btnChef.innerText = `${prefix} ($${chefCost.toLocaleString()})`;
        btnChef.disabled = gameState.money < chefCost;
    }

    let btnMark = document.getElementById('btn-marketing');
    if (gameState.marketingLevel >= 5) {
        btnMark.innerText = "Max Marketing!"; btnMark.disabled = true;
    } else {
        let markCost = 150 * Math.pow(3, gameState.marketingLevel);
        btnMark.innerText = `Marketing Lv${gameState.marketingLevel + 1} ($${markCost.toLocaleString()})`;
        btnMark.disabled = gameState.money < markCost;
    }

    let btnVIP = document.getElementById('btn-vip');
    btnVIP.innerText = "VIP Seating (5x Tip Chance) ($20,000)";
    btnVIP.disabled = (gameState.money < 20000 || gameState.hasVIP);
    if(gameState.hasVIP) btnVIP.innerText = "VIP Seating Unlocked!";

    let btnGold = document.getElementById('btn-golden');
    btnGold.innerText = "Golden Bowls (2x All Money) ($50,000)";
    btnGold.disabled = (gameState.money < 50000 || gameState.hasGolden);
    if(gameState.hasGolden) btnGold.innerText = "Golden Bowls Active!";
}

function saveGame() { localStorage.setItem('ramenSaveV3', JSON.stringify(gameState)); }
function loadGame() {
    let saved = localStorage.getItem('ramenSaveV3') || localStorage.getItem('ramenSaveV2');
    if(saved) {
        let parsed = JSON.parse(saved);
        gameState = { ...gameState, ...parsed };
    }
}
function resetGame() { localStorage.clear(); location.reload(); }

// 🛠️ ADMIN PANEL (Buffed cheat to $1 Million!)
let secretCode = "rafay";
let typedKeys = "";
document.addEventListener('keydown', (e) => {
    typedKeys += e.key.toLowerCase();
    if (typedKeys.length > secretCode.length) typedKeys = typedKeys.slice(-secretCode.length);
    if (typedKeys === secretCode) {
        document.getElementById('admin-panel').classList.remove('hidden');
        typedKeys = ""; 
    }
});
function cheatMoney() { gameState.money += 1000000; saveGame(); updateUI(); }
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }
