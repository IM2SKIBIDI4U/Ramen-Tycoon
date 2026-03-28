// ==========================================
// MASSIVE UPGRADE DATA (4 SEPARATE TRACKS)
// ==========================================

const TRACK_TABLES = [
    { name: "Buy Table 2", cost: 50 }, { name: "Buy Table 3", cost: 200 },
    { name: "Buy Table 4", cost: 1000 }, { name: "Buy Table 5", cost: 5000 },
    { name: "Buy Table 6", cost: 25000 }, { name: "Buy Table 7", cost: 100000 },
    { name: "Buy Table 8", cost: 500000 }, { name: "Buy Table 9", cost: 2500000 },
    { name: "Buy Table 10", cost: 10000000 }
];

const TRACK_RECIPES = [
    { name: "Shio Ramen", cost: 150, value: 100 }, { name: "Shoyu Ramen", cost: 500, value: 250 },
    { name: "Miso Ramen", cost: 1500, value: 600 }, { name: "Spicy Beef", cost: 4500, value: 1500 },
    { name: "Tonkotsu", cost: 12000, value: 3500 }, { name: "Seafood Bowl", cost: 30000, value: 8000 },
    { name: "Chicken Paitan", cost: 75000, value: 18000 }, { name: "Veggie Delight", cost: 150000, value: 35000 },
    { name: "Tsukemen", cost: 350000, value: 80000 }, { name: "Curry Ramen", cost: 800000, value: 180000 },
    { name: "Black Garlic", cost: 2000000, value: 450000 }, { name: "Truffle Oil", cost: 5000000, value: 1000000 },
    { name: "Wagyu Beef", cost: 12000000, value: 2500000 }, { name: "Gold Leaf", cost: 30000000, value: 6000000 },
    { name: "Dragon Breath", cost: 75000000, value: 15000000 }, { name: "Phoenix Fire", cost: 200000000, value: 40000000 },
    { name: "Kraken Squid", cost: 500000000, value: 100000000 }, { name: "Leviathan Soup", cost: 1000000000, value: 250000000 },
    { name: "Cosmic Broth", cost: 2500000000, value: 600000000 }, { name: "Galactic Ramen", cost: 10000000000, value: 2500000000 }
];

const TRACK_AUTO = [
    { name: "Hire Chef (Auto)", cost: 400, speed: 2500 },
    { name: "Knife Skills (Fast)", cost: 2000, speed: 1800 },
    { name: "Pro Chef", cost: 10000, speed: 1200 },
    { name: "Master Chef", cost: 50000, speed: 700 },
    { name: "Ninja Chef", cost: 250000, speed: 400 },
    { name: "God Chef", cost: 1000000, speed: 150 }
];

const TRACK_MULT = [
    { name: "Tip Jar (x2)", cost: 1000, mult: 2 },
    { name: "Cozy Decor (x5)", cost: 8000, mult: 5 },
    { name: "VIP Lounge (x10)", cost: 40000, mult: 10 },
    { name: "Golden Bowls (x25)", cost: 250000, mult: 25 },
    { name: "Diamond Sticks (x100)", cost: 2000000, mult: 100 },
    { name: "Michelin Star (x500)", cost: 15000000, mult: 500 },
    { name: "Emperor's Blessing (x5000)", cost: 500000000, mult: 5000 }
];

// ==========================================
// GAME STATE (V3 SAVE SYSTEM)
// ==========================================
let gameState = {
    wallet: 0,
    vault: 0,
    tablesOwned: 1,
    
    // Track indices
    idxTable: 0,
    idxRecipe: 0,
    idxAuto: 0,
    idxMult: 0,

    // Active Stats
    currentMenuName: "Basic Ramen",
    currentMenuPrice: 50,
    chefOwned: false,
    chefSpeed: 0, // 0 means no chef
    moneyMultiplier: 1
};

