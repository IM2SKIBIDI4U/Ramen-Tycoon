// --- GAME DATA CONFIG ---
const TRACKS = {
    tables: [{cost: 200}, {cost: 800}, {cost: 2500}, {cost: 7000}, {cost: 20000}],
    recipes: [{name:"Miso Ramen", cost:500, val:120}, {name:"Tonkotsu", cost:3000, val:350}, {name:"Spicy Beef", cost:15000, val:1000}],
    staff: [{name: "Bus-Boy Monkey", cost: 500}, {name: "Waiter Monkey", cost: 2500}, {name: "Manager Monkey", cost: 12000}],
    turf: [{name: "Little Tokyo", cost: 5000, mult: 1.2}, {name: "Neon District", cost: 30000, mult: 2.0}, {name: "Empire Heights", cost: 150000, mult: 5.0}],
    decor: [{name: "Modern White", theme: "theme-default", cost: 0}, {name: "Neon Nights", theme: "theme-neon", cost: 10000}, {name: "Traditional Wood", theme: "theme-wood", cost: 25000}]
};

const charColors = {
    skin: ["#ffdbac", "#f1c27d", "#e0ac69", "#8d5524"],
    shirt: ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#1abc9c"]
};

// --- CORE GAME STATE ---
let game = {
    wallet: 300, tablesOwned: 1, currentMenuPrice: 50, currentMenuName: "Basic Shoyu", turfMult: 1.0,
    idxTable: 0, idxRecipe: 0, idxStaff: 0,
    ownedTurf: [], ownedDecor: ["theme-default"], activeTheme: "theme-default",
    inv: { noodle: 50, broth: 50, spice: 50, egg: 50 },
    speedHack: false
};

let seats = Array.from({length: 10}, () => ({ 
    occupied: false, needsMenu: false, isCooking: false, cookStep: 0, 
    needsServing: false, needsToPay: false, charData: null 
}));

let isRushHour = false;

// --- SAVE / LOAD SYSTEM ---
function saveGame() {
    localStorage.setItem('RamenTycoonSave', JSON.stringify(game));
    const toast = document.getElementById('save-toast');
    toast.style.opacity = "1";
    setTimeout(() => toast.style.opacity = "0", 2000);
}

function loadGame() {
    const saved = localStorage.getItem('RamenTycoonSave');
    if (saved) {
        game = JSON.parse(saved);
        document.getElementById('body-tag').className = game.activeTheme;
        document.getElementById('stat-menu').innerText = game.currentMenuName;
    }
}

