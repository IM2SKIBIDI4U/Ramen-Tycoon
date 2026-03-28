// --- DATABASE & TRACKS ---
const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi"];
function formatMoney(n) {
    if (n < 1000) return Math.floor(n).toString();
    let suffixNum = Math.floor(Math.log10(n) / 3);
    let shortValue = n / Math.pow(10, suffixNum * 3);
    return shortValue.toFixed(2) + suffixes[suffixNum];
}

const TRACK_TABLES = []; let tCost = 150;
for (let i = 2; i <= 50; i++) { TRACK_TABLES.push({ name: `Table ${i}`, cost: tCost }); tCost = Math.floor(tCost * 2); }

const TRACK_RECIPES = [
    { name: "Shoyu", cost: 400, value: 100 },
    { name: "Miso", cost: 2000, value: 250 },
    { name: "Tonkotsu", cost: 10000, value: 600 },
    { name: "Spicy Beef", cost: 50000, value: 1500 },
    { name: "Golden Ramen", cost: 250000, value: 5000 }
];

const TRACK_WOK = [
    { name: "Double Wok", cost: 5000 },
    { name: "Triple Wok", cost: 50000 },
    { name: "Mega Wok", cost: 500000 }
];

const TRACK_AUTO = [
    { name: "Hire Host Monkey", cost: 500 },
    { name: "Rollerblades", cost: 2500 },
    { name: "Espresso", cost: 15000 },
    { name: "Jetpacks", cost: 100000 }
];

const TRACK_SPECIAL = [
    { name: "Neon Sign", cost: 3000, key: "fastSpawn" },
    { name: "Tip Jar", cost: 10000, key: "tipJar" }
];

// --- INITIAL STATE ---
let game = {
    wallet: 300, monkeyMoney: 0, turfMult: 1, lastSaveTime: Date.now(),
    tablesOwned: 1, idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxSpecial: 0, currentMenuPrice: 50,
    staff: { waiter: 0, ninja: 0, mascot: 0 },
    inv: { noodle: 50, broth: 50, spice: 50, egg: 50 },
    upgrades: { fastSpawn: false, tipJar: false },
    activeDecor: 'theme-default', decorOwned: ['theme-default']
};

let seats = Array.from({length: 50}, () => ({ occupied: false, needsMenu: false, isCooking: false, cookStep: 0, needsServing: false, needsToPay: false, patience: 100, charData: null }));
let waitList = [];
let isRushHour = false;
let rushMultiplier = 1;

// --- CORE FUNCTIONS ---
function switchTab(tab) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active-view'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${tab}`).classList.add('active-view');
    document.getElementById(`btn-${tab}`).classList.add('active');
}

function customerArrives() {
    if (waitList.length < 5) {
        waitList.push({ skin: "#ffdbac", shirt: "#e74c3c" });
        renderWaitList();
    }
    for (let i = 0; i < game.tablesOwned; i++) {
        if (!seats[i].occupied && waitList.length > 0) {
            seats[i].occupied = true;
            seats[i].charData = waitList.shift();
            seats[i].needsMenu = true;
            seats[i].patience = 100;
            renderWaitList();
            break;
        }
    }
    setTimeout(customerArrives, game.upgrades.fastSpawn ? 1500 : 3000);
}

function renderWaitList() {
    document.getElementById('wait-list').innerHTML = waitList.map(() => `🚶`).join(' ');
}

// --- MONKEY AI & CLICKS ---
function handleTableClick(index) {
    let s = seats[index];
    if (!s.occupied) return;

    if (s.needsMenu) {
        // Monkey/Player takes order -> Stove appears
        s.needsMenu = false;
        s.isCooking = true;
        s.cookStep = 0;
    } else if (s.needsServing) {
        s.needsServing = false;
        s.needsToPay = true;
    } else if (s.needsToPay) {
        let tip = game.upgrades.tipJar ? 1.2 : 1;
        game.wallet += (game.currentMenuPrice * tip * game.turfMult);
        s.occupied = false;
        s.needsToPay = false;
        s.charData = null;
    }
    updateUI();
    updateKitchenUI();
}

function clickStove(index) {
    let s = seats[index];
    if (!s.isCooking) return;

    if (s.cookStep === 0 && game.inv.noodle > 0 && game.inv.broth > 0) {
        game.inv.noodle--; game.inv.broth--; s.cookStep = 1;
    } else if (s.cookStep === 1 && game.inv.spice > 0) {
        game.inv.spice--; s.cookStep = 2;
    } else if (s.cookStep === 2 && game.inv.egg > 0) {
        game.inv.egg--; s.cookStep = 3;
        setTimeout(() => {
            s.isCooking = false;
            s.needsServing = true;
            updateUI();
            updateKitchenUI();
        }, 300);
    }
    updateUI();
    updateKitchenUI();
}

function runMonkeyLoop() {
    if (game.idxAuto > 0) {
        for (let i = 0; i < game.tablesOwned; i++) {
            let s = seats[i];
            if (!s.occupied) continue;
            // Monkeys do everything except Step 0-3 cooking
            if (s.needsMenu || s.needsServing || s.needsToPay) {
                handleTableClick(i);
                break; 
            }
        }
    }
    let speed = [0, 3000, 2000, 1000, 500][game.idxAuto] || 500;
    setTimeout(runMonkeyLoop, speed);
}

// --- UI RENDERING ---
function updateUI() {
    document.getElementById('money').innerText = "$" + formatMoney(game.wallet);
    document.getElementById('inv-noodle').innerText = game.inv.noodle;
    document.getElementById('inv-broth').innerText = game.inv.broth;
    document.getElementById('inv-spice').innerText = game.inv.spice;
    document.getElementById('inv-egg').innerText = game.inv.egg;

    let dArea = document.getElementById('dining-area');
    dArea.innerHTML = "";
    for (let i = 0; i < game.tablesOwned; i++) {
        let s = seats[i];
        let div = document.createElement('div');
        div.className = "seat";
        if (s.occupied) {
            let status = s.needsMenu ? "📜?" : (s.needsServing ? "🍜!" : (s.needsToPay ? "💰" : "⌛"));
            div.innerHTML = `<div class="patience-container"><div class="patience-fill" style="width:${s.patience}%; background:${s.patience < 30 ? 'red':'green'}"></div></div>
                             <div style="font-size:2rem; text-align:center;">${status}</div>
                             <div class="rpg-char" style="--skin:${s.charData.skin}; --shirt:${s.charData.shirt};"><div class="rpg-head"></div><div class="rpg-body"></div></div>`;
        } else {
            div.innerHTML = `<span style="color:#ccc; font-size:0.7rem;">Empty</span>`;
        }
        div.onclick = () => handleTableClick(i);
        dArea.appendChild(div);
    }

    renderPad('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑 TABLE');
    renderPad('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲 RECIPE');
    renderPad('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🐒 MONKEY');
}

function updateKitchenUI() {
    let container = document.getElementById('stoves-container');
    container.innerHTML = "";
    let count = 0;
    seats.forEach((s, i) => {
        if (s.occupied && s.isCooking) {
            count++;
            let div = document.createElement('div');
            div.className = "stove-station";
            div.onclick = () => clickStove(i);
            let egg = s.cookStep === 3 ? `<div class="egg-drop">🥚</div>` : "";
            div.innerHTML = `<div class="stove-label">Table ${i+1}</div><div class="manual-bowl step-${s.cookStep}">${egg}</div>`;
            container.appendChild(div);
        }
    });
    if (count === 0) container.innerHTML = "<p>Wait for an order...</p>";
}

function renderPad(id, track, idx, func, title) {
    let el = document.getElementById(id);
    let u = track[idx];
    if (!u) { el.innerHTML = `<button class="tycoon-pad" disabled>MAX</button>`; return; }
    let aff = game.wallet >= u.cost ? "affordable" : "";
    el.innerHTML = `<button class="tycoon-pad ${aff}" onclick="${func}()">${title}<br>${u.name}<br>$${formatMoney(u.cost)}</button>`;
}

// --- ACTIONS ---
function buyTable() { let u = TRACK_TABLES[game.idxTable]; if(game.wallet >= u.cost){ game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; updateUI(); } }
function buyRecipe() { let u = TRACK_RECIPES[game.idxRecipe]; if(game.wallet >= u.cost){ game.wallet -= u.cost; game.currentMenuPrice = u.value; game.idxRecipe++; updateUI(); } }
function buyAuto() { let u = TRACK_AUTO[game.idxAuto]; if(game.wallet >= u.cost){ game.wallet -= u.cost; game.idxAuto++; if(game.idxAuto===1) runMonkeyLoop(); updateUI(); } }
function buyIngredient(type, amt, cost) { if(game.wallet >= cost){ game.wallet -= cost; game.inv[type] += amt; updateUI(); } }

// --- ADMIN ---
document.addEventListener('keydown', (e) => {
    if(!window.typed) window.typed = "";
    window.typed += e.key;
    if(window.typed.includes("rafay is cool")) { document.getElementById('admin-panel').classList.remove('hidden'); window.typed=""; }
});
function setCustomMoney() { game.wallet = parseInt(document.getElementById('custom-money').value) || 0; updateUI(); }
function adminMaxIngredients() { game.inv = {noodle:999, broth:999, spice:999, egg:999}; updateUI(); }
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }

// --- INIT ---
setInterval(() => {
    seats.forEach(s => { 
        if(s.occupied && !s.isCooking) { 
            s.patience -= 0.5; 
            if(s.patience <= 0) { s.occupied = false; s.charData = null; } 
        }
    });
    updateUI();
}, 500);

updateUI();
updateKitchenUI();
customerArrives();