let seats = Array.from({length: 10}, () => ({ occupied: false, isServed: false, colorIndex: 0 }));
const shirtColors = ["#a2d2ff", "#ffc8dd", "#bde0fe", "#ffafcc", "#cdb4db"];

loadGame();
updateUI();
runCustomerLoop();
if (gameState.chefOwned) runChefLoop();

// --- THE ROBLOX ATM ---
function collectVault() {
    if (gameState.vault > 0) {
        gameState.wallet += gameState.vault;
        gameState.vault = 0;
        saveGame();
        updateUI();
    }
}

// --- GAME LOGIC ---
function customerArrives() {
    let emptySeats = [];
    let tablesToScan = gameState.tablesOwned || 1;

    for(let i = 0; i < tablesToScan; i++) {
        if(seats[i] && !seats[i].occupied) emptySeats.push(i);
    }

    if (emptySeats.length > 0) {
        let rIndex = emptySeats[Math.floor(Math.random() * emptySeats.length)];
        seats[rIndex].occupied = true;
        seats[rIndex].isServed = false;
        seats[rIndex].colorIndex = Math.floor(Math.random() * shirtColors.length);
        updateUI();
    }
}

function serveCustomer(index) {
    if (seats[index].occupied && !seats[index].isServed) {
        seats[index].isServed = true; 
        
        // Calculate Total Value
        let finalValue = gameState.currentMenuPrice * gameState.moneyMultiplier;
        
        let seatEl = document.getElementById(`seat-${index}`);
        let bowl = document.createElement('div');
        bowl.className = 'sliding-bowl';
        bowl.innerText = '🍜';
        seatEl.appendChild(bowl);

        setTimeout(() => {
            seatEl.innerHTML = `<span class="served-anim" style="font-size:1.1rem; color:#00b894;">+$${formatMoney(finalValue)}</span>`;
            
            setTimeout(() => {
                gameState.vault += finalValue;
                seats[index].occupied = false;
                seats[index].isServed = false;
                saveGame();
                updateUI();
            }, 800); 

        }, 600); 
    }
}

// --- UPGRADE BUYERS ---
function buyTable() {
    let upg = TRACK_TABLES[gameState.idxTable];
    if (upg && gameState.wallet >= upg.cost) {
        gameState.wallet -= upg.cost;
        gameState.tablesOwned++;
        gameState.idxTable++;
        saveGame(); updateUI();
    }
}

function buyRecipe() {
    let upg = TRACK_RECIPES[gameState.idxRecipe];
    if (upg && gameState.wallet >= upg.cost) {
        gameState.wallet -= upg.cost;
        gameState.currentMenuName = upg.name;
        gameState.currentMenuPrice = upg.value;
        gameState.idxRecipe++;
        saveGame(); updateUI();
    }
}

function buyAuto() {
    let upg = TRACK_AUTO[gameState.idxAuto];
    if (upg && gameState.wallet >= upg.cost) {
        gameState.wallet -= upg.cost;
        let wasNoChef = !gameState.chefOwned;
        gameState.chefOwned = true;
        gameState.chefSpeed = upg.speed;
        gameState.idxAuto++;
        saveGame(); updateUI();
        if (wasNoChef) runChefLoop(); // Start the loop if just bought
    }
}

function buyMult() {
    let upg = TRACK_MULT[gameState.idxMult];
    if (upg && gameState.wallet >= upg.cost) {
        gameState.wallet -= upg.cost;
        gameState.moneyMultiplier = upg.mult;
        gameState.idxMult++;
        saveGame(); updateUI();
    }
}

// --- TIMERS ---
function runCustomerLoop() { 
    customerArrives(); 
    // Max 10 tables, speeds up arrival time
    let speed = Math.max(500, 2500 - (gameState.tablesOwned * 200));
    setTimeout(runCustomerLoop, speed); 
}

function runChefLoop() {
    if(gameState.chefOwned && gameState.chefSpeed > 0) {
        let tablesToScan = gameState.tablesOwned || 1;
        for(let i=0; i < tablesToScan; i++) {
            if(seats[i] && seats[i].occupied && !seats[i].isServed) {
                serveCustomer(i);
                break; // Serve one per tick
            }
        }
    }
    // Call again based on current speed
    if (gameState.chefOwned) {
        setTimeout(runChefLoop, gameState.chefSpeed);
    }
}

// --- UTILS & UI ---
function formatMoney(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    return num.toLocaleString();
}

function renderPad(elementId, trackArray, currentIndex, trackClass, buyFunction, title) {
    let container = document.getElementById(elementId);
    let nextUpgrade = trackArray[currentIndex];

    if (!nextUpgrade) {
        container.innerHTML = `<button class="tycoon-pad maxed">${title}<br>MAXED OUT</button>`;
    } else {
        let canAfford = gameState.wallet >= nextUpgrade.cost;
        let affordClass = canAfford ? `affordable ${trackClass}` : "";
        container.innerHTML = `
            <button class="tycoon-pad ${affordClass}" onclick="${buyFunction}()">
                <b>${title}</b><br><br>
                ${nextUpgrade.name}<br>
                <span style="font-size: 0.8em;">$${formatMoney(nextUpgrade.cost)}</span>
            </button>
        `;
    }
}

function updateUI() {
    document.getElementById('money').innerText = "$" + formatMoney(gameState.wallet);
    document.getElementById('vault-money').innerText = "$" + formatMoney(gameState.vault);
    document.getElementById('stat-menu').innerText = `${gameState.currentMenuName} ($${formatMoney(gameState.currentMenuPrice)})`;
    document.getElementById('stat-mult').innerText = `x${gameState.moneyMultiplier.toLocaleString()}`;

    let safeTables = gameState.tablesOwned || 1;

    seats.forEach((seat, i) => {
        let seatEl = document.getElementById(`seat-${i}`);
        if (i >= safeTables) {
            seatEl.classList.add('locked'); return;
        } else {
            seatEl.classList.remove('locked');
        }
        
        if (seat.occupied && !seat.isServed && !seatEl.innerHTML.includes('customer-wrapper')) {
            let shirtColor = shirtColors[seat.colorIndex];
            seatEl.innerHTML = `
                <div class="customer-wrapper">
                    <div class="person">
                        <div class="head"></div>
                        <div class="body" style="background: ${shirtColor};"></div>
                    </div>
                    <span class="order-tag">${gameState.currentMenuName}</span>
                </div>
                <div class="belt-strip"></div>`;
            seatEl.style.borderColor = "#333";
        } else if (!seat.occupied && !seat.isServed) {
            seatEl.innerHTML = `<span class="empty-text">Click to Serve</span><div class="belt-strip"></div>`;
            seatEl.style.borderColor = "#ccc";
        }
    });

    // Render the 4 tracks
    renderPad('pad-table', TRACK_TABLES, gameState.idxTable, 'track-table', 'buyTable', '🪑 TABLES');
    renderPad('pad-recipe', TRACK_RECIPES, gameState.idxRecipe, 'track-recipe', 'buyRecipe', '🍲 RECIPES');
    renderPad('pad-auto', TRACK_AUTO, gameState.idxAuto, 'track-auto', 'buyAuto', '👨‍🍳 CHEFS');
    renderPad('pad-mult', TRACK_MULT, gameState.idxMult, 'track-mult', 'buyMult', '✨ BOOSTS');
}

// SAVE DATA VERSION 3!
function saveGame() { localStorage.setItem('ramenRobloxV3', JSON.stringify(gameState)); }
function loadGame() {
    let saved = localStorage.getItem('ramenRobloxV3');
    if(saved) {
        let parsed = JSON.parse(saved);
        gameState = { ...gameState, ...parsed };
    }
}
function resetGame() { localStorage.clear(); location.reload(); }

// 🛠️ ADMIN PANEL
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
function cheatMoney() { gameState.wallet += 10000000; saveGame(); updateUI(); }
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }
