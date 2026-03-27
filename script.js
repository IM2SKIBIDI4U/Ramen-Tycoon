// --- THE RAMEN DATABASE (16 Types!) ---
const RAMEN_DB = [
    { name: "Basic Ramen", price: 10 }, { name: "Shio", price: 15 },
    { name: "Shoyu", price: 25 }, { name: "Miso", price: 40 },
    { name: "Tonkotsu", price: 65 }, { name: "Spicy Beef", price: 100 },
    { name: "Seafood", price: 150 }, { name: "Veggie", price: 220 },
    { name: "Chicken Paitan", price: 300 }, { name: "Tsukemen", price: 450 },
    { name: "Kuro Mayu", price: 600 }, { name: "Truffle Shio", price: 900 },
    { name: "Wagyu Beef", price: 1500 }, { name: "Lobster Tail", price: 2500 },
    { name: "Emperor's Gold", price: 5000 }, { name: "Dragon's Breath", price: 10000 }
];

// --- INITIAL STATE ---
let gameState = {
    money: 0,
    menuLevel: 0, // How many recipes unlocked
    chefLevel: 0, // 0 = no chef. 1+ = faster chef
    marketingLevel: 0,
    hasVIP: false,
    hasGolden: false,
    
    // Speeds in milliseconds
    chefSpeed: 2000, 
    arrivalSpeed: 3000
};

// 10 Seats array
let seats = Array.from({length: 10}, () => ({ occupied: false, orderName: "", orderPrice: 0, isVIP: false }));

// --- RUN ON START ---
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
        
        // Pick a random unlocked ramen
        let availableMenu = RAMEN_DB.slice(0, gameState.menuLevel + 1);
        let chosen = availableMenu[Math.floor(Math.random() * availableMenu.length)];
        
        seats[rIndex].occupied = true;
        seats[rIndex].orderName = chosen.name;
        seats[rIndex].orderPrice = chosen.price;
        
        // VIP Chance (10% chance if upgraded)
        seats[rIndex].isVIP = (gameState.hasVIP && Math.random() < 0.1);

        updateUI();
    }
}

