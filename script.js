// --- FORMATTERS ---
const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qd"];
function formatMoney(n) {
    if (n < 1000) return Math.floor(n).toString();
    let exponent = Math.floor(Math.log10(n)); let suffixNum = Math.floor(exponent / 3);
    if (suffixNum < suffixes.length) { let shortValue = n / Math.pow(10, suffixNum * 3); return shortValue.toFixed(2) + suffixes[suffixNum]; }
    return n.toExponential(2);
}

// --- RESTORED ORIGINAL UPGRADE TRACKS ---
const TRACK_TABLES = []; let tCost = 150;
for (let i = 2; i <= 100; i++) { TRACK_TABLES.push({ name: `Table ${i}`, cost: tCost }); tCost = Math.floor(tCost * 1.85); }

const RAMEN_NAMES = ["Basic Shoyu", "Miso Pork", "Spicy Tonkotsu", "Chicken Paitan", "Seafood Ramen", "Veggie Udon", "Truffle Ramen", "Wagyu Beef", "Dragon Fire", "Golden Emperor"];
const TRACK_RECIPES = []; let rCost = 400; let rVal = 100;
for (let i = 0; i < 100; i++) { 
    let rName = RAMEN_NAMES[i] || `Tier ${i+1} Ramen`;
    TRACK_RECIPES.push({ name: rName, cost: rCost, value: rVal }); 
    rCost = Math.floor(rCost * 2.2); rVal = Math.floor(rVal * 1.5); 
}

const TRACK_WOK = [
    { name: "Double Wok (Cook 2x)", cost: 100000 },
    { name: "Triple Wok (Cook 3x)", cost: 500000 },
    { name: "Quad Wok (Cook 4x)", cost: 2000000 },
    { name: "Penta Wok (Cook 5x)", cost: 10000000 },
    { name: "Hexa Wok (Cook 6x)", cost: 50000000 },
    { name: "Hepta Wok (Cook 7x)", cost: 250000000 },
    { name: "Octa Wok (Cook 8x)", cost: 1000000000 },
    { name: "Nona Wok (Cook 9x)", cost: 5000000000 },
    { name: "Deca Wok (Cook 10x)", cost: 25000000000 }
];

const TRACK_AUTO = [
    { name: "Hire Monkey Waiter", cost: 1500 },
    { name: "Rollerblades", cost: 7500 },
    { name: "Espresso Shots", cost: 25000 },
    { name: "Walkie Talkies", cost: 100000 },
    { name: "Hoverboards", cost: 500000 },
    { name: "Energy Drinks", cost: 2500000 },
    { name: "Jetpacks", cost: 10000000 },
    { name: "Teleport Pad", cost: 50000000 },
    { name: "Cyber Implants", cost: 250000000 },
    { name: "Ascended Monkeys", cost: 1000000000 }
];

const TRACK_SPECIAL = [
    { name: "Neon Sign (Fast Spawns)", cost: 3000, key: "fastSpawn" },
    { name: "Comfy Chairs (+VIP)", cost: 8000, key: "comfyChairs" },
    { name: "Bulk Noodles (Half Price)", cost: 15000, key: "cheapNoodle" },
    { name: "Bulk Broth (Half Price)", cost: 25000, key: "cheapBroth" },
    { name: "Boba Bar (Passive Income)", cost: 60000, key: "bobaBar" },
    { name: "Tip Jar (+10% Pay)", cost: 120000, key: "tipJar" },
    { name: "Arcade Machine ($/sec)", cost: 250000, key: "arcade" },
    { name: "Premium Ingredients (+20%)", cost: 750000, key: "premiumIng" },
    { name: "Security Gorilla (10s Tax)", cost: 3000000, key: "security" },
    { name: "Golden Pots (x2 Pay)", cost: 25000000, key: "goldenPots" },
    { name: "Secret Spice (+50% Pay)", cost: 100000000, key: "secretSpice" },
    { name: "Gold Leaf (+VIP)", cost: 500000000, key: "goldLeaf" },
    { name: "Franchise (10x Profit)", cost: 200000000000, key: "franchise" }
];

const TRACK_DECOR = [ { id: 'theme-default', name: 'Standard Store', cost: 0 }, { id: 'theme-neon', name: 'Cyberpunk Neon', cost: 500000 }, { id: 'theme-zen', name: 'Zen Garden', cost: 10000000 }, { id: 'theme-gold', name: 'Solid Gold Palace', cost: 1000000000 } ];

const TRACK_STAFF = [
    { id: 'waiter', name: 'Waiter Chimp (Auto Serve/Pay)', baseCost: 50000, mult: 5 },
    { id: 'ninja', name: 'Ninja Macaque (Insta-Cook Chance)', baseCost: 250000, mult: 10 },
    { id: 'mascot', name: 'Capuchin Mascot (+Patience/Tips)', baseCost: 1000000, mult: 15 }
];

const INITIAL_RIVALS = [
    { id: 'sushi', name: '🍣 Sushi Pandas', hp: 50000, maxHp: 50000, cost: 5000, multReward: 0.5 },
    { id: 'burger', name: '🍔 Burger Bears', hp: 1000000, maxHp: 1000000, cost: 50000, multReward: 1.0 },
    { id: 'pizza', name: '🍕 Pizza Penguins', hp: 50000000, maxHp: 50000000, cost: 1000000, multReward: 2.0 },
    { id: 'taco', name: '🌮 Taco Tigers', hp: 1e10, maxHp: 1e10, cost: 5e8, multReward: 5.0 },
    { id: 'boss', name: '🦍 The Silverback Syndicate', hp: 1e15, maxHp: 1e15, cost: 1e12, multReward: 20.0 }
];

const defaultInv = { noodle: 10, broth: 10, spice: 10, egg: 10 };
const defaultUpgrades = { fastSpawn: false, comfyChairs: false, cheapNoodle: false, cheapBroth: false, bobaBar: false, tipJar: false, arcade: false, premiumIng: false, security: false, goldenPots: false, secretSpice: false, goldLeaf: false, franchise: false };

let game = {
    wallet: 150, monkeyMoney: 0, turfMult: 1, lastSaveTime: Date.now(),
    tablesOwned: 1, idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxSpecial: 0, currentMenuPrice: 50,
    activeDecor: 'theme-default', decorOwned: ['theme-default'],
    staff: { waiter: 0, ninja: 0, mascot: 0 }, rivals: JSON.parse(JSON.stringify(INITIAL_RIVALS)),
    inv: { ...defaultInv }, upgrades: { ...defaultUpgrades }
};

// Character Gen
const charColors = { skin: ["#ffdbac", "#f1c27d", "#e0ac69", "#8d5524", "#4a3219"], hair: ["#090806", "#4a2511", "#b7a69e", "#d6c4c2", "#e25822"], shirt: ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"], pants: ["#2980b9", "#2c3e50", "#7f8c8d"] };
function generateRandomChar() { return { skin: charColors.skin[Math.floor(Math.random()*5)], hair: charColors.hair[Math.floor(Math.random()*5)], shirt: charColors.shirt[Math.floor(Math.random()*5)], pants: charColors.pants[Math.floor(Math.random()*3)], isVIP: Math.random() < (game.upgrades.goldLeaf ? 0.05 : 0.01) }; }
function renderCharHTML(c) { let crown = c.isVIP ? `<div style="position:absolute; top:-20px; font-size:1.2rem; animation:vipBounce 0.8s infinite; z-index:10;">👑</div>` : ''; return `<div class="rpg-char" style="--skin:${c.skin}; --hair:${c.hair}; --shirt:${c.isVIP?'#f1c40f':c.shirt}; --pants:${c.pants};">${crown}<div class="rpg-head"><div class="rpg-hair"></div><div class="rpg-eyes"><div class="rpg-eye"></div><div class="rpg-eye"></div></div></div><div class="rpg-body"></div><div class="rpg-legs"><div class="rpg-leg"></div><div class="rpg-leg"></div></div></div>`; }

let seats = Array.from({length: 1000}, () => ({ occupied: false, needsMenu: false, isCooking: false, cookStep: 0, needsServing: false, needsToPay: false, patience: 100, charData: null }));
let waitList = []; let isRushHour = false; let rushMultiplier = 1;

function switchTab(tab) { document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active-view')); document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); document.getElementById(`view-${tab}`).classList.add('active-view'); document.getElementById(`btn-${tab}`).classList.add('active'); if(tab==='decor') renderDecorPanel(); if(tab==='staff') renderStaffPanel(); if(tab==='map') renderTurfPanel(); }

function initTables() { let d = document.getElementById('dining-area'); if(d.children.length === 0) { for(let i=0; i<1000; i++) { let div = document.createElement('div'); div.id = `seat-${i}`; div.className = 'seat locked'; d.appendChild(div); } } }

function getPrestigeMultiplier() { return (1 + (game.monkeyMoney * 2)) * game.turfMult; }

// Core Loops
function customerArrives() { if (waitList.length < 10) { waitList.push(generateRandomChar()); renderWaitList(); } checkEmptySeats(); let speed = (game.upgrades.fastSpawn ? 1000 : 2500) / rushMultiplier; setTimeout(customerArrives, speed); }
function renderWaitList() { document.getElementById('wait-list').innerHTML = waitList.map(char => `<div style="margin-bottom: 5px;">${renderCharHTML(char)}</div>`).join(''); }

function checkEmptySeats() {
    if (waitList.length === 0) return;
    for (let i = 0; i < game.tablesOwned; i++) { if (!seats[i].occupied) { const char = waitList.shift(); renderWaitList(); spawnWalkingCustomer(i, char); break; } }
}

function spawnWalkingCustomer(seatIdx, char) {
    seats[seatIdx].occupied = true; seats[seatIdx].patience = 100; updateUI();
    setTimeout(() => { seats[seatIdx].charData = char; seats[seatIdx].needsMenu = true; updateUI(); }, 1000 / rushMultiplier);
}

function handleTableClick(index) {
    let seat = seats[index]; if (!seat.occupied) return;
    if (seat.needsMenu) { seat.needsMenu = false; seat.patience = 100; updateUI(); } 
    else if (seat.needsServing) { seat.needsServing = false; seat.needsToPay = true; seat.patience = 100; updateUI(); } 
    else if (seat.needsToPay) collectPayment(index); 
    else if (!seat.isCooking) { seat.isCooking = true; seat.cookStep = 0; seat.patience = 100; updateUI(); updateKitchenUI(); }
}

function collectPayment(index) {
    let seat = seats[index];
    let mult = seat.charData.isVIP ? 10 : 1;
    if(game.upgrades.tipJar) mult += 0.1;
    if(game.upgrades.premiumIng) mult += 0.2;
    if(game.upgrades.goldenPots) mult *= 2;
    if(game.upgrades.secretSpice) mult *= 1.5;
    if(game.upgrades.franchise) mult *= 10; 
    if(game.staff.mascot > 0) mult += (game.staff.mascot * 0.5); 
    
    let finalValue = (game.currentMenuPrice * mult) * getPrestigeMultiplier() * rushMultiplier;
    game.wallet += finalValue;
    seat.occupied = false; seat.needsToPay = false; seat.charData = null; saveGame(); updateUI();
}

function buyIngredient(type, amount, cost) {
    if (type === 'noodle' && game.upgrades.cheapNoodle) cost = Math.floor(cost / 2);
    if (type === 'broth' && game.upgrades.cheapBroth) cost = Math.floor(cost / 2);
    if (game.wallet >= cost) { game.wallet -= cost; game.inv[type] += amount; document.getElementById('out-of-stock-msg').classList.add('hidden'); updateUI(); saveGame(); }
}

function clickStove(index) {
    let seat = seats[index]; if (!seat.isCooking) return;
    let msg = document.getElementById('out-of-stock-msg');
    
    if(seat.cookStep === 0 && game.staff.ninja > 0 && Math.random() < (game.staff.ninja * 0.05)) {
        if(game.inv.noodle<1||game.inv.broth<1||game.inv.spice<1||game.inv.egg<1) { msg.classList.remove('hidden'); return; }
        game.inv.noodle--; game.inv.broth--; game.inv.spice--; game.inv.egg--;
        seat.cookStep = 3; finishCooking(index); return;
    }

    if (seat.cookStep === 0) { if (game.inv.noodle < 1 || game.inv.broth < 1) { msg.classList.remove('hidden'); return; } game.inv.noodle--; game.inv.broth--; seat.cookStep = 1; } 
    else if (seat.cookStep === 1) { if (game.inv.spice < 1) { msg.classList.remove('hidden'); return; } game.inv.spice--; seat.cookStep = 2; } 
    else if (seat.cookStep === 2) { if (game.inv.egg < 1) { msg.classList.remove('hidden'); return; } game.inv.egg--; seat.cookStep = 3; finishCooking(index); return; }
    updateUI(); updateKitchenUI();
}

function finishCooking(index) {
    let seat = seats[index];
    updateKitchenUI(); // Renders the Egg bouncing in!
    setTimeout(() => {
        seat.isCooking = false; seat.needsServing = true; seat.patience = 100;
        let maxExtra = game.idxWok;
        if (maxExtra > 0) {
            let extra = 0;
            for (let j = 0; j < game.tablesOwned; j++) { if (extra >= maxExtra) break; if (j !== index && seats[j].occupied && seats[j].isCooking) { seats[j].isCooking = false; seats[j].needsServing = true; seats[j].patience = 100; extra++; } }
        }
        saveGame(); updateUI(); updateKitchenUI();
    }, 400);
}

function getMonkeySpeed() { 
    const speeds = [9999, 3000, 2500, 2000, 1500, 1000, 800, 600, 400, 200, 100];
    return (speeds[game.idxAuto] || 100) / rushMultiplier; 
}

// FIXED MONKEY AI (Monkeys take orders and serve, YOU cook)
function runMonkeyLoop() {
    if(game.idxAuto > 0) {
        let actionTaken = false;
        for(let i = 0; i < game.tablesOwned; i++) {
            let s = seats[i];
            if (!s.occupied) continue;

            // Waiter Chimp handles Serving and Paying automatically
            if(game.staff.waiter > 0 && (s.needsServing || s.needsToPay)) { 
                handleTableClick(i); 
                actionTaken = true; break;
            }

            // Main Monkey takes orders (needsMenu). Does NOT cook.
            if(s.needsMenu) {
                handleTableClick(i);
                actionTaken = true; break;
            }

            // If you don't own the Waiter Chimp, the Main Monkey must run out to serve/collect pay.
            if(game.staff.waiter === 0 && (s.needsServing || s.needsToPay)) {
                handleTableClick(i);
                actionTaken = true; break;
            }
        }
    }
    setTimeout(runMonkeyLoop, getMonkeySpeed());
}

setInterval(() => {
    let seatedCount = 0;
    seats.forEach((seat, i) => {
        if (seat.occupied) {
            seatedCount++;
            if (!seat.isCooking) {
                let decay = isRushHour ? 2.5 : 1.5;
                if(game.staff.mascot > 0) decay *= Math.max(0.2, (1 - (game.staff.mascot * 0.1))); 
                seat.patience -= decay;
                if (seat.patience <= 0) { seat.occupied = false; seat.needsMenu = false; seat.needsServing = false; seat.needsToPay = false; seat.charData = null; updateUI(); updateKitchenUI(); }
            }
        }
    });
    if(game.upgrades.bobaBar && seatedCount > 0) { game.wallet += (seatedCount * 5 * getPrestigeMultiplier()); updateUI(); }
    if(game.upgrades.arcade) { game.wallet += (25 * getPrestigeMultiplier()); updateUI(); }
}, 200);

function buyTable() { let u = TRACK_TABLES[game.idxTable]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; saveGame(); updateUI(); updateKitchenUI(); } }
function buyRecipe() { let u = TRACK_RECIPES[game.idxRecipe]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.currentMenuPrice = u.value; game.idxRecipe++; saveGame(); updateUI(); } }
function buyAuto() { let u = TRACK_AUTO[game.idxAuto]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.idxAuto++; if (game.idxAuto === 1) runMonkeyLoop(); saveGame(); updateUI(); } }
function buyWok() { let u = TRACK_WOK[game.idxWok]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.idxWok++; saveGame(); updateUI(); } }
function buySpecial() { let u = TRACK_SPECIAL[game.idxSpecial]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.upgrades[u.key] = true; game.idxSpecial++; saveGame(); updateUI(); } }

function renderPad(id, track, idx, func, title) {
    let container = document.getElementById(id); let u = track[idx];
    if (!u) { container.innerHTML = `<button class="tycoon-pad" style="background:#333;">${title}<br>MAX LEVEL</button>`; } 
    else { let afford = game.wallet >= u.cost ? "affordable" : ""; container.innerHTML = `<button class="tycoon-pad ${afford}" onclick="${func}()"><b>${title}</b><br>${u.name}<br>$${formatMoney(u.cost)}</button>`; }
}

function updateUI() {
    document.getElementById('money').innerText = "$" + formatMoney(game.wallet);
    document.getElementById('inv-noodle').innerText = formatMoney(game.inv.noodle); document.getElementById('inv-broth').innerText = formatMoney(game.inv.broth);
    document.getElementById('inv-spice').innerText = formatMoney(game.inv.spice); document.getElementById('inv-egg').innerText = formatMoney(game.inv.egg);
    
    document.getElementById('stat-stars').innerText = game.monkeyMoney; 
    document.getElementById('stat-turf').innerText = game.turfMult.toFixed(1);
    document.getElementById('star-mult').innerText = getPrestigeMultiplier().toFixed(1);
    
    let currentRecipeName = game.idxRecipe > 0 ? TRACK_RECIPES[game.idxRecipe-1].name : RAMEN_NAMES[0];
    document.getElementById('stat-menu').innerText = `${currentRecipeName} ($${formatMoney(game.currentMenuPrice)})`;

    let pBtn = document.getElementById('btn-prestige'); if(game.wallet >= 1e12) pBtn.removeAttribute('disabled'); else pBtn.setAttribute('disabled', 'true');

    seats.forEach((seat, i) => {
        let el = document.getElementById(`seat-${i}`); if (!el) return;
        if (i >= game.tablesOwned) { el.classList.add('locked'); return; } else el.classList.remove('locked');
        
        let html = "";
        if (seat.occupied && seat.charData) {
            if (seat.needsMenu) html += `<div class="menu-request">📜?</div>`;
            if (seat.needsServing) html += `<div class="serve-request">🍜</div>`;
            if (seat.needsToPay && !seat.needsServing) html += `<div class="pay-request">$</div>`;
            html += `<div class="patience-container"><div id="patience-bar-${i}" class="patience-fill" style="width:${seat.patience}%; background-color:${seat.patience < 30 ? '#d63031' : '#00b894'}"></div></div>`;
            html += `<div class="customer-wrapper">${renderCharHTML(seat.charData)}</div>`;
        } else { html += `<span class="status-text" style="color:#aaa;">Empty</span>`; }
        html += `<div class="belt-strip"></div>`; el.innerHTML = html; el.onclick = () => handleTableClick(i);
    });

    renderPad('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑 TABLES'); renderPad('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲 RECIPES');
    renderPad('pad-wok', TRACK_WOK, game.idxWok, 'buyWok', '🍳 WOK'); renderPad('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🐒 MAIN CHEF');
    renderPad('pad-special', TRACK_SPECIAL, game.idxSpecial, 'buySpecial', '✨ BUSINESS');
}

