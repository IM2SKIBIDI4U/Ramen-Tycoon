// --- INITIAL DATA ---
const charColors = {
    skin: ["#ffdbac", "#f1c27d", "#e0ac69", "#8d5524"],
    shirt: ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#1abc9c"]
};

const TRACK_TABLES = [
    { name: "Second Table", cost: 200 }, { name: "Third Table", cost: 800 },
    { name: "Fourth Table", cost: 2500 }, { name: "Fifth Table", cost: 7000 }
];

const TRACK_RECIPES = [
    { name: "Miso Ramen", cost: 500, value: 120 },
    { name: "Tonkotsu Ramen", cost: 2500, value: 300 },
    { name: "Spicy Garlic Ramen", cost: 10000, value: 750 }
];

const TRACK_AUTO = [
    { name: "Hire Intern Monkey", cost: 400 },
    { name: "Hire Full-Time Waiter", cost: 2000 },
    { name: "Give Monkey Rollerblades", cost: 10000 }
];

let game = {
    wallet: 300,
    tablesOwned: 1,
    idxTable: 0,
    idxRecipe: 0,
    idxAuto: 0,
    currentMenuPrice: 50,
    inv: { noodle: 50, broth: 50, spice: 50, egg: 50 }
};

let seats = Array.from({ length: 10 }, () => ({
    occupied: false,
    needsMenu: false,
    isCooking: false,
    cookStep: 0,
    needsServing: false,
    needsToPay: false,
    patience: 100,
    charData: null
}));

// --- CORE LOOPS ---
function switchTab(tab) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.add('hidden-view'));
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active-view'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`view-${tab}`).classList.add('active-view');
    document.getElementById(`view-${tab}`).classList.remove('hidden-view');
    event.currentTarget.classList.add('active');
}

function spawnCustomer() {
    for (let i = 0; i < game.tablesOwned; i++) {
        if (!seats[i].occupied) {
            seats[i].occupied = true;
            seats[i].needsMenu = true;
            seats[i].patience = 100;
            seats[i].charData = {
                skin: charColors.skin[Math.floor(Math.random() * charColors.skin.length)],
                shirt: charColors.shirt[Math.floor(Math.random() * charColors.shirt.length)]
            };
            break;
        }
    }
    setTimeout(spawnCustomer, 5000);
}

function runMonkeyAI() {
    if (game.idxAuto > 0) {
        for (let i = 0; i < game.tablesOwned; i++) {
            let s = seats[i];
            if (!s.occupied) continue;

            // Monkey priorities: 1. Collect Pay, 2. Serve Finished Food, 3. Take New Orders
            if (s.needsToPay) { handleTableClick(i); break; }
            if (s.needsServing) { handleTableClick(i); break; }
            if (s.needsMenu) { handleTableClick(i); break; }
        }
    }
    let speed = [0, 3000, 1500, 800][game.idxAuto] || 800;
    setTimeout(runMonkeyAI, speed);
}

// --- INTERACTIONS ---
function handleTableClick(index) {
    let s = seats[index];
    if (!s.occupied) return;

    if (s.needsMenu) {
        s.needsMenu = false;
        s.isCooking = true;
        s.cookStep = 0;
    } else if (s.needsServing) {
        s.needsServing = false;
        s.needsToPay = true;
        s.patience = 100;
    } else if (s.needsToPay) {
        game.wallet += game.currentMenuPrice;
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

    if (s.cookStep === 0 && game.inv.noodle > 0) { game.inv.noodle--; s.cookStep = 1; }
    else if (s.cookStep === 1 && game.inv.broth > 0) { game.inv.broth--; s.cookStep = 2; }
    else if (s.cookStep === 2 && game.inv.spice > 0) { game.inv.spice--; s.cookStep = 3; }
    else if (s.cookStep === 3 && game.inv.egg > 0) {
        game.inv.egg--;
        // Finalize bowl
        setTimeout(() => {
            s.isCooking = false;
            s.needsServing = true;
            updateUI();
            updateKitchenUI();
        }, 400);
    }
    updateUI();
    updateKitchenUI();
}

// --- UI RENDERERS ---
function updateUI() {
    document.getElementById('money').innerText = "$" + game.wallet.toLocaleString();
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
            let bubble = s.needsMenu ? "📜?" : (s.needsServing ? "🍜!" : (s.needsToPay ? "💰" : "⌛"));
            div.innerHTML = `
                <div class="status-bubble">${bubble}</div>
                <div class="rpg-char" style="--skin:${s.charData.skin}; --shirt:${s.charData.shirt};">
                    <div class="rpg-head"></div><div class="rpg-body"></div>
                </div>`;
        }
        div.onclick = () => handleTableClick(i);
        dArea.appendChild(div);
    }

    renderUpgrade('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑');
    renderUpgrade('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲');
    renderUpgrade('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🐒');
    
    document.getElementById('monkey-status').innerText = game.idxAuto > 0 ? "🐒 Monkey Level: " + game.idxAuto : "🐒 Monkey Staff: None";
}

function updateKitchenUI() {
    let container = document.getElementById('stoves-container');
    container.innerHTML = "";
    let activeStoves = 0;
    seats.forEach((s, i) => {
        if (s.isCooking) {
            activeStoves++;
            let div = document.createElement('div');
            div.className = "stove-station";
            div.onclick = () => clickStove(i);
            let egg = s.cookStep === 3 ? '<div class="egg-drop">🥚</div>' : '';
            div.innerHTML = `
                <div style="color:white; font-size:0.6rem; margin-bottom:5px;">Table ${i+1}</div>
                <div class="manual-bowl step-${s.cookStep}">${egg}</div>
            `;
            container.appendChild(div);
        }
    });
    if (activeStoves === 0) container.innerHTML = "<p style='color:#ccc;'>No orders in progress.</p>";
}

function renderUpgrade(id, track, idx, func, icon) {
    let el = document.getElementById(id);
    let u = track[idx];
    if (!u) { el.innerHTML = `<button class="tycoon-pad" disabled>${icon} MAXED OUT</button>`; return; }
    let aff = game.wallet >= u.cost ? "affordable" : "";
    el.innerHTML = `
        <button class="tycoon-pad ${aff}" onclick="${func}()">
            <div style="font-size:1.2rem;">${icon} ${u.name}</div>
            <div>$${u.cost.toLocaleString()}</div>
        </button>`;
}

// --- BUYING LOGIC ---
function buyTable() { 
    let u = TRACK_TABLES[game.idxTable]; 
    if(game.wallet >= u.cost) { game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; updateUI(); } 
}
function buyRecipe() { 
    let u = TRACK_RECIPES[game.idxRecipe]; 
    if(game.wallet >= u.cost) { game.wallet -= u.cost; game.currentMenuPrice = u.value; game.idxRecipe++; updateUI(); document.getElementById('stat-menu').innerText = `${u.name} ($${u.value})`; } 
}
function buyAuto() { 
    let u = TRACK_AUTO[game.idxAuto]; 
    if(game.wallet >= u.cost) { game.wallet -= u.cost; game.idxAuto++; updateUI(); if(game.idxAuto === 1) runMonkeyAI(); } 
}
function buyIngredient(type, amt, cost) { 
    if(game.wallet >= cost) { game.wallet -= cost; game.inv[type] += amt; updateUI(); } 
}

// --- ADMIN & INIT ---
document.addEventListener('keydown', (e) => {
    window.cheatCode = (window.cheatCode || "") + e.key;
    if(window.cheatCode.includes("rafay is cool")) { document.getElementById('admin-panel').classList.remove('hidden'); window.cheatCode = ""; }
});

function resetGame() { localStorage.clear(); location.reload(); }

// Start Game
updateUI();
updateKitchenUI();
spawnCustomer();
if(game.idxAuto > 0) runMonkeyAI();
