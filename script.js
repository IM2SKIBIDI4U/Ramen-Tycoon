// ==========================================
// 🚀 PROCEDURAL GENERATION (INFINITE TYCOON)
// ==========================================

// 1. Generate 100 Tables
const TRACK_TABLES = [];
let tableCost = 50;
for (let i = 2; i <= 101; i++) {
    TRACK_TABLES.push({ name: `Buy Table ${i}`, cost: tableCost });
    tableCost = Math.floor(tableCost * 1.6); 
}

// 2. Generate 1000 Ramen Recipes
const TRACK_RECIPES = [];
let recipeCost = 150;
let recipeVal = 100;
const prefixes = ["Basic", "Spicy", "Deluxe", "Golden", "Diamond", "Neon", "Cyber", "Quantum", "Galactic", "Divine", "Omniversal"];
const bases = ["Shio", "Shoyu", "Miso", "Tonkotsu", "Udon", "Wagyu", "Dragon", "Leviathan", "Stardust"];

for (let i = 1; i <= 1000; i++) {
    let p = prefixes[Math.floor((i - 1) / 100) % prefixes.length];
    let b = bases[(i - 1) % bases.length];
    TRACK_RECIPES.push({ name: `Tier ${i}: ${p} ${b}`, cost: recipeCost, value: recipeVal });
    recipeCost = Math.floor(recipeCost * 1.35); 
    recipeVal = Math.floor(recipeVal * 1.25);   
}

// 3. Generate 100 Chef Upgrades
const TRACK_AUTO = [];
let chefCost = 400;
let chefSpeed = 2500; 
for (let i = 1; i <= 100; i++) {
    let title = i === 1 ? "Hire Chef" : `Chef Level ${i}`;
    TRACK_AUTO.push({ name: title, cost: chefCost, speed: Math.max(50, chefSpeed) });
    chefCost = Math.floor(chefCost * 1.7);
    chefSpeed = Math.floor(chefSpeed * 0.92); 
}

// 4. Generate 100 Multipliers
const TRACK_MULT = [];
let multCost = 1000;
let multVal = 2;
for (let i = 1; i <= 100; i++) {
    TRACK_MULT.push({ name: `Boost x${multVal}`, cost: multCost, mult: multVal });
    multCost = Math.floor(multCost * 2.1); 
    multVal += Math.floor(multVal * 0.5);  
}

// ==========================================
// GAME STATE
// ==========================================
let gameState = {
    wallet: 0, vault: 0, tablesOwned: 1,
    idxTable: 0, idxRecipe: 0, idxAuto: 0, idxMult: 0,
    currentMenuName: "Starter Noodles", currentMenuPrice: 50,
    chefOwned: false, chefSpeed: 0, moneyMultiplier: 1
};

// Array for 100 tables
let seats = Array.from({length: 100}, () => ({ occupied: false, isServed: false, colorIndex: 0 }));
const shirtColors = ["#a2d2ff", "#ffc8dd", "#bde0fe", "#ffafcc", "#cdb4db", "#fdcb6e", "#00cec9"];

loadGame();
initTables(); 
updateUI();
runCustomerLoop();
if (gameState.chefOwned) runChefLoop();

// --- BUILD HTML TABLES DYNAMICALLY ---
function initTables() {
    let diningArea = document.getElementById('dining-area');
    if (diningArea.children.length === 0) {
        for (let i = 0; i < 100; i++) {
            let div = document.createElement('div');
            div.id = `seat-${i}`;
            div.className = 'seat locked';
            div.onclick = () => serveCustomer(i);
            diningArea.appendChild(div);
        }
    }
}

// --- ATM ---
function collectVault() {
    if (gameState.vault > 0) {
        gameState.wallet += gameState.vault;
        gameState.vault = 0;
        saveGame(); updateUI();
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
        let finalValue = gameState.currentMenuPrice * gameState.moneyMultiplier;
        
        let seatEl = document.getElementById(`seat-${index}`);
        let bowl = document.createElement('div');
        bowl.className = 'sliding-bowl'; bowl.innerText = '🍜';
        seatEl.appendChild(bowl);

        setTimeout(() => {
            seatEl.innerHTML = `<span class="served-anim" style="font-size:1rem; color:#00b894;">+$${formatMoney(finalValue)}</span>`;
            setTimeout(() => {
                gameState.vault += finalValue;
                seats[index].occupied = false;
                seats[index].isServed = false;
                saveGame(); updateUI();
            }, 800); 
        }, 600); 
    }
}