// --- SYSTEMS ---
function switchTab(tab) {
    document.querySelectorAll('.view-panel').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-${tab}`).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function updateUI() {
    document.getElementById('money').innerText = "$" + Math.floor(game.wallet).toLocaleString();
    document.getElementById('inv-noodle').innerText = game.inv.noodle;
    document.getElementById('inv-broth').innerText = game.inv.broth;
    document.getElementById('inv-spice').innerText = game.inv.spice;
    document.getElementById('inv-egg').innerText = game.inv.egg;
    document.getElementById('stat-turf').innerText = game.turfMult.toFixed(1);

    const area = document.getElementById('dining-area');
    area.innerHTML = "";
    for (let i = 0; i < game.tablesOwned; i++) {
        let s = seats[i];
        let div = document.createElement('div');
        div.className = "seat";
        if (s.occupied) {
            let icon = s.needsMenu ? "📜?" : (s.needsServing ? "🍜!" : (s.needsToPay ? "💰" : "⌛"));
            div.innerHTML = `<div class="bubble">${icon}</div><div class="rpg-char" style="--skin:${s.charData.skin}; --shirt:${s.charData.shirt};"><div class="rpg-head"></div><div class="rpg-body"></div></div>`;
        }
        div.onclick = () => playerInteraction(i);
        area.appendChild(div);
    }

    renderCard('upgrades-list', TRACKS.tables, game.idxTable, 'buyTable', '🪑 New Table');
    renderCard('upgrades-list', TRACKS.recipes, game.idxRecipe, 'buyRecipe', '🍲 New Recipe', true);
    renderCard('staff-list', TRACKS.staff, game.idxStaff, 'buyStaff', '🐒 Hire Monkey');
    
    document.getElementById('map-grid').innerHTML = TRACKS.turf.map((t, i) => `
        <div class="turf-node ${game.ownedTurf.includes(i) ? 'owned':''}" onclick="buyTurf(${i})">${t.name}<br>${game.ownedTurf.includes(i) ? 'OWNED' : '$'+t.cost.toLocaleString()}</div>`).join('');

    document.getElementById('decor-list').innerHTML = TRACKS.decor.map((d, i) => `
        <div class="card ${game.wallet >= d.cost ? 'aff':''}" onclick="applyDecor(${i})"><b>${d.name}</b><br>${game.ownedDecor.includes(d.theme) ? 'Owned' : '$'+d.cost.toLocaleString()}</div>`).join('');
}

function updateKitchenUI() {
    const cont = document.getElementById('stoves-container');
    cont.innerHTML = "";
    seats.forEach((s, i) => {
        if (s.isCooking) {
            let div = document.createElement('div');
            div.className = "stove";
            div.onclick = () => clickStove(i);
            div.innerHTML = `<div class="bowl s${s.cookStep}"></div>`;
            cont.appendChild(div);
        }
    });
}

function renderCard(targetId, track, idx, func, label, append=false) {
    const el = document.getElementById(targetId);
    if (!append) el.innerHTML = "";
    let item = track[idx];
    if (!item) return;
    el.innerHTML += `<div class="card ${game.wallet >= item.cost ? 'aff':''}" onclick="${func}()"><b>${label}</b><br>${item.name || ""}<br>$${item.cost.toLocaleString()}</div>`;
}

// --- GAMEPLAY LOOPS ---
function spawnCustomer() {
    for (let i = 0; i < game.tablesOwned; i++) {
        if (!seats[i].occupied) {
            seats[i].occupied = true; seats[i].needsMenu = true;
            seats[i].charData = { skin: charColors.skin[Math.floor(Math.random()*4)], shirt: charColors.shirt[Math.floor(Math.random()*6)] };
            break;
        }
    }
    setTimeout(spawnCustomer, isRushHour ? 1200 : 4500);
}

function playerInteraction(i) {
    let s = seats[i];
    if (!s.occupied) return;
    if (s.needsMenu) { s.needsMenu = false; s.isCooking = true; }
    else if (s.needsServing) { s.needsServing = false; s.needsToPay = true; }
    else if (s.needsToPay) { collectPayment(i); }
    updateUI(); updateKitchenUI();
}

function clickStove(i) {
    let s = seats[i];
    if (!s.isCooking) return;
    if (s.cookStep === 0 && game.inv.noodle > 0) { game.inv.noodle--; s.cookStep = 1; }
    else if (s.cookStep === 1 && game.inv.broth > 0) { game.inv.broth--; s.cookStep = 2; }
    else if (s.cookStep === 2 && game.inv.spice > 0) { game.inv.spice--; s.cookStep = 3; }
    else if (s.cookStep === 3 && game.inv.egg > 0) { game.inv.egg--; s.isCooking = false; s.cookStep = 0; s.needsServing = true; }
    updateUI(); updateKitchenUI();
}

function collectPayment(i) {
    let pay = game.currentMenuPrice * game.turfMult;
    if (isRushHour) pay *= 2;
    game.wallet += pay;
    seats[i].occupied = false; seats[i].needsToPay = false; seats[i].charData = null;
    updateUI();
}

function runMonkeyLoop() {
    if (game.idxStaff > 0) {
        for (let i = 0; i < game.tablesOwned; i++) {
            let s = seats[i];
            if (!s.occupied) continue;
            if (s.needsMenu) { s.needsMenu = false; s.isCooking = true; break; }
            if (s.needsServing && game.idxStaff >= 2) { s.needsServing = false; s.needsToPay = true; break; }
            if (s.needsToPay && game.idxStaff >= 3) { collectPayment(i); break; }
        }
    }
    let baseDelay = [0, 2500, 1200, 600][game.idxStaff] || 600;
    setTimeout(runMonkeyLoop, game.speedHack ? 50 : baseDelay);
}

// --- SHOP LOGIC ---
function buyTable() { let u = TRACKS.tables[game.idxTable]; if(game.wallet >= u.cost){ game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; updateUI(); saveGame(); } }
function buyRecipe() { let u = TRACKS.recipes[game.idxRecipe]; if(game.wallet >= u.cost){ game.wallet -= u.cost; game.currentMenuPrice = u.val; game.currentMenuName = u.name; game.idxRecipe++; document.getElementById('stat-menu').innerText = u.name; updateUI(); saveGame(); } }
function buyStaff() { let u = TRACKS.staff[game.idxStaff]; if(game.wallet >= u.cost){ game.wallet -= u.cost; game.idxStaff++; updateUI(); saveGame(); } }
function buyTurf(i) { let t = TRACKS.turf[i]; if(!game.ownedTurf.includes(i) && game.wallet >= t.cost){ game.wallet -= t.cost; game.ownedTurf.push(i); game.turfMult += (t.mult - 1); updateUI(); saveGame(); } }
function applyDecor(i) {
    let d = TRACKS.decor[i];
    if (game.ownedDecor.includes(d.theme)) { document.getElementById('body-tag').className = d.theme; game.activeTheme = d.theme; }
    else if (game.wallet >= d.cost) { game.wallet -= d.cost; game.ownedDecor.push(d.theme); document.getElementById('body-tag').className = d.theme; game.activeTheme = d.theme; updateUI(); }
    saveGame();
}
function buyIngredient(t, a, c) { if(game.wallet >= c){ game.wallet -= c; game.inv[t] += a; updateUI(); } }

// --- ADMIN & CHEATS ---
document.addEventListener('keydown', (e) => {
    window.keys = (window.keys || "") + e.key;
    if(window.keys.includes("rafay is cool")) { document.getElementById('admin-panel').classList.remove('hidden'); window.keys=""; }
});

function toggleSpeedHack() {
    game.speedHack = !game.speedHack;
    const btn = document.getElementById('btn-speed-hack');
    btn.innerText = game.speedHack ? "🏃 Speed Hack: ON" : "🏃 Speed Hack: OFF";
    btn.style.background = game.speedHack ? "#0be881" : "#485460";
}

function adminInstantCook() {
    seats.forEach((s) => { if (s.isCooking) { s.isCooking = false; s.cookStep = 0; s.needsServing = true; } });
    updateUI(); updateKitchenUI();
}

function resetGame() { if(confirm("Clear all progress?")) { localStorage.clear(); location.reload(); } }

// --- INIT ---
loadGame();
setInterval(saveGame, 30000); // Auto-save every 30s
setInterval(() => { isRushHour = true; document.getElementById('event-toast').classList.remove('hidden'); setTimeout(() => { isRushHour = false; document.getElementById('event-toast').classList.add('hidden'); }, 30000); }, 120000);
spawnCustomer();
runMonkeyLoop();
updateUI();
