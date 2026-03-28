// --- FORMATTER FOR MASSIVE NUMBERS ---
const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qd"];
function formatMoney(n) {
    if (n < 1000) return Math.floor(n).toString();
    let exponent = Math.floor(Math.log10(n));
    let suffixNum = Math.floor(exponent / 3);
    if (suffixNum < suffixes.length) {
        let shortValue = n / Math.pow(10, suffixNum * 3);
        return shortValue.toFixed(2) + suffixes[suffixNum];
    }
    return n.toExponential(2);
}

// --- 1000 LEVEL TRACK GENERATORS ---
const TRACK_TABLES = Array.from({length: 1000}, (_, i) => ({ name: `Table ${i+2}`, cost: Math.floor(150 * Math.pow(1.3, i)) }));

// Epic Name Generator
const R_PRE = ["Basic", "Spicy", "Crispy", "Golden", "Mega", "Ultra", "Hyper", "Quantum", "Galactic", "Cosmic", "Celestial", "Divine", "Void", "Astral", "Nebula"];
const R_BASE = ["Shoyu", "Miso", "Tonkotsu", "Udon", "Soba", "Truffle", "Wagyu", "Dragon", "Phoenix", "Leviathan", "Titan", "Nova", "Star", "Infinity"];
const RAMEN_NAMES = ["Basic Shoyu", "Miso Pork", "Spicy Tonkotsu", "Chicken Paitan", "Seafood Ramen", "Veggie Udon", "Truffle Ramen", "Wagyu Beef", "Dragon Fire", "Golden Emperor"];

const TRACK_RECIPES = Array.from({length: 1000}, (_, i) => {
    let name = i < 10 ? RAMEN_NAMES[i] : `${R_PRE[i % R_PRE.length]} ${R_BASE[Math.floor(i / R_PRE.length) % R_BASE.length]} Ramen`;
    if (i === 999) name = "The Universal Ramen";
    return { name, cost: Math.floor(400 * Math.pow(1.5, i)), value: Math.floor(100 * Math.pow(1.35, i)) };
});

const TRACK_WOK = Array.from({length: 1000}, (_, i) => ({ name: `Wok Level ${i+2} (Cook ${i+2}x)`, cost: Math.floor(100000 * Math.pow(1.6, i)) }));
const TRACK_AUTO = Array.from({length: 1000}, (_, i) => ({ name: `Monkey Speed Lvl ${i+1}`, cost: Math.floor(1500 * Math.pow(1.4, i)) }));

const SPECIAL_NAMES = ["Fast Spawns", "Comfy Chairs", "Cheap Noodles", "Cheap Broth", "Boba Bar", "Tip Jar", "Arcade Machine", "Premium Veggies", "Security Gorilla", "Golden Pots", "Secret Spice", "Gold Leaf VIPs", "Franchise Rights"];
const TRACK_SPECIAL = Array.from({length: 1000}, (_, i) => {
    let baseName = i < SPECIAL_NAMES.length ? SPECIAL_NAMES[i] : `Synergy Boost Mk.${i - SPECIAL_NAMES.length + 1}`;
    return { name: baseName, key: `special_${i}`, cost: Math.floor(3000 * Math.pow(1.8, i)) };
});

const TRACK_DECOR = [
    { id: 'theme-default', name: 'Standard Store', cost: 0 },
    { id: 'theme-neon', name: 'Cyberpunk Neon', cost: 500000 },
    { id: 'theme-zen', name: 'Zen Garden', cost: 10000000 },
    { id: 'theme-gold', name: 'Solid Gold Palace', cost: 1000000000 }
];

const defaultInv = { noodle: 10, broth: 10, spice: 10, egg: 10 };
let game = {
    wallet: 150, michelinStars: 0,
    tablesOwned: 1, idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxSpecial: 0, currentMenuPrice: 50,
    activeDecor: 'theme-default', decorOwned: ['theme-default'],
    inv: { ...defaultInv }, upgrades: {}
};

// Modded Characters
const charColors = {
    skin: ["#ffdbac", "#f1c27d", "#e0ac69", "#8d5524", "#4a3219"], hair: ["#090806", "#4a2511", "#b7a69e", "#d6c4c2", "#e25822", "#5e9ca0", "#8e44ad"],
    shirt: ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22", "#1abc9c", "#ffffff"], pants: ["#2980b9", "#2c3e50", "#7f8c8d", "#8e44ad", "#c0392b"]
};

function generateRandomChar() {
    return {
        skin: charColors.skin[Math.floor(Math.random() * charColors.skin.length)], hair: charColors.hair[Math.floor(Math.random() * charColors.hair.length)],
        shirt: charColors.shirt[Math.floor(Math.random() * charColors.shirt.length)], pants: charColors.pants[Math.floor(Math.random() * charColors.pants.length)],
        isVIP: Math.random() < (game.upgrades['special_11'] ? 0.05 : 0.01)
    };
}

function renderCharHTML(char) {
    let crown = char.isVIP ? `<div style="position:absolute; top:-20px; font-size:1.2rem; animation:vipBounce 0.8s infinite; z-index:10;">👑</div>` : '';
    let shirtColor = char.isVIP ? '#f1c40f' : char.shirt;
    return `<div class="rpg-char" style="--skin: ${char.skin}; --hair: ${char.hair}; --shirt: ${shirtColor}; --pants: ${char.pants};">${crown}<div class="rpg-head"><div class="rpg-hair"></div><div class="rpg-eyes"><div class="rpg-eye"></div><div class="rpg-eye"></div></div></div><div class="rpg-body"></div><div class="rpg-legs"><div class="rpg-leg"></div><div class="rpg-leg"></div></div></div>`;
}

let seats = Array.from({length: 1000}, () => ({ occupied: false, needsMenu: false, isCooking: false, cookStep: 0, needsServing: false, needsToPay: false, patience: 100, charData: null }));
let waitList = [];
let currentTaxBracket = 1000000; let taxActive = false; let taxTimer = 100;
let isRushHour = false; let rushMultiplier = 1;

function switchTab(tab) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active-view'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${tab}`).classList.add('active-view');
    document.getElementById(`btn-${tab}`).classList.add('active');
    if(tab === 'decor') renderDecorPanel();
}

function initTables() {
    let diningArea = document.getElementById('dining-area');
    if (diningArea.children.length === 0) { for (let i = 0; i < 1000; i++) { let div = document.createElement('div'); div.id = `seat-${i}`; div.className = 'seat locked'; diningArea.appendChild(div); } }
}

function getPrestigeMultiplier() { return 1 + (game.michelinStars * 2); }

function customerArrives() {
    if (waitList.length < 10) { waitList.push(generateRandomChar()); renderWaitList(); }
    checkEmptySeats();
    let speed = game.upgrades['special_0'] ? 1000 : 2500;
    if (isRushHour) speed /= 3;
    setTimeout(customerArrives, speed);
}

function renderWaitList() { document.getElementById('wait-list').innerHTML = waitList.map(char => `<div style="margin-bottom: 5px;">${renderCharHTML(char)}</div>`).join(''); }

function checkEmptySeats() {
    if (waitList.length === 0) return;
    for (let i = 0; i < game.tablesOwned; i++) {
        if (!seats[i].occupied) { const char = waitList.shift(); renderWaitList(); spawnWalkingCustomer(i, char); break; }
    }
}

function spawnWalkingCustomer(seatIdx, char) {
    seats[seatIdx].occupied = true; seats[seatIdx].patience = 100;
    const walker = document.createElement('div'); walker.className = "walking-customer walking-anim"; walker.innerHTML = renderCharHTML(char);
    const door = document.querySelector('.door-frame').getBoundingClientRect();
    walker.style.left = (door.left + door.width/2 - 15) + "px"; walker.style.top = (door.top - 20) + "px"; document.body.appendChild(walker);
    setTimeout(() => {
        const seatRect = document.getElementById(`seat-${seatIdx}`).getBoundingClientRect();
        walker.style.left = (seatRect.left + 20) + "px"; walker.style.top = (seatRect.top + 20) + "px";
        setTimeout(() => { walker.remove(); seats[seatIdx].charData = char; seats[seatIdx].needsMenu = true; updateUI(); }, 1000 / rushMultiplier);
    }, 50);
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
    if(game.upgrades['special_5']) mult += 0.1; // Tip Jar
    if(game.upgrades['special_7']) mult += 0.2; // Premium
    if(game.upgrades['special_9']) mult *= 2;   // Golden Pots
    if(game.upgrades['special_10']) mult *= 1.5; // Secret Spice
    if(game.upgrades['special_12']) mult *= 10;  // Franchise
    
    // Prestige & Rush Hour Multipliers
    let finalValue = (game.currentMenuPrice * mult) * getPrestigeMultiplier() * rushMultiplier;
    game.wallet += finalValue; checkTaxMilestone();
    
    spawnLeavingCustomer(index, seat.charData); 
    seat.occupied = false; seat.needsToPay = false; seat.charData = null; saveGame(); updateUI();
}

function spawnLeavingCustomer(seatIdx, char) {
    const walker = document.createElement('div'); walker.className = "leaving-customer walking-anim";
    walker.innerHTML = char ? renderCharHTML(char) : `<div style="font-size:2rem;">💢</div>`;
    const seatRect = document.getElementById(`seat-${seatIdx}`).getBoundingClientRect();
    walker.style.left = (seatRect.left + 20) + "px"; walker.style.top = (seatRect.top + 20) + "px"; document.body.appendChild(walker);
    const door = document.querySelector('.door-frame').getBoundingClientRect();
    setTimeout(() => {
        walker.style.left = (door.left + door.width/2 - 15) + "px"; walker.style.top = (door.top - 20) + "px"; walker.style.opacity = "0";
        setTimeout(() => walker.remove(), 1000 / rushMultiplier);
    }, 50);
}

function buyIngredient(type, amount, cost) {
    if (type === 'noodle' && game.upgrades['special_2']) cost = Math.floor(cost / 2);
    if (type === 'broth' && game.upgrades['special_3']) cost = Math.floor(cost / 2);
    if (game.wallet >= cost) { game.wallet -= cost; game.inv[type] += amount; document.getElementById('out-of-stock-msg').classList.add('hidden'); updateUI(); saveGame(); }
}

function clickStove(index) {
    let seat = seats[index]; if (!seat.isCooking) return;
    let msg = document.getElementById('out-of-stock-msg');
    
    if (seat.cookStep === 0) { if (game.inv.noodle < 1 || game.inv.broth < 1) { msg.classList.remove('hidden'); return; } game.inv.noodle--; game.inv.broth--; seat.cookStep = 1; } 
    else if (seat.cookStep === 1) { if (game.inv.spice < 1) { msg.classList.remove('hidden'); return; } game.inv.spice--; seat.cookStep = 2; } 
    else if (seat.cookStep === 2) {
        if (game.inv.egg < 1) { msg.classList.remove('hidden'); return; } game.inv.egg--; seat.cookStep = 3;
        updateKitchenUI(); let bowlEl = document.getElementById(`manual-bowl-${index}`); if(bowlEl) bowlEl.innerHTML += `<div class="egg-drop" style="position:absolute; top:-40px; font-size:1.5rem; animation:dropEgg 0.3s forwards;">🥚</div>`;
        
        setTimeout(() => {
            seat.isCooking = false; seat.needsServing = true; seat.patience = 100;
            let maxExtra = game.idxWok; // Scaled Wok
            if (maxExtra > 0) {
                let extraServed = 0;
                for (let j = 0; j < game.tablesOwned; j++) {
                    if (extraServed >= maxExtra) break; 
                    if (j !== index && seats[j].occupied && seats[j].isCooking) { seats[j].isCooking = false; seats[j].needsServing = true; seats[j].patience = 100; extraServed++; }
                }
            }
            saveGame(); updateUI(); updateKitchenUI();
        }, 400); return;
    }
    updateUI(); updateKitchenUI();
}

// Math-based monkey speed: Logarithmic decay so it doesn't hit 0.
function getMonkeySpeed() {
    return Math.max(100, 3000 * Math.pow(0.85, game.idxAuto)) / rushMultiplier;
}