// --- UPGRADES ---
function buyTable() {
    let upg = TRACK_TABLES[gameState.idxTable];
    if (upg && gameState.wallet >= upg.cost) {
        gameState.wallet -= upg.cost; gameState.tablesOwned++; gameState.idxTable++;
        saveGame(); updateUI();
    }
}
function buyRecipe() {
    let upg = TRACK_RECIPES[gameState.idxRecipe];
    if (upg && gameState.wallet >= upg.cost) {
        gameState.wallet -= upg.cost; gameState.currentMenuName = upg.name; gameState.currentMenuPrice = upg.value; gameState.idxRecipe++;
        saveGame(); updateUI();
    }
}
function buyAuto() {
    let upg = TRACK_AUTO[gameState.idxAuto];
    if (upg && gameState.wallet >= upg.cost) {
        gameState.wallet -= upg.cost; let wasNoChef = !gameState.chefOwned;
        gameState.chefOwned = true; gameState.chefSpeed = upg.speed; gameState.idxAuto++;
        saveGame(); updateUI();
        if (wasNoChef) runChefLoop();
    }
}
function buyMult() {
    let upg = TRACK_MULT[gameState.idxMult];
    if (upg && gameState.wallet >= upg.cost) {
        gameState.wallet -= upg.cost; gameState.moneyMultiplier = upg.mult; gameState.idxMult++;
        saveGame(); updateUI();
    }
}

// --- LOOPS ---
function runCustomerLoop() { 
    customerArrives(); 
    let speed = Math.max(100, 2000 - (gameState.tablesOwned * 50)); 
    setTimeout(runCustomerLoop, speed); 
}
function runChefLoop() {
    if(gameState.chefOwned && gameState.chefSpeed > 0) {
        let tablesToScan = gameState.tablesOwned || 1;
        for(let i=0; i < tablesToScan; i++) {
            if(seats[i] && seats[i].occupied && !seats[i].isServed) {
                serveCustomer(i);
                break; 
            }
        }
    }
    if (gameState.chefOwned) setTimeout(runChefLoop, gameState.chefSpeed);
}

// --- FORMATTING ---
function formatMoney(num) {
    if (num >= 1e18) return (num / 1e18).toFixed(2) + "Qi";
    if (num >= 1e15) return (num / 1e15).toFixed(2) + "Qa";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
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
        container.innerHTML = `<button class="tycoon-pad ${affordClass}" onclick="${buyFunction}()"><b>${title}</b><br><br>${nextUpgrade.name}<br><span style="font-size: 0.8em;">$${formatMoney(nextUpgrade.cost)}</span></button>`;
    }
}

function updateUI() {
    document.getElementById('money').innerText = "$" + formatMoney(gameState.wallet);
    document.getElementById('vault-money').innerText = "$" + formatMoney(gameState.vault);
    document.getElementById('stat-menu').innerText = `${gameState.currentMenuName} ($${formatMoney(gameState.currentMenuPrice)})`;
    document.getElementById('stat-mult').innerText = `x${formatMoney(gameState.moneyMultiplier)}`;

    let safeTables = gameState.tablesOwned || 1;
    seats.forEach((seat, i) => {
        let seatEl = document.getElementById(`seat-${i}`);
        if (!seatEl) return;
        if (i >= safeTables) {
            seatEl.classList.add('locked'); return;
        } else {
            seatEl.classList.remove('locked');
        }
        
        if (seat.occupied && !seat.isServed && !seatEl.innerHTML.includes('customer-wrapper')) {
            let shirtColor = shirtColors[seat.colorIndex];
            seatEl.innerHTML = `<div class="customer-wrapper"><div class="person"><div class="head"></div><div class="body" style="background: ${shirtColor};"></div></div><span class="order-tag">Tier ${Math.max(1, gameState.idxRecipe)}</span></div><div class="belt-strip"></div>`;
            seatEl.style.borderColor = "#333";
        } else if (!seat.occupied && !seat.isServed) {
            seatEl.innerHTML = `<span class="empty-text">Click to Serve</span><div class="belt-strip"></div>`;
            seatEl.style.borderColor = "#ccc";
        }
    });

    renderPad('pad-table', TRACK_TABLES, gameState.idxTable, 'track-table', 'buyTable', '🪑 TABLES');
    renderPad('pad-recipe', TRACK_RECIPES, gameState.idxRecipe, 'track-recipe', 'buyRecipe', '🍲 RECIPES');
    renderPad('pad-auto', TRACK_AUTO, gameState.idxAuto, 'track-auto', 'buyAuto', '👨‍🍳 CHEFS');
    renderPad('pad-mult', TRACK_MULT, gameState.idxMult, 'track-mult', 'buyMult', '✨ BOOSTS');
}

// SAVE V5 (Brand new save file to prevent old data from breaking it)
function saveGame() { localStorage.setItem('ramenRobloxV5', JSON.stringify(gameState)); }
function loadGame() {
    let saved = localStorage.getItem('ramenRobloxV5');
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
    if (typedKeys === secretCode) { document.getElementById('admin-panel').classList.remove('hidden'); typedKeys = ""; }
});
function cheatMoney() { gameState.wallet += 1e15; saveGame(); updateUI(); } // 1 Quadrillion!
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }
