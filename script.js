// --- NEW SOUND SYSTEM ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    
    if(type === 'cash') { osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); osc.start(); osc.stop(audioCtx.currentTime + 0.1); }
    else if(type === 'cook') { osc.type = 'square'; osc.frequency.setValueAtTime(200, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1); gain.gain.setValueAtTime(0.05, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); osc.start(); osc.stop(audioCtx.currentTime + 0.1); }
    else if(type === 'serve') { osc.type = 'triangle'; osc.frequency.setValueAtTime(400, audioCtx.currentTime); gain.gain.setValueAtTime(0.05, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); osc.start(); osc.stop(audioCtx.currentTime + 0.1); }
    else if(type === 'error') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2); osc.start(); osc.stop(audioCtx.currentTime + 0.2); }
}

// --- FORMATTERS ---
const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qd", "Qnd", "Sxd", "Spd", "Ocd"];
function formatMoney(n) {
    if (n < 1000) return Math.floor(n).toString();
    let exponent = Math.floor(Math.log10(n)); let suffixNum = Math.floor(exponent / 3);
    if (suffixNum < suffixes.length) { let shortValue = n / Math.pow(10, suffixNum * 3); return shortValue.toFixed(2) + suffixes[suffixNum]; }
    return n.toExponential(2);
}

// --- ARRAYS & DATA ---
const TRACK_TABLES = Array.from({length: 1000}, (_, i) => ({ name: `Table ${i+2}`, cost: Math.floor(150 * Math.pow(1.3, i)) }));
const R_PRE = ["Basic", "Spicy", "Crispy", "Golden", "Mega", "Ultra", "Hyper", "Quantum", "Galactic", "Cosmic"];
const R_BASE = ["Shoyu", "Miso", "Tonkotsu", "Udon", "Soba", "Truffle", "Wagyu", "Dragon", "Phoenix", "Nova"];
const RAMEN_NAMES = ["Basic Shoyu", "Miso Pork", "Spicy Tonkotsu", "Chicken Paitan", "Seafood Ramen", "Veggie Udon", "Truffle Ramen"];
const TRACK_RECIPES = Array.from({length: 1000}, (_, i) => {
    let name = i < RAMEN_NAMES.length ? RAMEN_NAMES[i] : `${R_PRE[i % R_PRE.length]} ${R_BASE[Math.floor(i / R_PRE.length) % R_BASE.length]} Ramen`;
    if (i === 999) name = "The Universal Ramen";
    return { name, cost: Math.floor(400 * Math.pow(1.5, i)), value: Math.floor(100 * Math.pow(1.35, i)) };
});
const TRACK_WOK = Array.from({length: 1000}, (_, i) => ({ name: `Wok Lvl ${i+2}`, cost: Math.floor(100000 * Math.pow(1.6, i)) }));
const TRACK_AUTO = Array.from({length: 1000}, (_, i) => ({ name: `Chef Speed Lvl ${i+1}`, cost: Math.floor(1500 * Math.pow(1.4, i)) }));
const TRACK_ADS = Array.from({length: 1000}, (_, i) => ({ name: `Marketing Lvl ${i+1}`, cost: Math.floor(500 * Math.pow(1.45, i)) }));

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

const defaultInv = { noodle: 10, broth: 10, spice: 10, egg: 10, boba: 10 };
let game = {
    wallet: 150, monkeyMoney: 0, turfMult: 1, lastSaveTime: Date.now(),
    tablesOwned: 1, idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxSpecial: 0, currentMenuPrice: 50,
    activeDecor: 'theme-default', decorOwned: ['theme-default'], autoRefill: false,
    staff: { waiter: 0, ninja: 0, mascot: 0 }, rivals: JSON.parse(JSON.stringify(INITIAL_RIVALS)),
    inv: { ...defaultInv }, upgrades: {}
};