function serveCustomer(index) {
    if (seats[index].occupied) {
        let basePrice = seats[index].orderPrice;
        
        // Apply Multipliers
        if (seats[index].isVIP) basePrice *= 5;
        if (gameState.hasGolden) basePrice *= 2;
        
        let seatEl = document.getElementById(`seat-${index}`);
        let customerDiv = seatEl.querySelector('.customer');
        
        if(customerDiv) {
            customerDiv.innerHTML = `<span style="font-weight:bold; font-size:1.2rem;">+$${basePrice.toLocaleString()}</span>`;
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
    let cost = 100 * Math.pow(2, gameState.menuLevel); // Price doubles every time
    if (gameState.money >= cost && gameState.menuLevel < RAMEN_DB.length - 1) {
        gameState.money -= cost;
        gameState.menuLevel++;
        saveGame();
        updateUI();
    }
}

function buyChef() {
    let cost = gameState.chefLevel === 0 ? 250 : 500 * gameState.chefLevel;
    if (gameState.money >= cost && gameState.chefLevel < 5) { // Max level 5
        gameState.money -= cost;
        gameState.chefLevel++;
        gameState.chefSpeed = 2000 - (gameState.chefLevel * 300); // Gets faster
        saveGame();
        updateUI();
    }
}

function buyMarketing() {
    let cost = 150 * Math.pow(2, gameState.marketingLevel);
    if (gameState.money >= cost && gameState.marketingLevel < 5) {
        gameState.money -= cost;
        gameState.marketingLevel++;
        gameState.arrivalSpeed = 3000 - (gameState.marketingLevel * 400); // Gets faster
        saveGame();
        updateUI();
    }
}

function buyVIP() {
    if (gameState.money >= 2000 && !gameState.hasVIP) {
        gameState.money -= 2000;
        gameState.hasVIP = true;
        saveGame();
        updateUI();
    }
}

function buyGoldenBowls() {
    if (gameState.money >= 5000 && !gameState.hasGolden) {
        gameState.money -= 5000;
        gameState.hasGolden = true;
        saveGame();
        updateUI();
    }
}

// --- TIMERS (Using dynamic loops instead of strict intervals) ---

function runCustomerLoop() {
    customerArrives();
    setTimeout(runCustomerLoop, gameState.arrivalSpeed);
}

function runChefLoop() {
    if(gameState.chefLevel > 0) {
        let occupied = [];
        seats.forEach((s, i) => { if(s.occupied) occupied.push(i); });
        if(occupied.length > 0) serveCustomer(occupied[0]); // Chef serves first found
    }
    setTimeout(runChefLoop, gameState.chefSpeed);
}

// --- UTILITY ---

function updateUI() {
    // Top Bar
    document.getElementById('money').innerText = "$" + gameState.money.toLocaleString();
    document.getElementById('top-menu').innerText = RAMEN_DB[gameState.menuLevel].name;
    document.getElementById('multiplier-text').innerText = gameState.hasGolden ? "x2" : "x1";

    // Seats
    seats.forEach((seat, i) => {
        let seatEl = document.getElementById(`seat-${i}`);
        if (seat.occupied && !seatEl.innerHTML.includes('customer')) {
            let emoji = seat.isVIP ? "🤑" : "👤";
            let vipClass = seat.isVIP ? "vip-customer" : "";
            seatEl.innerHTML = `<div class="customer ${vipClass}">${emoji}<br><span class="order-tag">${seat.orderName}</span></div>`;
            seatEl.style.borderColor = seat.isVIP ? "gold" : "#e63946";
        } else if (!seat.occupied) {
            seatEl.innerHTML = `<span class="empty-text">Empty</span>`;
            seatEl.style.borderColor = "#ccc";
        }
    });

    // Button states & Prices
    let btnRecipe = document.getElementById('btn-recipe');
    if (gameState.menuLevel >= RAMEN_DB.length - 1) {
        btnRecipe.innerText = "All Recipes Unlocked!";
        btnRecipe.disabled = true;
    } else {
        let recipeCost = 100 * Math.pow(2, gameState.menuLevel);
        btnRecipe.innerText = `Research: ${RAMEN_DB[gameState.menuLevel+1].name} ($${recipeCost.toLocaleString()})`;
        btnRecipe.disabled = gameState.money < recipeCost;
    }

    let btnChef = document.getElementById('btn-chef');
    if (gameState.chefLevel >= 5) {
        btnChef.innerText = "Chef Max Speed!";
        btnChef.disabled = true;
    } else {
        let chefCost = gameState.chefLevel === 0 ? 250 : 500 * gameState.chefLevel;
        let prefix = gameState.chefLevel === 0 ? "Hire Chef" : `Upgrade Chef Lv${gameState.chefLevel + 1}`;
        btnChef.innerText = `${prefix} ($${chefCost.toLocaleString()})`;
        btnChef.disabled = gameState.money < chefCost;
    }

    let btnMark = document.getElementById('btn-marketing');
    if (gameState.marketingLevel >= 5) {
        btnMark.innerText = "Max Marketing!";
        btnMark.disabled = true;
    } else {
        let markCost = 150 * Math.pow(2, gameState.marketingLevel);
        btnMark.innerText = `Marketing Lv${gameState.marketingLevel + 1} ($${markCost.toLocaleString()})`;
        btnMark.disabled = gameState.money < markCost;
    }

    let btnVIP = document.getElementById('btn-vip');
    btnVIP.disabled = (gameState.money < 2000 || gameState.hasVIP);
    if(gameState.hasVIP) btnVIP.innerText = "VIP Seating Unlocked!";

    let btnGold = document.getElementById('btn-golden');
    btnGold.disabled = (gameState.money < 5000 || gameState.hasGolden);
    if(gameState.hasGolden) btnGold.innerText = "Golden Bowls Active!";
}

// SAVE/LOAD logic merges old saves with new features so you don't lose money!
function saveGame() { localStorage.setItem('ramenSaveV2', JSON.stringify(gameState)); }
function loadGame() {
    let saved = localStorage.getItem('ramenSaveV2') || localStorage.getItem('ramenSave');
    if(saved) {
        let parsed = JSON.parse(saved);
        gameState = { ...gameState, ...parsed }; // Merges old data safely
    }
}
function resetGame() { localStorage.clear(); location.reload(); }

// ==========================================
// 🛠️ SECRET ADMIN PANEL (Still works!)
// ==========================================
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
function cheatMoney() { gameState.money += 10000; saveGame(); updateUI(); } // Buffed cheat to $10k!
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }
