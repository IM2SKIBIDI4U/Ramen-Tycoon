// ==========================================
// EXPANDED DATA & MENUS
// ==========================================
// 1000 Tables potential
const TRACK_TABLES = []; let tCost = 50;
for (let i = 2; i <= 1000; i++) { TRACK_TABLES.push({ name: `Table ${i}`, cost: tCost }); tCost = Math.floor(tCost * 1.5); }

// 10 Specific Custom Ramen names, then it generates the rest up to 100
const RAMEN_NAMES = ["Basic Shoyu", "Miso Pork", "Spicy Tonkotsu", "Chicken Paitan", "Seafood Ramen", "Veggie Udon", "Truffle Ramen", "Wagyu Beef", "Dragon Fire", "Golden Emperor"];
const TRACK_RECIPES = []; let rCost = 150; let rVal = 100;
for (let i = 0; i < 100; i++) { 
    let rName = RAMEN_NAMES[i] || `Legendary Tier ${i+1}`;
    TRACK_RECIPES.push({ name: rName, cost: rCost, value: rVal }); 
    rCost = Math.floor(rCost * 1.5); rVal = Math.floor(rVal * 1.3); 
}

const TRACK_AUTO = [{ name: "Hire Kitchen Monkey", cost: 1000 }];

// 10 NEW SPECIAL UPGRADES
const TRACK_SPECIAL = [
    { name: "Neon Sign (Faster Spawns)", cost: 2000 },
    { name: "Comfy Chairs (+VIP Chance)", cost: 5000 },
    { name: "Bulk Noodles (Half Price)", cost: 10000 },
    { name: "Bulk Broth (Half Price)", cost: 15000 },
    { name: "Tip Jar (+10% Pay)", cost: 25000 },
    { name: "Arcade Machine ($/sec)", cost: 50000 },
    { name: "Fast Shoes (Monkey x2 Speed)", cost: 100000 },
    { name: "Golden Pots (x2 Pay)", cost: 500000 },
    { name: "Secret Spice (+50% Pay)", cost: 1000000 },
    { name: "Gold Leaf (+20% VIP)", cost: 5000000 }
];

let game = {
    wallet: 150, tablesOwned: 1,
    idxTable: 0, idxRecipe: 0, idxAuto: 0, idxSpecial: 0,
    currentMenuPrice: 50, chefOwned: false,
    inv: { noodle: 10, broth: 10, spice: 10, egg: 10 },
    upgrades: { fastSpawn: false, comfyChairs: false, cheapNoodle: false, cheapBroth: false, tipJar: false, arcade: false, fastMonkey: false, goldenPots: false, secretSpice: false, goldLeaf: false }
};

const shirtColors = ["#a2d2ff", "#ffc8dd", "#bde0fe", "#fdcb6e", "#00cec9"];
// Initialize 1000 table slots
let seats = Array.from({length: 1000}, () => ({ occupied: false, isCooking: false, cookStep: 0, colorIndex: 0, isVIP: false }));

// ==========================================
// TABS & INIT
// ==========================================
function switchTab(tab) {
    document.getElementById('view-dining').classList.remove('active-view');
    document.getElementById('view-kitchen').classList.remove('active-view');
    document.getElementById('btn-dining').classList.remove('active');
    document.getElementById('btn-kitchen').classList.remove('active');
    
    document.getElementById(`view-${tab}`).classList.add('active-view');
    document.getElementById(`btn-${tab}`).classList.add('active');
}

function initTables() {
    let diningArea = document.getElementById('dining-area');
    if (diningArea.children.length === 0) {
        for (let i = 0; i < 1000; i++) {
            let div = document.createElement('div');
            div.id = `seat-${i}`; div.className = 'seat locked';
            div.onclick = () => takeOrder(i);
            diningArea.appendChild(div);
        }
    }
}

// ==========================================
// PANTRY
// ==========================================
function buyIngredient(type, amount, cost) {
    // Apply bulk upgrade discounts
    if (type === 'noodle' && game.upgrades.cheapNoodle) cost = Math.floor(cost / 2);
    if (type === 'broth' && game.upgrades.cheapBroth) cost = Math.floor(cost / 2);

    if (game.wallet >= cost) {
        game.wallet -= cost;
        game.inv[type] += amount;
        document.getElementById('out-of-stock-msg').classList.add('hidden');
        updateUI(); saveGame();
    }
}

// ==========================================
// GAMEPLAY LOGIC (MANUAL COOKING)
// ==========================================
function customerArrives() {
    let emptySeats = [];
    for(let i = 0; i < game.tablesOwned; i++) { if(!seats[i].occupied) emptySeats.push(i); }
    
    if (emptySeats.length > 0) {
        let r = emptySeats[Math.floor(Math.random() * emptySeats.length)];
        seats[r].occupied = true; seats[r].isCooking = false; seats[r].cookStep = 0;
        seats[r].colorIndex = Math.floor(Math.random() * shirtColors.length);
        
        let vipChance = 0.05;
        if(game.upgrades.comfyChairs) vipChance += 0.05;
        if(game.upgrades.goldLeaf) vipChance += 0.20;
        seats[r].isVIP = Math.random() < vipChance;
        
        updateUI();
    }
    let spawnRate = game.upgrades.fastSpawn ? 1000 : 2500;
    setTimeout(customerArrives, spawnRate);
}

// Step 0: Take order in Dining Room, sends to Kitchen
function takeOrder(index) {
    if (seats[index].occupied && !seats[index].isCooking) {
        seats[index].isCooking = true;
        seats[index].cookStep = 0;
        updateUI(); updateKitchenUI();
    }
}

// Step 1 to 3: Clicking the Stoves in the Kitchen
function clickStove(index) {
    let seat = seats[index];
    if (!seat.isCooking) return;

    let msg = document.getElementById('out-of-stock-msg');
    
    if (seat.cookStep === 0) {
        // Boil: Needs Noodle + Broth
        if (game.inv.noodle < 1 || game.inv.broth < 1) { msg.classList.remove('hidden'); return false; }
        game.inv.noodle--; game.inv.broth--;
        seat.cookStep = 1;
    } 
    else if (seat.cookStep === 1) {
        // Season: Needs Spice
        if (game.inv.spice < 1) { msg.classList.remove('hidden'); return false; }
        game.inv.spice--;
        seat.cookStep = 2;
    } 
    else if (seat.cookStep === 2) {
        // Finish: Needs Egg
        if (game.inv.egg < 1) { msg.classList.remove('hidden'); return false; }
        game.inv.egg--;
        seat.cookStep = 3;
        
        // Visuals & Payout
        updateKitchenUI(); // Shows step 3 immediately
        let bowlEl = document.getElementById(`manual-bowl-${index}`);
        if(bowlEl) bowlEl.innerHTML += `<div class="egg-drop">🥚</div>`;
        
        setTimeout(() => finishCooking(index), 400); // Tiny delay to see egg
        return true;
    }
    
    updateUI(); updateKitchenUI();
    return true; // Used for monkey logic
}

function finishCooking(index) {
    if (seats[index].occupied && seats[index].isCooking) {
        let multiplier = seats[index].isVIP ? 10 : 1;
        if(game.upgrades.tipJar) multiplier += 0.1;
        if(game.upgrades.goldenPots) multiplier *= 2;
        if(game.upgrades.secretSpice) multiplier *= 1.5;

        game.wallet += (game.currentMenuPrice * multiplier);
        
        seats[index].occupied = false; 
        seats[index].isCooking = false;
        seats[index].isVIP = false;
        
        saveGame(); updateUI(); updateKitchenUI();
    }
}

// ==========================================
// MONKEY & PASSIVE
// ==========================================
function runMonkeyLoop() {
    if(game.chefOwned) {
        for(let i = 0; i < game.tablesOwned; i++) {
            if(seats[i].occupied) {
                if(!seats[i].isCooking) { takeOrder(i); break; }
                else if(seats[i].cookStep < 3) { clickStove(i); break; }
            }
        }
    }
    let speed = game.upgrades.fastMonkey ? 250 : 600;
    setTimeout(runMonkeyLoop, speed);
}

// Arcade passive income
setInterval(() => {
    if(game.upgrades.arcade) { game.wallet += 10; updateUI(); }
}, 1000);

// ==========================================
// UPGRADES & UI
// ==========================================
function buyTable() { let u = TRACK_TABLES[game.idxTable]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; saveGame(); updateUI(); updateKitchenUI(); } }
function buyRecipe() { let u = TRACK_RECIPES[game.idxRecipe]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.currentMenuPrice = u.value; document.getElementById('stat-menu').innerText = u.name + ` ($${formatMoney(u.value)})`; game.idxRecipe++; saveGame(); updateUI(); } }
function buyAuto() { let u = TRACK_AUTO[game.idxAuto]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.chefOwned = true; game.idxAuto++; saveGame(); updateUI(); runMonkeyLoop(); } }
function buySpecial() { 
    let u = TRACK_SPECIAL[game.idxSpecial]; 
    if (u && game.wallet >= u.cost) { 
        game.wallet -= u.cost; 
        // Apply logic
        if(game.idxSpecial === 0) game.upgrades.fastSpawn = true;
        if(game.idxSpecial === 1) game.upgrades.comfyChairs = true;
        if(game.idxSpecial === 2) game.upgrades.cheapNoodle = true;
        if(game.idxSpecial === 3) game.upgrades.cheapBroth = true;
        if(game.idxSpecial === 4) game.upgrades.tipJar = true;
        if(game.idxSpecial === 5) game.upgrades.arcade = true;
        if(game.idxSpecial === 6) game.upgrades.fastMonkey = true;
        if(game.idxSpecial === 7) game.upgrades.goldenPots = true;
        if(game.idxSpecial === 8) game.upgrades.secretSpice = true;
        if(game.idxSpecial === 9) game.upgrades.goldLeaf = true;
        game.idxSpecial++; saveGame(); updateUI(); 
    } 
}

function formatMoney(n) {
    if (n >= 1e15) return (n / 1e15).toFixed(2) + "Q";
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    return Math.floor(n).toLocaleString();
}

function renderPad(id, track, idx, func, title) {
    let container = document.getElementById(id); let u = track[idx];
    if (!u) { container.innerHTML = `<button class="tycoon-pad" style="background:#333; border-color:#000;">${title}<br>MAXED OUT</button>`; } 
    else {
        let afford = game.wallet >= u.cost ? "affordable" : "";
        container.innerHTML = `<button class="tycoon-pad ${afford}" onclick="${func}()"><b>${title}</b><br>${u.name}<br>$${formatMoney(u.cost)}</button>`;
    }
}

function updateUI() {
    document.getElementById('money').innerText = "$" + formatMoney(game.wallet);
    document.getElementById('inv-noodle').innerText = game.inv.noodle;
    document.getElementById('inv-broth').innerText = game.inv.broth;
    document.getElementById('inv-spice').innerText = game.inv.spice;
    document.getElementById('inv-egg').innerText = game.inv.egg;

    seats.forEach((seat, i) => {
        let el = document.getElementById(`seat-${i}`); if (!el) return;
        if (i >= game.tablesOwned) { el.classList.add('locked'); return; } else { el.classList.remove('locked'); }
        
        let html = "";
        if (seat.occupied) {
            if (seat.isVIP) html += `<div class="vip-panda">🐼</div>`;
            else html += `<div class="customer-wrapper"><div class="person"><div class="head"></div><div class="body" style="background: ${shirtColors[seat.colorIndex]};"></div></div></div>`;
            
            if (seat.isCooking) html += `<span class="status-text cooking">In Kitchen</span>`;
            else html += `<span class="status-text order">Take Order!</span>`;
        } else {
            html += `<span class="status-text empty" style="color:#aaa;">Empty</span>`;
        }
        html += `<div class="belt-strip"></div>`;
        
        let stateString = `${seat.occupied}-${seat.isCooking}-${seat.isVIP}`;
        if (el.getAttribute('data-state') !== stateString) {
            el.innerHTML = html; el.setAttribute('data-state', stateString);
        }
    });

    renderPad('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑 TABLES');
    renderPad('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲 RECIPES');
    renderPad('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🐒 STAFF');
    renderPad('pad-special', TRACK_SPECIAL, game.idxSpecial, 'buySpecial', '✨ BUSINESS');
}

function updateKitchenUI() {
    let container = document.getElementById('stoves-container');
    container.innerHTML = ""; // Clear and rebuild
    
    seats.forEach((seat, i) => {
        if (seat.occupied && seat.isCooking) {
            let labelText = ["Click to Boil", "Click to Season", "Add Egg", "Done!"][seat.cookStep];
            
            let stove = document.createElement('div');
            stove.className = "stove-station";
            stove.onclick = () => clickStove(i);
            stove.innerHTML = `
                <div class="stove-label">${labelText}</div>
                <div class="manual-bowl step-${seat.cookStep}" id="manual-bowl-${i}"></div>
                <div class="stove-burner"></div>
            `;
            container.appendChild(stove);
        }
    });
}

// ==========================================
// GOD PANEL ADMIN CHEATS
// ==========================================
let typed = "";
document.addEventListener('keydown', (e) => {
    typed += e.key.toLowerCase();
    if (typed.endsWith("rafay is cool")) { document.getElementById('admin-panel').classList.remove('hidden'); typed = ""; }
    if (typed.length > 20) typed = typed.slice(-20);
});

function cheatMoney(amt) { game.wallet += amt; saveGame(); updateUI(); }
function adminMaxIngredients() { 
    game.inv.noodle += 1000000000; game.inv.broth += 1000000000; game.inv.spice += 1000000000; game.inv.egg += 1000000000; 
    document.getElementById('out-of-stock-msg').classList.add('hidden');
    saveGame(); updateUI(); 
}
function adminMaxTables() { game.tablesOwned = 1000; game.idxTable = 999; saveGame(); updateUI(); updateKitchenUI(); }
function adminForceVIPs() {
    let spawned = 0;
    for(let i=0; i<game.tablesOwned; i++) {
        if(!seats[i].occupied && spawned < 10) {
            seats[i].occupied = true; seats[i].isCooking = false; seats[i].cookStep = 0; seats[i].isVIP = true; spawned++;
        }
    }
    updateUI(); closeAdmin();
}
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }

// ==========================================
// SAVE/LOAD
// ==========================================
function saveGame() { localStorage.setItem('RamenGodChef_V1', JSON.stringify(game)); }
function loadGame() { 
    let s = localStorage.getItem('RamenGodChef_V1'); 
    if(s) { 
        let parsed = JSON.parse(s);
        game = { ...game, ...parsed }; 
        if(!game.upgrades) game.upgrades = { fastSpawn: false, comfyChairs: false, cheapNoodle: false, cheapBroth: false, tipJar: false, arcade: false, fastMonkey: false, goldenPots: false, secretSpice: false, goldLeaf: false };
        if(game.idxRecipe > 0) document.getElementById('stat-menu').innerText = TRACK_RECIPES[game.idxRecipe-1].name + ` ($${formatMoney(game.currentMenuPrice)})`;
    } 
}
function resetGame() { if(confirm("Erase history?")) { localStorage.clear(); location.reload(); } }

initTables(); loadGame(); updateUI(); updateKitchenUI(); customerArrives();
if (game.chefOwned) runMonkeyLoop();