const charColors = { skin: ["#ffdbac", "#f1c27d", "#e0ac69", "#8d5524", "#4a3219"], hair: ["#090806", "#4a2511", "#b7a69e", "#d6c4c2", "#e25822"], shirt: ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"], pants: ["#2980b9", "#2c3e50", "#7f8c8d"] };

function generateRandomChar() { return { skin: charColors.skin[Math.floor(Math.random()*5)], hair: charColors.hair[Math.floor(Math.random()*5)], shirt: charColors.shirt[Math.floor(Math.random()*5)], pants: charColors.pants[Math.floor(Math.random()*3)], isVIP: Math.random() < 0.05, isCritic: Math.random() < 0.02, wantsBoba: Math.random() < 0.2 }; }

function renderCharHTML(c) { 
    let crown = c.isVIP ? `<div style="position:absolute; top:-20px; left:-10px; font-size:1.2rem; animation:vipBounce 0.8s infinite; z-index:10;">👑</div>` : ''; 
    let critic = c.isCritic ? `<div style="position:absolute; top:-20px; right:-10px; font-size:1.2rem; z-index:10;">🧐</div>` : ''; 
    let boba = c.wantsBoba ? `<div style="position:absolute; top:-5px; right:-20px; font-size:1.2rem; z-index:15;">🧋</div>` : '';
    return `<div class="rpg-char" style="--skin:${c.skin}; --hair:${c.hair}; --shirt:${c.isVIP?'#f1c40f':c.shirt}; --pants:${c.pants};">${crown}${critic}${boba}<div class="rpg-head"><div class="rpg-hair"></div><div class="rpg-eyes"><div class="rpg-eye"></div><div class="rpg-eye"></div></div></div><div class="rpg-body"></div><div class="rpg-legs"><div class="rpg-leg"></div><div class="rpg-leg"></div></div></div>`; 
}

let seats = Array.from({length: 1000}, () => ({ occupied: false, needsMenu: false, isCooking: false, cookStep: 0, needsServing: false, needsToPay: false, patience: 100, charData: null }));
let waitList = []; let isRushHour = false; let rushMultiplier = 1;

function switchTab(tab) { document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active-view')); document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); document.getElementById(`view-${tab}`).classList.add('active-view'); document.getElementById(`btn-${tab}`).classList.add('active'); if(tab==='decor') renderDecorPanel(); if(tab==='staff') renderStaffPanel(); if(tab==='map') renderTurfPanel(); }

function initTables() { let d = document.getElementById('dining-area'); if(d.children.length === 0) { for(let i=0; i<1000; i++) { let div = document.createElement('div'); div.id = `seat-${i}`; div.className = 'seat locked'; d.appendChild(div); } } }

function getPrestigeMultiplier() { return (1 + (game.monkeyMoney * 2)) * game.turfMult; }

function customerArrives() { 
    if (waitList.length < 10) { waitList.push(generateRandomChar()); renderWaitList(); } 
    checkEmptySeats(); 
    // Speeds up by 10% per level. Math.max keeps it from going faster than 200ms so the game doesn't crash!
    let speed = Math.max(200, 2500 * Math.pow(0.90, game.idxAds || 0)) / rushMultiplier; 
    setTimeout(customerArrives, speed); 
}
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
    else if (seat.needsServing) { 
        if(seat.charData && seat.charData.wantsBoba) {
            if(game.inv.boba < 1) { document.getElementById('out-of-stock-msg').classList.remove('hidden'); playSound('error'); return; }
            game.inv.boba--;
        }
        seat.needsServing = false; seat.needsToPay = true; seat.patience = 100; playSound('serve'); updateUI(); 
    } 
    else if (seat.needsToPay) collectPayment(index); 
    else if (!seat.isCooking) { seat.isCooking = true; seat.cookStep = 0; seat.patience = 100; updateUI(); updateKitchenUI(); }
}

function collectPayment(index) {
    let seat = seats[index];
    let mult = seat.charData.isVIP ? 10 : 1;
    if(seat.charData.isCritic) mult *= 25; 
    if(game.staff.mascot > 0) mult += (game.staff.mascot * 0.5); 
    
    let finalValue = (game.currentMenuPrice * mult) * getPrestigeMultiplier() * rushMultiplier;
    game.wallet += finalValue;
    playSound('cash');

    // --- THE FIX: FULLY RESET THE TABLE DATA ---
    seat.occupied = false; 
    seat.charData = null;
    seat.needsMenu = false;
    seat.isCooking = false;
    seat.cookStep = 0;
    seat.needsServing = false;
    seat.needsToPay = false;
    seat.patience = 100;
    // ------------------------------------------

    saveGame(); 
    updateUI();
}

function buyIngredient(type, amount, cost) { 
    if (game.wallet >= cost) { 
        game.wallet -= cost; game.inv[type] += amount; 
        document.getElementById('out-of-stock-msg').classList.add('hidden'); 
        playSound('cook'); updateUI(); saveGame(); 
    } else { playSound('error'); }
}

function buyAutoRefill() {
    if (game.wallet >= 50000 && !game.autoRefill) {
        game.wallet -= 50000; game.autoRefill = true; playSound('cash'); saveGame(); updateUI();
    } else { playSound('error'); }
}

function clickStove(index) {
    let seat = seats[index]; if (!seat.isCooking) return;
    let msg = document.getElementById('out-of-stock-msg');
    
    if(seat.cookStep === 0 && game.staff.ninja > 0 && Math.random() < (game.staff.ninja * 0.05)) {
        if(game.inv.noodle<1||game.inv.broth<1||game.inv.spice<1||game.inv.egg<1) { msg.classList.remove('hidden'); playSound('error'); return; }
        game.inv.noodle--; game.inv.broth--; game.inv.spice--; game.inv.egg--;
        seat.cookStep = 3; playSound('cook'); finishCooking(index); return;
    }

    if (seat.cookStep === 0) { if (game.inv.noodle < 1 || game.inv.broth < 1) { msg.classList.remove('hidden'); playSound('error'); return; } game.inv.noodle--; game.inv.broth--; playSound('cook'); seat.cookStep = 1; } 
    else if (seat.cookStep === 1) { if (game.inv.spice < 1) { msg.classList.remove('hidden'); playSound('error'); return; } game.inv.spice--; playSound('cook'); seat.cookStep = 2; } 
    else if (seat.cookStep === 2) { 
        if (game.inv.egg < 1) { msg.classList.remove('hidden'); playSound('error'); return; } 
        game.inv.egg--; playSound('cook'); seat.cookStep = 3; 
        
        const stoveElements = document.querySelectorAll('.stove-station');
        const currentStove = stoveElements[index];
        if (currentStove) {
            const eggEmoji = document.createElement('div');
            eggEmoji.className = 'egg-drop';
            eggEmoji.innerText = '🥚';
            currentStove.appendChild(eggEmoji);
            setTimeout(() => eggEmoji.remove(), 500);
        }
        
        finishCooking(index); return; 
    }
    updateUI(); updateKitchenUI();
}

function finishCooking(index) {
    let seat = seats[index];
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

function getMonkeySpeed() { return Math.max(50, 3000 * Math.pow(0.85, game.idxAuto)) / rushMultiplier; }

function runMonkeyLoop() {
    if(game.idxAuto > 0) {
        for(let i = 0; i < game.tablesOwned; i++) {
            let s = seats[i];
            
            // CHECK FOR BOBA JAM: If out of boba, skip the serving step for this table
            // This allows the monkey to move on to take orders (needsMenu) at other tables!
            if (s.needsServing && s.charData && s.charData.wantsBoba && game.inv.boba < 1) {
                continue; 
            }

            // 1. Handle Serving and Paying first
            if(game.staff.waiter > 0 && (s.needsServing || s.needsToPay)) { 
                handleTableClick(i); 
                break; 
            }
            
            // 2. Handle Taking Orders (Needs Menu) and Starting Cooking
            if(s.occupied && (s.needsMenu || (!s.isCooking && !s.needsServing && !s.needsToPay))) { 
                handleTableClick(i); 
                break; 
            }
        }
    }
    setTimeout(runMonkeyLoop, getMonkeySpeed());
}

setInterval(() => {
    if (game.autoRefill) {
        ['noodle','broth','spice','egg','boba'].forEach(item => {
            if (game.inv[item] < 20 && game.wallet >= 50) { game.wallet -= 50; game.inv[item] += 20; }
        });
        updateUI();
    }
}, 3000);

function buyTable() { let u = TRACK_TABLES[game.idxTable]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; playSound('cash'); saveGame(); updateUI(); updateKitchenUI(); } }
function buyRecipe() { let u = TRACK_RECIPES[game.idxRecipe]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.currentMenuPrice = u.value; game.idxRecipe++; playSound('cash'); saveGame(); updateUI(); } }
function buyAuto() { let u = TRACK_AUTO[game.idxAuto]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.idxAuto++; if (game.idxAuto === 1) runMonkeyLoop(); playSound('cash'); saveGame(); updateUI(); updateKitchenUI(); } }
function buyWok() { let u = TRACK_WOK[game.idxWok]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.idxWok++; playSound('cash'); saveGame(); updateUI(); } }
function buyAds() { let u = TRACK_ADS[game.idxAds]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.idxAds++; playSound('cash'); saveGame(); updateUI(); } }