function updateKitchenUI() {
    let container = document.getElementById('stoves-container'); container.innerHTML = ""; 
    seats.forEach((seat, i) => {
        if (seat.occupied && seat.isCooking) {
            let stove = document.createElement('div'); stove.className = "stove-station"; stove.onclick = () => clickStove(i);
            let eggHtml = seat.cookStep === 3 ? `<div class="egg-drop">🍳</div>` : '';
            stove.innerHTML = `<div class="stove-label">Step ${seat.cookStep+1}</div><div class="manual-bowl step-${seat.cookStep}">${eggHtml}</div><div class="stove-burner"></div>`;
            container.appendChild(stove);
        }
    });
}

function buyStaff(id, cost) { if(game.wallet >= cost) { game.wallet -= cost; game.staff[id]++; saveGame(); updateUI(); renderStaffPanel(); } }
function renderStaffPanel() {
    let html = "";
    TRACK_STAFF.forEach(s => {
        let cost = s.baseCost * Math.pow(s.mult, game.staff[s.id]);
        let afford = game.wallet >= cost ? "affordable" : "";
        html += `<button class="tycoon-pad ${afford}" onclick="buyStaff('${s.id}', ${cost})"><b>${s.name}</b><br>Hired: ${game.staff[s.id]}<br>Hire Cost: $${formatMoney(cost)}</button>`;
    });
    document.getElementById('staff-container').innerHTML = html;
}

