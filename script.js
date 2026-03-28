const TRACK_TABLES = []; let tCost = 150;
for (let i = 2; i <= 1000; i++) { TRACK_TABLES.push({ name: `Table ${i}`, cost: tCost }); tCost = Math.floor(tCost * 1.85); }

const RAMEN_NAMES = ["Basic Shoyu", "Miso Pork", "Spicy Tonkotsu", "Chicken Paitan", "Seafood Ramen", "Veggie Udon", "Truffle Ramen", "Wagyu Beef", "Dragon Fire", "Golden Emperor"];
const TRACK_RECIPES = []; let rCost = 400; let rVal = 100;
for (let i = 0; i < 100; i++) { let rName = RAMEN_NAMES[i] || `Tier ${i+1} Ramen`; TRACK_RECIPES.push({ name: rName, cost: rCost, value: rVal }); rCost = Math.floor(rCost * 2.2); rVal = Math.floor(rVal * 1.5); }

const TRACK_WOK = [ { name: "Double Wok (Cook 2x)", cost: 100000 }, { name: "Triple Wok (Cook 3x)", cost: 500000 }, { name: "Quad Wok (Cook 4x)", cost: 2000000 }, { name: "Penta Wok (Cook 5x)", cost: 10000000 }, { name: "Hexa Wok (Cook 6x)", cost: 50000000 }, { name: "Hepta Wok (Cook 7x)", cost: 250000000 }, { name: "Octa Wok (Cook 8x)", cost: 1000000000 }, { name: "Nona Wok (Cook 9x)", cost: 5000000000 }, { name: "Deca Wok (Cook 10x)", cost: 25000000000 } ];

const TRACK_AUTO = [ { name: "Hire Monkey Waiter", cost: 1500 }, { name: "Rollerblades", cost: 7500 }, { name: "Espresso Shots", cost: 25000 }, { name: "Walkie Talkies", cost: 100000 }, { name: "Hoverboards", cost: 500000 }, { name: "Energy Drinks", cost: 2500000 }, { name: "Jetpacks", cost: 10000000 }, { name: "Teleport Pad", cost: 50000000 }, { name: "Cyber Implants", cost: 250000000 }, { name: "Ascended Monkeys", cost: 1000000000 } ];

const TRACK_SPECIAL = [ { name: "Neon Sign (Fast Spawns)", cost: 3000 }, { name: "Comfy Chairs (+VIP)", cost: 8000 }, { name: "Bulk Noodles (Half Price)", cost: 15000 }, { name: "Bulk Broth (Half Price)", cost: 25000 }, { name: "Boba Bar (Passive Income)", cost: 60000 }, { name: "Tip Jar (+10% Pay)", cost: 120000 }, { name: "Arcade Machine ($/sec)", cost: 250000 }, { name: "Premium Ingredients (+20%)", cost: 750000 }, { name: "Security Gorilla (10s Tax)", cost: 3000000 }, { name: "Golden Pots (x2 Pay)", cost: 25000000 }, { name: "Secret Spice (+50% Pay)", cost: 100000000 }, { name: "Gold Leaf (+VIP)", cost: 500000000 }, { name: "Franchise (10x Profit)", cost: 200000000000 } ];

const defaultInv = { noodle: 10, broth: 10, spice: 10, egg: 10 };
const defaultUpgrades = { fastSpawn: false, comfyChairs: false, cheapNoodle: false, cheapBroth: false, bobaBar: false, tipJar: false, arcade: false, premiumIng: false, security: false, goldenPots: false, secretSpice: false, goldLeaf: false, franchise: false };

let game = {
    wallet: 150, tablesOwned: 1, idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxSpecial: 0, currentMenuPrice: 50,
    inv: { ...defaultInv }, upgrades: { ...defaultUpgrades }
};

// 🎮 MODDED CHARACTER GENERATOR 🎮
const charColors = {
    skin: ["#ffdbac", "#f1c27d", "#e0ac69", "#8d5524", "#4a3219"],
    hair: ["#090806", "#4a2511", "#b7a69e", "#d6c4c2", "#e25822", "#5e9ca0", "#8e44ad"],
    shirt: ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22", "#1abc9c", "#ffffff"],
    pants: ["#2980b9", "#2c3e50", "#7f8c8d", "#8e44ad", "#c0392b"]
};

function generateRandomChar() {
    return {
        skin: charColors.skin[Math.floor(Math.random() * charColors.skin.length)],
        hair: charColors.hair[Math.floor(Math.random() * charColors.hair.length)],
        shirt: charColors.shirt[Math.floor(Math.random() * charColors.shirt.length)],
        pants: charColors.pants[Math.floor(Math.random() * charColors.pants.length)],
        isVIP: Math.random() < (game.upgrades.goldLeaf ? 0.05 : 0.01)
    };
}

function renderCharHTML(char) {
    let crown = char.isVIP ? `<div style="position:absolute; top:-20px; font-size:1.2rem; animation:vipBounce 0.8s infinite alternate; z-index:10;">👑</div>` : '';
    let shirtColor = char.isVIP ? '#f1c40f' : char.shirt; // VIPs wear solid gold
    return `
        <div class="rpg-char" style="--skin: ${char.skin}; --hair: ${char.hair}; --shirt: ${shirtColor}; --pants: ${char.pants};">
            ${crown}
            <div class="rpg-head"><div class="rpg-hair"></div><div class="rpg-eyes"><div class="rpg-eye"></div><div class="rpg-eye"></div></div></div>
            <div class="rpg-body"></div>
            <div class="rpg-legs"><div class="rpg-leg"></div><div class="rpg-leg"></div></div>
        </div>
    `;
}

let seats = Array.from({length: 1000}, () => ({ occupied: false, needsMenu: false, isCooking: false, cookStep: 0, needsServing: false, needsToPay: false, patience: 100, charData: null }));
let waitList = [];
let currentTaxBracket = 1000000;
let taxActive = false;
let taxTimer = 100;

function switchTab(tab) {
    document.getElementById('view-dining').classList.remove('active-view'); document.getElementById('view-kitchen').classList.remove('active-view');
    document.getElementById('btn-dining').classList.remove('active'); document.getElementById('btn-kitchen').classList.remove('active');
    document.getElementById(`view-${tab}`).classList.add('active-view'); document.getElementById(`btn-${tab}`).classList.add('active');
}

function initTables() {
    let diningArea = document.getElementById('dining-area');
    if (diningArea.children.length === 0) {
        for (let i = 0; i < 1000; i++) {
            let div = document.createElement('div'); div.id = `seat-${i}`; div.className = 'seat locked'; diningArea.appendChild(div);
        }
    }
}

function customerArrives() {
    if (waitList.length < 10) { waitList.push(generateRandomChar()); renderWaitList(); }
    checkEmptySeats();
    setTimeout(customerArrives, game.upgrades.fastSpawn ? 1000 : 2500);
}

function renderWaitList() {
    document.getElementById('wait-list').innerHTML = waitList.map(char => `<div style="margin-bottom: 5px;">${renderCharHTML(char)}</div>`).join('');
}

function checkEmptySeats() {
    if (waitList.length === 0) return;
    for (let i = 0; i < game.tablesOwned; i++) {
        if (!seats[i].occupied) {
            const char = waitList.shift();
            renderWaitList(); spawnWalkingCustomer(i, char); break; 
        }
    }
}

function spawnWalkingCustomer(seatIdx, char) {
    seats[seatIdx].occupied = true; 
    seats[seatIdx].patience = 100;
    
    const walker = document.createElement('div');
    walker.className = "walking-customer walking-anim"; // walking-anim triggers the leg swings!
    walker.innerHTML = renderCharHTML(char);
    
    const door = document.querySelector('.door-frame').getBoundingClientRect();
    walker.style.left = (door.left + door.width/2 - 15) + "px";
    walker.style.top = (door.top - 20) + "px";
    document.body.appendChild(walker);

    setTimeout(() => {
        const seatRect = document.getElementById(`seat-${seatIdx}`).getBoundingClientRect();
        walker.style.left = (seatRect.left + 20) + "px";
        walker.style.top = (seatRect.top + 20) + "px";

        setTimeout(() => {
            walker.remove();
            seats[seatIdx].charData = char;
            seats[seatIdx].needsMenu = true; 
            seats[seatIdx].isCooking = false;
            seats[seatIdx].needsServing = false;
            seats[seatIdx].needsToPay = false;
            seats[seatIdx].cookStep = 0;
            updateUI(); 
        }, 1500);
    }, 50);
}

function handleTableClick(index) {
    let seat = seats[index];
    if (!seat.occupied) return;
    if (seat.needsMenu) { seat.needsMenu = false; seat.patience = 100; updateUI(); } 
    else if (seat.needsServing) { seat.needsServing = false; seat.needsToPay = true; seat.patience = 100; updateUI(); } 
    else if (seat.needsToPay) { collectPayment(index); } 
    else if (!seat.isCooking) { takeOrder(index); seat.patience = 100; }
}

function takeOrder(index) {
    if (seats[index].occupied && !seats[index].isCooking && !seats[index].needsMenu && !seats[index].needsServing && !seats[index].needsToPay) {
        seats[index].isCooking = true; seats[index].cookStep = 0; seats[index].patience = 100; updateUI(); updateKitchenUI();
    }
}

function collectPayment(index) {
    let seat = seats[index];
    let multiplier = seat.charData.isVIP ? 10 : 1;
    if(game.upgrades.tipJar) multiplier += 0.1;
    if(game.upgrades.premiumIng) multiplier += 0.2;
    if(game.upgrades.goldenPots) multiplier *= 2;
    if(game.upgrades.secretSpice) multiplier *= 1.5;
    if(game.upgrades.franchise) multiplier *= 10; 
    
    game.wallet += (game.currentMenuPrice * multiplier); checkTaxMilestone();
    spawnLeavingCustomer(index, seat.charData); 
    seat.occupied = false; seat.needsToPay = false; seat.charData = null;
    saveGame(); updateUI();
}

function spawnLeavingCustomer(seatIdx, char) {
    const walker = document.createElement('div');
    walker.className = "leaving-customer walking-anim";
    
    // If they leave angry (no char data passed), show a red blob, else show the char
    if(char) walker.innerHTML = renderCharHTML(char);
    else walker.innerHTML = `<div style="font-size:2rem;">💢</div>`;
    
    const seatRect = document.getElementById(`seat-${seatIdx}`).getBoundingClientRect();
    walker.style.left = (seatRect.left + 20) + "px";
    walker.style.top = (seatRect.top + 20) + "px";
    document.body.appendChild(walker);

    const door = document.querySelector('.door-frame').getBoundingClientRect();
    setTimeout(() => {
        walker.style.left = (door.left + door.width/2 - 15) + "px";
        walker.style.top = (door.top - 20) + "px";
        walker.style.opacity = "0";
        setTimeout(() => walker.remove(), 1000);
    }, 50);
}

function buyIngredient(type, amount, cost) {
    if (type === 'noodle' && game.upgrades.cheapNoodle) cost = Math.floor(cost / 2);
    if (type === 'broth' && game.upgrades.cheapBroth) cost = Math.floor(cost / 2);
    if (game.wallet >= cost) { game.wallet -= cost; game.inv[type] += amount; document.getElementById('out-of-stock-msg').classList.add('hidden'); updateUI(); saveGame(); }
}

function clickStove(index) {
    let seat = seats[index]; if (!seat.isCooking) return;
    let msg = document.getElementById('out-of-stock-msg');
    
    if (seat.cookStep === 0) { if (game.inv.noodle < 1 || game.inv.broth < 1) { msg.classList.remove('hidden'); return; } game.inv.noodle--; game.inv.broth--; seat.cookStep = 1; } 
    else if (seat.cookStep === 1) { if (game.inv.spice < 1) { msg.classList.remove('hidden'); return; } game.inv.spice--; seat.cookStep = 2; } 
    else if (seat.cookStep === 2) {
        if (game.inv.egg < 1) { msg.classList.remove('hidden'); return; } game.inv.egg--; seat.cookStep = 3;
        updateKitchenUI(); let bowlEl = document.getElementById(`manual-bowl-${index}`); if(bowlEl) bowlEl.innerHTML += `<div class="egg-drop">🥚</div>`;
        
        setTimeout(() => {
            seat.isCooking = false; seat.needsServing = true; seat.patience = 100;
            let maxExtra = game.idxWok; 
            if (maxExtra > 0) {
                let extraServed = 0;
                for (let j = 0; j < game.tablesOwned; j++) {
                    if (extraServed >= maxExtra) break; 
                    if (j !== index && seats[j].occupied && seats[j].isCooking) {
                        seats[j].isCooking = false; seats[j].needsServing = true; seats[j].patience = 100; extraServed++;
                    }
                }
            }
            saveGame(); updateUI(); updateKitchenUI();
        }, 400); return;
    }
    updateUI(); updateKitchenUI();
}

function runMonkeyLoop() {
    if(game.idxAuto > 0) {
        for(let i = 0; i < game.tablesOwned; i++) {
            let s = seats[i];
            if(s.occupied && (s.needsMenu || s.needsServing || (!s.isCooking && !s.needsServing && !s.needsToPay) || s.needsToPay)) { animateMonkeyChefToTable(i); break; }
        }
    }
    const speeds = [9999, 3000, 2500, 2000, 1500, 1000, 800, 600, 400, 200, 100];
    setTimeout(runMonkeyLoop, speeds[game.idxAuto] || 3000);
}

function animateMonkeyChefToTable(index) {
    const monkey = document.createElement('div'); monkey.className = "monkey-chef-walking"; monkey.innerText = "🐒";
    const startBtn = document.getElementById('btn-dining').getBoundingClientRect();
    monkey.style.left = startBtn.left + "px"; monkey.style.top = startBtn.top + "px"; document.body.appendChild(monkey);
    const targetSeat = document.getElementById(`seat-${index}`).getBoundingClientRect();
    setTimeout(() => {
        monkey.style.left = targetSeat.left + "px"; monkey.style.top = targetSeat.top + "px";
        setTimeout(() => {
            monkey.remove(); let s = seats[index];
            if(s.needsMenu) { s.needsMenu = false; s.patience = 100; updateUI(); }
            else if(s.needsServing) { s.needsServing = false; s.needsToPay = true; s.patience = 100; updateUI(); }
            else if(s.needsToPay) collectPayment(index);
            else if(!s.isCooking) takeOrder(index);
        }, 400);
    }, 50);
}

setInterval(() => {
    let seatedCount = 0;
    seats.forEach((seat, i) => {
        if (seat.occupied) {
            seatedCount++;
            if (!seat.isCooking) {
                seat.patience -= 1.5; 
                let bar = document.getElementById(`patience-bar-${i}`);
                if (bar) { bar.style.width = seat.patience + "%"; bar.style.backgroundColor = seat.patience < 30 ? "#d63031" : "#00b894"; }
                if (seat.patience <= 0) {
                    seat.occupied = false; seat.needsMenu = false; seat.needsServing = false; seat.needsToPay = false; seat.charData = null;
                    spawnLeavingCustomer(i, null); updateUI(); updateKitchenUI();
                }
            }
        }
    });
    if(game.upgrades.bobaBar && seatedCount > 0) { game.wallet += (seatedCount * 2); updateUI(); }
}, 200);

function checkTaxMilestone() { if (!taxActive && game.wallet >= currentTaxBracket) triggerTaxEvent(); }
function triggerTaxEvent() {
    taxActive = true; taxTimer = game.upgrades.security ? 200 : 100; 
    document.getElementById('enforcer-overlay').classList.remove('hidden'); document.getElementById('tax-amount').innerText = "$" + formatMoney(currentTaxBracket);
    let taxInterval = setInterval(() => {
        taxTimer -= 2; 
        document.getElementById('tax-timer-fill').style.width = (game.upgrades.security ? (taxTimer/200)*100 : taxTimer) + "%";
        if (taxTimer <= 0) { clearInterval(taxInterval); if (taxActive) raidRestaurant(); }
    }, 100);
}
function payEnforcer() { if (game.wallet >= currentTaxBracket) { game.wallet -= currentTaxBracket; taxActive = false; document.getElementById('enforcer-overlay').classList.add('hidden'); currentTaxBracket *= 1000; updateUI(); saveGame(); } }
function raidRestaurant() { alert("THE ENFORCER TOOK EVERYTHING! YOU ARE BANKRUPT!"); localStorage.clear(); location.reload(); }

function buyTable() { let u = TRACK_TABLES[game.idxTable]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; saveGame(); updateUI(); updateKitchenUI(); } }
function buyRecipe() { let u = TRACK_RECIPES[game.idxRecipe]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.currentMenuPrice = u.value; document.getElementById('stat-menu').innerText = u.name + ` ($${formatMoney(u.value)})`; game.idxRecipe++; saveGame(); updateUI(); } }
function buyAuto() { let u = TRACK_AUTO[game.idxAuto]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.idxAuto++; if (game.idxAuto === 1) runMonkeyLoop(); saveGame(); updateUI(); } }
function buySpecial() { let u = TRACK_SPECIAL[game.idxSpecial]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; const specialKeys = ["fastSpawn", "comfyChairs", "cheapNoodle", "cheapBroth", "bobaBar", "tipJar", "arcade", "premiumIng", "security", "goldenPots", "secretSpice", "goldLeaf", "franchise"]; game.upgrades[specialKeys[game.idxSpecial]] = true; game.idxSpecial++; saveGame(); updateUI(); } }
function buyWok() { let u = TRACK_WOK[game.idxWok]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.idxWok++; saveGame(); updateUI(); } }

setInterval(() => { if(game.upgrades.arcade) { game.wallet += 10; updateUI(); } }, 1000);

function formatMoney(n) {
    if (n >= 1e15) return (n / 1e15).toFixed(2) + "Q"; if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B"; if (n >= 1e6) return (n / 1e6).toFixed(2) + "M"; return Math.floor(n).toLocaleString();
}

function renderPad(id, track, idx, func, title) {
    let container = document.getElementById(id); let u = track[idx];
    if (!u) { container.innerHTML = `<button class="tycoon-pad" style="background:#333; border-color:#000;">${title}<br>MAXED OUT</button>`; } 
    else { let afford = game.wallet >= u.cost ? "affordable" : ""; container.innerHTML = `<button class="tycoon-pad ${afford}" onclick="${func}()"><b>${title}</b><br>${u.name}<br>$${formatMoney(u.cost)}</button>`; }
}