function renderPad(id, track, idx, func, title) {
    let container = document.getElementById(id); 
    if(!container) return; // Failsafe check
    let u = track[idx];
    if (!u) { container.innerHTML = `<button class="tycoon-pad" style="background:#333;">${title}<br>MAX LEVEL</button>`; } 
    else { let afford = game.wallet >= u.cost ? "affordable" : ""; container.innerHTML = `<button class="tycoon-pad ${afford}" onclick="${func}()"><b>${title}</b><br>Lvl ${idx+1}: ${u.name}<br>$${formatMoney(u.cost)}</button>`; }
}

function updateUI() {
    // FAIL-SAFE DOM UPDATES!
    if(document.getElementById('money')) document.getElementById('money').innerText = "$" + formatMoney(game.wallet);
    if(document.getElementById('inv-noodle')) document.getElementById('inv-noodle').innerText = formatMoney(game.inv.noodle); 
    if(document.getElementById('inv-broth')) document.getElementById('inv-broth').innerText = formatMoney(game.inv.broth);
    if(document.getElementById('inv-spice')) document.getElementById('inv-spice').innerText = formatMoney(game.inv.spice); 
    if(document.getElementById('inv-egg')) document.getElementById('inv-egg').innerText = formatMoney(game.inv.egg);
    if(document.getElementById('inv-boba')) document.getElementById('inv-boba').innerText = formatMoney(game.inv.boba);
    
    let autoBtn = document.getElementById('btn-auto-refill');
    if(autoBtn) {
        if(game.autoRefill) { autoBtn.innerText = "ACTIVE"; autoBtn.disabled = true; }
        else { autoBtn.innerText = "Buy ($50k)"; autoBtn.disabled = false; }
    }

    if(document.getElementById('stat-stars')) document.getElementById('stat-stars').innerText = game.monkeyMoney; 
    if(document.getElementById('stat-turf')) document.getElementById('stat-turf').innerText = game.turfMult.toFixed(1);
    if(document.getElementById('star-mult')) document.getElementById('star-mult').innerText = getPrestigeMultiplier().toFixed(1);
    
    let currentRecipeName = game.idxRecipe > 0 ? TRACK_RECIPES[game.idxRecipe-1].name : RAMEN_NAMES[0];
    if(document.getElementById('stat-menu')) document.getElementById('stat-menu').innerText = `${currentRecipeName} ($${formatMoney(game.currentMenuPrice)})`;

    let pBtn = document.getElementById('btn-prestige'); 
    if(pBtn) { if(game.wallet >= 1e12) pBtn.removeAttribute('disabled'); else pBtn.setAttribute('disabled', 'true'); }

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

    renderPad('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑 TABLES'); 
    renderPad('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲 RECIPES');
    renderPad('pad-wok', TRACK_WOK, game.idxWok, 'buyWok', '🍳 WOK'); 
    renderPad('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🐒 MAIN CHEF');
    renderPad('pad-ads', TRACK_ADS, game.idxAds || 0, 'buyAds', '📺 ADVERTISE');
}

function updateKitchenUI() {
    let container = document.getElementById('stoves-container'); 
    if(!container) return;
    container.innerHTML = ""; 
    seats.forEach((seat, i) => {
        if (seat.occupied && seat.isCooking) {
            let stove = document.createElement('div'); stove.className = "stove-station"; stove.onclick = () => clickStove(i);
            let chefHTML = game.idxAuto > 0 ? `<div class="visual-chef">🐒</div>` : '';
            stove.innerHTML = `<div class="stove-label">Step ${seat.cookStep+1}</div><div class="manual-bowl step-${seat.cookStep}"></div><div class="stove-burner"></div>${chefHTML}`;
            container.appendChild(stove);
        }
    });
}

function buyStaff(id, cost) { if(game.wallet >= cost) { game.wallet -= cost; game.staff[id]++; playSound('cash'); saveGame(); updateUI(); renderStaffPanel(); } }
function renderStaffPanel() {
    let container = document.getElementById('staff-container');
    if(!container) return;
    let html = "";
    TRACK_STAFF.forEach(s => {
        let cost = s.baseCost * Math.pow(s.mult, game.staff[s.id]);
        let afford = game.wallet >= cost ? "affordable" : "";
        html += `<button class="tycoon-pad ${afford}" onclick="buyStaff('${s.id}', ${cost})"><b>${s.name}</b><br>Hired: ${game.staff[s.id]}<br>Hire Cost: $${formatMoney(cost)}</button>`;
    });
    container.innerHTML = html;
}