function attackRival(idx) {
    let rival = game.rivals[idx];
    if(rival.hp > 0 && game.wallet >= rival.cost) {
        game.wallet -= rival.cost;
        rival.hp -= Math.max(1, rival.maxHp * 0.1); 
        if(rival.hp <= 0) { rival.hp = 0; game.turfMult += rival.multReward; alert(`DEFEATED ${rival.name}! Global Profit Multiplier increased by +${rival.multReward}x!`); }
        saveGame(); updateUI(); renderTurfPanel();
    }
}
function renderTurfPanel() {
    let html = "";
    game.rivals.forEach((r, i) => {
        if(r.hp <= 0) { html += `<div class="rival-card" style="opacity:0.5;"><h3>${r.name} (DEFEATED)</h3><span>+${r.multReward}x Multiplier Active</span></div>`; }
        else {
            let pct = (r.hp / r.maxHp) * 100;
            let afford = game.wallet >= r.cost ? "affordable" : "";
            html += `<div class="rival-card"><div class="rival-info"><h3>${r.name}</h3><div class="hp-bar-bg"><div class="hp-bar-fill" style="width:${pct}%"></div></div></div><button class="tycoon-pad ${afford}" onclick="attackRival(${i})">Launch Campaign<br>Cost: $${formatMoney(r.cost)}</button></div>`;
        }
    });
    document.getElementById('turf-container').innerHTML = html;
}

function buyDecor(id, cost) { if(game.decorOwned.includes(id)) { game.activeDecor = id; applyTheme(); saveGame(); renderDecorPanel(); } else if(game.wallet >= cost) { game.wallet -= cost; game.decorOwned.push(id); game.activeDecor = id; applyTheme(); saveGame(); updateUI(); renderDecorPanel(); } }
function renderDecorPanel() { let html = ""; TRACK_DECOR.forEach(d => { let isOwned = game.decorOwned.includes(d.id); let isActive = game.activeDecor === d.id; let btnText = isActive ? "EQUIPPED" : (isOwned ? "EQUIP" : `BUY: $${formatMoney(d.cost)}`); let canAfford = game.wallet >= d.cost || isOwned ? "affordable" : ""; html += `<button class="tycoon-pad ${canAfford} ${isActive?'active':''}" style="margin:5px;" onclick="buyDecor('${d.id}', ${d.cost})"><b>${d.name}</b><br>${btnText}</button>`; }); document.getElementById('decor-container').innerHTML = html; }
function applyTheme() { document.getElementById('main-container').className = "game-container " + game.activeDecor; }

function prestigeGame() { if(game.wallet >= 1e12 && confirm("Sell franchise for Monkey Money? Reset money/upgrades for a permanent x2 profit multiplier!")) { let st = game.monkeyMoney + 1; let tm = game.turfMult; let d = game.decorOwned; let ad = game.activeDecor; let rv = game.rivals; localStorage.clear(); game = { wallet: 150, monkeyMoney: st, turfMult: tm, lastSaveTime: Date.now(), tablesOwned: 1, idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxSpecial: 0, currentMenuPrice: 50, activeDecor: ad, decorOwned: d, staff: {waiter:0,ninja:0,mascot:0}, rivals: rv, inv: {...defaultInv}, upgrades: {...defaultUpgrades} }; saveGame(); location.reload(); } }
function resetGame() { if(confirm("Erase all history?")) { localStorage.clear(); location.reload(); } }