function updateUI() {
    document.getElementById('money').innerText = "$" + formatMoney(game.wallet);
    document.getElementById('inv-noodle').innerText = game.inv.noodle; document.getElementById('inv-broth').innerText = game.inv.broth;
    document.getElementById('inv-spice').innerText = game.inv.spice; document.getElementById('inv-egg').innerText = game.inv.egg;

    seats.forEach((seat, i) => {
        let el = document.getElementById(`seat-${i}`); if (!el) return;
        if (i >= game.tablesOwned) { el.classList.add('locked'); return; } else { el.classList.remove('locked'); }
        
        let html = "";
        if (seat.occupied && seat.charData) {
            if (seat.needsMenu) html += `<div class="menu-request">📜?</div>`;
            if (seat.needsServing) html += `<div class="serve-request">🍜</div>`;
            if (seat.needsToPay && !seat.needsServing) html += `<div class="pay-request">$</div>`;
            html += `<div class="patience-container"><div id="patience-bar-${i}" class="patience-fill" style="width:${seat.patience}%; background-color:${seat.patience < 30 ? '#d63031' : '#00b894'}"></div></div>`;

            // RENDER THE NEW MODDED CHARACTER!
            html += `<div class="customer-wrapper">${renderCharHTML(seat.charData)}</div>`;
            
            if(game.upgrades.bobaBar) html += `<div style="position:absolute; bottom:25px; left:5px; font-size:1rem; z-index:20;">🧋</div>`;

            if (seat.isCooking) html += `<span class="status-text cooking">Cooking</span>`;
            else if (seat.needsServing) html += `<span class="status-text serve">SERVE!</span>`;
            else if (seat.needsMenu) html += `<span class="status-text order" style="color:#e67e22;">Menu?</span>`;
            else if (seat.needsToPay) html += `<span class="status-text order" style="color:#05c46b;">Pay</span>`;
            else html += `<span class="status-text order">Order!</span>`;
        } else { html += `<span class="status-text empty" style="color:#aaa;">Empty</span>`; }
        
        html += `<div class="belt-strip"></div>`; el.innerHTML = html; el.onclick = () => handleTableClick(i);
    });

    renderPad('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑 TABLES'); renderPad('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲 RECIPES');
    renderPad('pad-wok', TRACK_WOK, game.idxWok, 'buyWok', '🍳 THE WOK'); renderPad('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🐒 STAFF');
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

let typed = ""; document.addEventListener('keydown', (e) => { typed += e.key.toLowerCase(); if (typed.endsWith("rafay is cool")) { document.getElementById('admin-panel').classList.remove('hidden'); typed = ""; } if (typed.length > 20) typed = typed.slice(-20); });
function cheatMoney(amt) { game.wallet += amt; saveGame(); updateUI(); }
function adminMaxIngredients() { game.inv.noodle += 1000000000; game.inv.broth += 1000000000; game.inv.spice += 1000000000; game.inv.egg += 1000000000; document.getElementById('out-of-stock-msg').classList.add('hidden'); saveGame(); updateUI(); }
function adminMaxTables() { game.tablesOwned = 1000; game.idxTable = 999; saveGame(); updateUI(); updateKitchenUI(); }
function adminForceVIPs() { let spawned = 0; for(let i=0; i<game.tablesOwned; i++) { if(!seats[i].occupied && spawned < 10) { seats[i].occupied = true; seats[i].isCooking = false; seats[i].cookStep = 0; seats[i].charData = generateRandomChar(); seats[i].charData.isVIP = true; seats[i].needsMenu = true; seats[i].patience = 100; spawned++; } } updateUI(); closeAdmin(); }
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }

function saveGame() { localStorage.setItem('RamenMonkeySaveData', JSON.stringify({ game, currentTaxBracket })); }
function loadGame() { 
    let s = localStorage.getItem('RamenMonkeySaveData'); if (!s) s = localStorage.getItem('RamenGodChef_V5'); 
    if(s) { 
        let parsed = JSON.parse(s); game = { ...game, ...parsed.game }; 
        game.inv = { ...defaultInv, ...(parsed.game.inv || {}) }; game.upgrades = { ...defaultUpgrades, ...(parsed.game.upgrades || {}) };
        if (game.idxWok === undefined) { game.idxWok = 0; if (parsed.game.upgrades && parsed.game.upgrades.batchCooking) game.idxWok = 4; else if (parsed.game.upgrades && parsed.game.upgrades.tripleWok) game.idxWok = 2; }
        seats = seats.map(seat => ({ ...seat, needsServing: false, charData: seat.occupied ? generateRandomChar() : null })); // Generate fresh chars for existing saves
        if(parsed.currentTaxBracket) currentTaxBracket = parsed.currentTaxBracket;
        if(game.idxRecipe > 0) document.getElementById('stat-menu').innerText = TRACK_RECIPES[game.idxRecipe-1].name + ` ($${formatMoney(game.currentMenuPrice)})`;
    } 
}
function resetGame() { if(confirm("Erase history?")) { localStorage.clear(); location.reload(); } }

initTables(); loadGame(); updateUI(); updateKitchenUI(); customerArrives(); if (game.idxAuto > 0) runMonkeyLoop();