function attackRival(idx) {
    let rival = game.rivals[idx];
    if(rival.hp > 0 && game.wallet >= rival.cost) {
        game.wallet -= rival.cost;
        rival.hp -= Math.max(1, rival.maxHp * 0.1); 
        playSound('cook');
        if(rival.hp <= 0) { rival.hp = 0; game.turfMult += rival.multReward; playSound('cash'); alert(`DEFEATED ${rival.name}! Global Profit Multiplier increased by +${rival.multReward}x!`); }
        saveGame(); updateUI(); renderTurfPanel();
    } else { playSound('error'); }
}
function renderTurfPanel() {
    let container = document.getElementById('turf-container');
    if(!container) return;
    let html = "";
    game.rivals.forEach((r, i) => {
        if(r.hp <= 0) { html += `<div class="rival-card" style="opacity:0.5;"><h3>${r.name} (DEFEATED)</h3><span>+${r.multReward}x Multiplier Active</span></div>`; }
        else {
            let pct = (r.hp / r.maxHp) * 100;
            let afford = game.wallet >= r.cost ? "affordable" : "";
            html += `<div class="rival-card"><div class="rival-info"><h3>${r.name}</h3><div class="hp-bar-bg"><div class="hp-bar-fill" style="width:${pct}%"></div></div></div><button class="tycoon-pad ${afford}" onclick="attackRival(${i})">Launch Campaign<br>Cost: $${formatMoney(r.cost)}</button></div>`;
        }
    });
    container.innerHTML = html;
}

function buyDecor(id, cost) { if(game.decorOwned.includes(id)) { game.activeDecor = id; applyTheme(); saveGame(); renderDecorPanel(); } else if(game.wallet >= cost) { game.wallet -= cost; game.decorOwned.push(id); game.activeDecor = id; playSound('cash'); applyTheme(); saveGame(); updateUI(); renderDecorPanel(); } else { playSound('error'); } }
function renderDecorPanel() { let container = document.getElementById('decor-container'); if(!container) return; let html = ""; TRACK_DECOR.forEach(d => { let isOwned = game.decorOwned.includes(d.id); let isActive = game.activeDecor === d.id; let btnText = isActive ? "EQUIPPED" : (isOwned ? "EQUIP" : `BUY: $${formatMoney(d.cost)}`); let canAfford = game.wallet >= d.cost || isOwned ? "affordable" : ""; html += `<button class="tycoon-pad ${canAfford} ${isActive?'active':''}" style="margin:5px;" onclick="buyDecor('${d.id}', ${d.cost})"><b>${d.name}</b><br>${btnText}</button>`; }); container.innerHTML = html; }
function applyTheme() { document.getElementById('main-container').className = "game-container " + game.activeDecor; }