function runMonkeyLoop() {
    if(game.idxAuto > 0) {
        for(let i = 0; i < game.tablesOwned; i++) {
            let s = seats[i];
            if(s.occupied && (s.needsMenu || s.needsServing || (!s.isCooking && !s.needsServing && !s.needsToPay) || s.needsToPay)) { animateMonkeyChefToTable(i); break; }
        }
    }
    setTimeout(runMonkeyLoop, getMonkeySpeed());
}

function animateMonkeyChefToTable(index) {
    const monkey = document.createElement('div'); monkey.className = "monkey-chef-walking"; monkey.innerText = "🐒";
    const startBtn = document.getElementById('btn-dining').getBoundingClientRect();
    monkey.style.left = startBtn.left + "px"; monkey.style.top = startBtn.top + "px"; document.body.appendChild(monkey);
    const targetSeat = document.getElementById(`seat-${index}`).getBoundingClientRect();
    setTimeout(() => {
        monkey.style.left = targetSeat.left + "px"; monkey.style.top = targetSeat.top + "px";
        setTimeout(() => { monkey.remove(); handleTableClick(index); }, 200 / rushMultiplier);
    }, 50);
}

// Core Loop
setInterval(() => {
    let seatedCount = 0;
    seats.forEach((seat, i) => {
        if (seat.occupied) {
            seatedCount++;
            if (!seat.isCooking) {
                seat.patience -= (isRushHour ? 2.5 : 1.5); 
                let bar = document.getElementById(`patience-bar-${i}`);
                if (bar) { bar.style.width = seat.patience + "%"; bar.style.backgroundColor = seat.patience < 30 ? "#d63031" : "#00b894"; }
                if (seat.patience <= 0) {
                    seat.occupied = false; seat.needsMenu = false; seat.needsServing = false; seat.needsToPay = false; seat.charData = null;
                    spawnLeavingCustomer(i, null); updateUI(); updateKitchenUI();
                }
            }
        }
    });
    if(game.upgrades['special_4'] && seatedCount > 0) { game.wallet += (seatedCount * 5 * getPrestigeMultiplier()); updateUI(); } // Boba
    if(game.upgrades['special_6']) { game.wallet += (25 * getPrestigeMultiplier()); updateUI(); } // Arcade
}, 200);

// Random Events
setInterval(() => {
    if(Math.random() < 0.25 && !isRushHour) {
        let isHealthInspector = Math.random() < 0.3;
        let toast = document.getElementById('event-toast');
        if(isHealthInspector) {
            toast.innerText = "👨‍⚕️ HEALTH INSPECTOR!"; toast.className = "event-toast active health-toast";
            if(game.inv.noodle < 5 || game.inv.broth < 5 || game.inv.spice < 5 || game.inv.egg < 5) {
                let fine = game.wallet * 0.1; game.wallet -= fine;
                setTimeout(() => alert(`Kitchen unstocked! Fined $${formatMoney(fine)}`), 500);
            }
        } else {
            toast.innerText = "🚨 RUSH HOUR! (3x Speed & Pay)"; toast.className = "event-toast active";
            isRushHour = true; rushMultiplier = 3;
            setTimeout(() => { isRushHour = false; rushMultiplier = 1; }, 30000);
        }
        setTimeout(() => toast.classList.remove('active'), 5000);
    }
}, 60000);

function checkTaxMilestone() { if (!taxActive && game.wallet >= currentTaxBracket) triggerTaxEvent(); }
function triggerTaxEvent() {
    taxActive = true; taxTimer = game.upgrades['special_8'] ? 200 : 100; 
    document.getElementById('enforcer-overlay').classList.remove('hidden'); document.getElementById('tax-amount').innerText = "$" + formatMoney(currentTaxBracket);
    let taxInterval = setInterval(() => {
        taxTimer -= 2; document.getElementById('tax-timer-fill').style.width = (game.upgrades['special_8'] ? (taxTimer/200)*100 : taxTimer) + "%";
        if (taxTimer <= 0) { clearInterval(taxInterval); if (taxActive) { alert("BANKRUPT!"); resetGame(); } }
    }, 100);
}
function payEnforcer() { if (game.wallet >= currentTaxBracket) { game.wallet -= currentTaxBracket; taxActive = false; document.getElementById('enforcer-overlay').classList.add('hidden'); currentTaxBracket *= 1000; updateUI(); saveGame(); } }

// Upgrades
function buyTable() { let u = TRACK_TABLES[game.idxTable]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; saveGame(); updateUI(); updateKitchenUI(); } }
function buyRecipe() { let u = TRACK_RECIPES[game.idxRecipe]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.currentMenuPrice = u.value; game.idxRecipe++; saveGame(); updateUI(); } }
function buyAuto() { let u = TRACK_AUTO[game.idxAuto]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.idxAuto++; if (game.idxAuto === 1) runMonkeyLoop(); saveGame(); updateUI(); } }
function buyWok() { let u = TRACK_WOK[game.idxWok]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.idxWok++; saveGame(); updateUI(); } }
function buySpecial() { let u = TRACK_SPECIAL[game.idxSpecial]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.upgrades[u.key] = true; game.idxSpecial++; saveGame(); updateUI(); } }

function buyDecor(id, cost) {
    if(game.decorOwned.includes(id)) { game.activeDecor = id; applyTheme(); saveGame(); renderDecorPanel(); }
    else if(game.wallet >= cost) { game.wallet -= cost; game.decorOwned.push(id); game.activeDecor = id; applyTheme(); saveGame(); updateUI(); renderDecorPanel(); }
}

function renderPad(id, track, idx, func, title) {
    let container = document.getElementById(id); let u = track[idx];
    if (!u) { container.innerHTML = `<button class="tycoon-pad" style="background:#333; border-color:#000;">${title}<br>MAX Lvl 1000</button>`; } 
    else { let afford = game.wallet >= u.cost ? "affordable" : ""; container.innerHTML = `<button class="tycoon-pad ${afford}" onclick="${func}()"><b>${title}</b><br>Lvl ${idx+1}: ${u.name}<br>$${formatMoney(u.cost)}</button>`; }
}

function applyTheme() {
    let container = document.getElementById('main-container');
    container.className = "game-container " + game.activeDecor;
}

function renderDecorPanel() {
    let html = "";
    TRACK_DECOR.forEach(d => {
        let isOwned = game.decorOwned.includes(d.id);
        let isActive = game.activeDecor === d.id;
        let btnText = isActive ? "EQUIPPED" : (isOwned ? "EQUIP" : `BUY: $${formatMoney(d.cost)}`);
        let canAfford = game.wallet >= d.cost || isOwned ? "affordable" : "";
        html += `<button class="tycoon-pad ${canAfford} ${isActive?'active':''}" style="margin:5px;" onclick="buyDecor('${d.id}', ${d.cost})"><b>${d.name}</b><br>${btnText}</button>`;
    });
    document.getElementById('decor-container').innerHTML = html;
}

function updateUI() {
    document.getElementById('money').innerText = "$" + formatMoney(game.wallet);
    document.getElementById('inv-noodle').innerText = game.inv.noodle; document.getElementById('inv-broth').innerText = game.inv.broth;
    document.getElementById('inv-spice').innerText = game.inv.spice; document.getElementById('inv-egg').innerText = game.inv.egg;
    document.getElementById('stat-stars').innerText = game.michelinStars; document.getElementById('star-mult').innerText = getPrestigeMultiplier();
    
    let currentRecipeName = game.idxRecipe > 0 ? TRACK_RECIPES[game.idxRecipe-1].name : RAMEN_NAMES[0];
    document.getElementById('stat-menu').innerText = `${currentRecipeName} ($${formatMoney(game.currentMenuPrice)})`;

    let pBtn = document.getElementById('btn-prestige');
    if(game.wallet >= 1e12) pBtn.removeAttribute('disabled'); else pBtn.setAttribute('disabled', 'true');

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
            if (seat.isCooking) html += `<span class="status-text cooking">Cooking</span>`;
            else if (seat.needsServing) html += `<span class="status-text serve">SERVE!</span>`;
            else if (seat.needsMenu) html += `<span class="status-text order" style="color:#e67e22;">Menu?</span>`;
            else if (seat.needsToPay) html += `<span class="status-text order" style="color:#05c46b;">Pay</span>`;
            else html += `<span class="status-text order">Order!</span>`;
        } else { html += `<span class="status-text empty" style="color:#aaa;">Empty</span>`; }
        html += `<div class="belt-strip"></div>`; el.innerHTML = html; el.onclick = () => handleTableClick(i);
    });

    renderPad('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑 TABLES'); renderPad('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲 RECIPES');
    renderPad('pad-wok', TRACK_WOK, game.idxWok, 'buyWok', '🍳 WOK CAPACITY'); renderPad('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🐒 STAFF SPEED');
    renderPad('pad-special', TRACK_SPECIAL, game.idxSpecial, 'buySpecial', '✨ BUSINESS');
}