// FIXED ADMIN KEYWORD LISTENER
let typed = ""; 
document.addEventListener('keydown', (e) => { 
    typed += e.key.toLowerCase(); 
    if (typed.endsWith("rafay is cool")) { 
        document.getElementById('admin-panel').classList.remove('hidden'); 
        typed = ""; 
    } 
    if (typed.length > 50) typed = typed.slice(-50); 
});

function cheatMoney(amt) { game.wallet += amt; saveGame(); updateUI(); }
function setCustomMoney() { let val = parseFloat(document.getElementById('custom-money').value); if(!isNaN(val)) { game.wallet = val; saveGame(); updateUI(); } }
function adminMaxIngredients() { game.inv.noodle=1e15; game.inv.broth=1e15; game.inv.spice=1e15; game.inv.egg=1e15; document.getElementById('out-of-stock-msg').classList.add('hidden'); saveGame(); updateUI(); }
function cheatStars() { game.monkeyMoney++; saveGame(); updateUI(); }
function triggerEvent(type) {
    let t = document.getElementById('event-toast');
    if(type==='rush') { t.innerText = "🚨 RUSH HOUR! (3x Speed & Pay)"; t.className = "event-toast active"; isRushHour = true; rushMultiplier = 3; setTimeout(() => { isRushHour=false; rushMultiplier=1; }, 30000); }
    if(type==='health') { t.innerText = "👨‍⚕️ HEALTH INSPECTOR Fines You!"; t.className = "event-toast active"; game.wallet *= 0.8; }
    setTimeout(() => t.classList.remove('active'), 5000); updateUI();
}
function nukeRivals() { game.rivals.forEach(r => { if(r.hp > 0) { r.hp = 0; game.turfMult += r.multReward; }}); saveGame(); renderTurfPanel(); updateUI(); alert("All rivals eradicated. Maximum Turf Multiplier applied.");}
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }

function saveGame() { game.lastSaveTime = Date.now(); localStorage.setItem('RamenUltimateData', JSON.stringify(game)); }
function loadGame() { 
    let s = localStorage.getItem('RamenUltimateData'); 
    if(s) { 
        let parsed = JSON.parse(s); game = { ...game, ...parsed }; 
        if(game.michelinStars !== undefined) { game.monkeyMoney = game.michelinStars; delete game.michelinStars; } 
        if(!game.upgrades) game.upgrades = {...defaultUpgrades}; // Restore custom upgrade tracker
        if(!game.staff) game.staff = {waiter:0,ninja:0,mascot:0};
        if(!game.rivals) game.rivals = JSON.parse(JSON.stringify(INITIAL_RIVALS));
        
        let now = Date.now(); let timeDiff = now - game.lastSaveTime; let secondsAway = Math.floor(timeDiff / 1000);
        if(secondsAway > 60 && game.idxAuto > 0 && game.tablesOwned > 0) {
            let cycles = secondsAway / (getMonkeySpeed() / 1000); 
            let estimatedEarnings = cycles * game.tablesOwned * game.currentMenuPrice * getPrestigeMultiplier() * 0.5; 
            
            if(estimatedEarnings > 100) {
                game.wallet += estimatedEarnings;
                document.getElementById('offline-earned').innerText = formatMoney(estimatedEarnings);
                document.getElementById('offline-time').innerText = `${Math.floor(secondsAway/60)} Minutes`;
                document.getElementById('offline-modal').classList.remove('hidden');
            }
        }
    } 
    applyTheme();
}
function closeOfflineModal() { document.getElementById('offline-modal').classList.add('hidden'); saveGame(); }

initTables(); loadGame(); updateUI(); updateKitchenUI(); renderDecorPanel(); renderStaffPanel(); renderTurfPanel(); customerArrives(); if (game.idxAuto > 0) runMonkeyLoop(); setInterval(saveGame, 10000);