function prestigeGame() { if(game.wallet >= 1e12 && confirm("Sell franchise for Monkey Money? Reset money/upgrades for a permanent x2 profit multiplier!")) { let st = game.monkeyMoney + 1; let tm = game.turfMult; let d = game.decorOwned; let ad = game.activeDecor; let rv = game.rivals; localStorage.clear(); game = { wallet: 150, monkeyMoney: st, turfMult: tm, lastSaveTime: Date.now(), tablesOwned: 1, idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxAds: 0, idxSpecial: 0, currentMenuPrice: 50, activeDecor: ad, decorOwned: d, autoRefill: false, staff: {waiter:0,ninja:0,mascot:0}, rivals: rv, inv: {...defaultInv}, upgrades: {} }; saveGame(); location.reload(); } }
function resetGame() { if(confirm("Erase all history?")) { localStorage.clear(); location.reload(); } }

let typed = ""; document.addEventListener('keydown', (e) => { typed += e.key.toLowerCase(); if (typed.endsWith("godmode")) { document.getElementById('admin-panel').classList.remove('hidden'); typed = ""; } if (typed.length > 20) typed = typed.slice(-20); });
function cheatMoney(amt) { game.wallet += amt; saveGame(); updateUI(); }
function setCustomMoney() { let val = parseFloat(document.getElementById('custom-money').value); if(!isNaN(val)) { game.wallet = val; saveGame(); updateUI(); } }
function adminMaxIngredients() { game.inv.noodle=1e15; game.inv.broth=1e15; game.inv.spice=1e15; game.inv.egg=1e15; game.inv.boba=1e15; if(document.getElementById('out-of-stock-msg')) document.getElementById('out-of-stock-msg').classList.add('hidden'); saveGame(); updateUI(); }
function cheatStars() { game.monkeyMoney++; saveGame(); updateUI(); }
function triggerEvent(type) {
    let t = document.getElementById('event-toast');
    if(!t) return;
    if(type==='rush') { t.innerText = "🚨 RUSH HOUR! (3x Speed & Pay)"; t.className = "event-toast active"; isRushHour = true; rushMultiplier = 3; setTimeout(() => { isRushHour=false; rushMultiplier=1; }, 30000); }
    if(type==='health') { t.innerText = "👨‍⚕️ HEALTH INSPECTOR Fines You!"; t.className = "event-toast active"; game.wallet *= 0.8; playSound('error'); }
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
        if(!game.staff) game.staff = {waiter:0,ninja:0,mascot:0};
        if(game.autoRefill === undefined) game.autoRefill = false;
        if(game.idxAds === undefined) game.idxAds = 0;
        if(game.inv.boba === undefined) game.inv.boba = 10;
        if(!game.rivals) game.rivals = JSON.parse(JSON.stringify(INITIAL_RIVALS));
        
        let now = Date.now(); let timeDiff = now - game.lastSaveTime; let secondsAway = Math.floor(timeDiff / 1000);
        if(secondsAway > 60 && game.idxAuto > 0 && game.tablesOwned > 0) {
            let cycles = secondsAway / (getMonkeySpeed() / 1000); 
            let estimatedEarnings = cycles * game.tablesOwned * game.currentMenuPrice * getPrestigeMultiplier() * 0.5; 
            
            if(estimatedEarnings > 100) {
                game.wallet += estimatedEarnings;
                if(document.getElementById('offline-earned')) document.getElementById('offline-earned').innerText = formatMoney(estimatedEarnings);
                if(document.getElementById('offline-time')) document.getElementById('offline-time').innerText = `${Math.floor(secondsAway/60)} Minutes`;
                if(document.getElementById('offline-modal')) document.getElementById('offline-modal').classList.remove('hidden');
            }
        }
    } 
    applyTheme();
}
function closeOfflineModal() { document.getElementById('offline-modal').classList.add('hidden'); playSound('cash'); saveGame(); }

initTables(); loadGame(); updateUI(); updateKitchenUI(); renderDecorPanel(); renderStaffPanel(); renderTurfPanel(); customerArrives(); if (game.idxAuto > 0) runMonkeyLoop(); setInterval(saveGame, 10000);