function updateKitchenUI() {
    let container = document.getElementById('stoves-container'); container.innerHTML = ""; 
    seats.forEach((seat, i) => {
        if (seat.occupied && seat.isCooking) {
            let stove = document.createElement('div'); stove.className = "stove-station"; stove.onclick = () => clickStove(i);
            stove.innerHTML = `<div class="stove-label">${["1. Boil", "2. Season", "3. Egg", "Done!"][seat.cookStep]}</div><div class="manual-bowl step-${seat.cookStep}" id="manual-bowl-${i}"></div><div class="stove-burner"></div>`;
            container.appendChild(stove);
        }
    });
}

function prestigeGame() {
    if(game.wallet >= 1e12) {
        if(confirm("Sell franchise for a Michelin Star? You will lose money and upgrades, but gain a permanent x2 profit multiplier!")) {
            let savedStars = game.michelinStars + 1; let savedDecor = game.decorOwned; let savedActive = game.activeDecor;
            localStorage.clear();
            game = { wallet: 150, michelinStars: savedStars, tablesOwned: 1, idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxSpecial: 0, currentMenuPrice: 50, activeDecor: savedActive, decorOwned: savedDecor, inv: { ...defaultInv }, upgrades: {} };
            seats.forEach(s => { s.occupied=false; s.charData=null; s.needsMenu=false; s.isCooking=false; s.needsServing=false; s.needsToPay=false; });
            saveGame(); location.reload();
        }
    }
}

// Admin
let typed = ""; document.addEventListener('keydown', (e) => { typed += e.key.toLowerCase(); if (typed.endsWith("rafay is cool")) { document.getElementById('admin-panel').classList.remove('hidden'); typed = ""; } if (typed.length > 20) typed = typed.slice(-20); });
function cheatMoney(amt) { game.wallet += amt; saveGame(); updateUI(); }
function adminMaxIngredients() { game.inv.noodle += 1e9; game.inv.broth += 1e9; game.inv.spice += 1e9; game.inv.egg += 1e9; document.getElementById('out-of-stock-msg').classList.add('hidden'); saveGame(); updateUI(); }
function cheatStars() { game.michelinStars++; saveGame(); updateUI(); }
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }

function saveGame() { localStorage.setItem('RamenMonkeySaveData_V6', JSON.stringify({ game, currentTaxBracket })); }
function loadGame() { 
    let s = localStorage.getItem('RamenMonkeySaveData_V6'); 
    if(s) { 
        let parsed = JSON.parse(s); game = { ...game, ...parsed.game }; 
        game.inv = { ...defaultInv, ...(parsed.game.inv || {}) }; game.upgrades = { ...(parsed.game.upgrades || {}) };
        if(!game.decorOwned) { game.decorOwned = ['theme-default']; game.activeDecor = 'theme-default'; }
        seats = seats.map(seat => ({ ...seat, needsServing: false, charData: seat.occupied ? generateRandomChar() : null })); 
        if(parsed.currentTaxBracket) currentTaxBracket = parsed.currentTaxBracket;
    } 
    applyTheme();
}
function resetGame() { if(confirm("Erase history?")) { localStorage.clear(); location.reload(); } }

initTables(); loadGame(); applyTheme(); updateUI(); updateKitchenUI(); customerArrives(); if (game.idxAuto > 0) runMonkeyLoop();
