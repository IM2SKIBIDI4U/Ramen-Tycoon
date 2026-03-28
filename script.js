const TRACK_TABLES = []; let tCost = 100;
for (let i = 2; i <= 1000; i++) { 
    TRACK_TABLES.push({ name: `Table ${i}`, cost: tCost }); 
    tCost = Math.floor(tCost * 1.8); 
}

const RAMEN_NAMES = ["Basic Shoyu", "Miso Pork", "Spicy Tonkotsu", "Chicken Paitan", "Seafood Ramen", "Veggie Udon", "Truffle Ramen", "Wagyu Beef", "Dragon Fire", "Golden Emperor"];
const TRACK_RECIPES = []; let rCost = 300; let rVal = 100;
for (let i = 0; i < 100; i++) { 
    let rName = RAMEN_NAMES[i] || `Tier ${i+1} Ramen`;
    TRACK_RECIPES.push({ name: rName, cost: rCost, value: rVal }); 
    rCost = Math.floor(rCost * 2.0); 
    rVal = Math.floor(rVal * 1.5); 
}

const TRACK_AUTO = [{ name: "Monkey Waiters", cost: 1000 }];

const TRACK_SPECIAL = [
    { name: "Neon Sign (Fast Spawns)", cost: 2000 },
    { name: "Comfy Chairs (+VIP)", cost: 5000 },
    { name: "Bulk Noodles (Half Price)", cost: 10000 },
    { name: "Bulk Broth (Half Price)", cost: 15000 },
    { name: "Boba Bar (Passive Income)", cost: 30000 },
    { name: "Tip Jar (+10% Pay)", cost: 75000 },
    { name: "Arcade Machine ($/sec)", cost: 150000 },
    { name: "Fast Shoes (Monkey x2 Speed)", cost: 500000 },
    { name: "Security Gorilla (10s Tax)", cost: 2000000 },
    { name: "Golden Pots (x2 Pay)", cost: 10000000 },
    { name: "Secret Spice (+50% Pay)", cost: 50000000 },
    { name: "Gold Leaf (+VIP)", cost: 250000000 },
    { name: "Franchise License (10x Profit)", cost: 100000000000 }
];

let game = {
    wallet: 150, tablesOwned: 1,
    idxTable: 0, idxRecipe: 0, idxAuto: 0, idxSpecial: 0,
    currentMenuPrice: 50, chefOwned: false,
    inv: { noodle: 10, broth: 10, spice: 10, egg: 10 },
    upgrades: { fastSpawn: false, comfyChairs: false, cheapNoodle: false, cheapBroth: false, bobaBar: false, tipJar: false, arcade: false, fastMonkey: false, security: false, goldenPots: false, secretSpice: false, goldLeaf: false, franchise: false }
};

const shirtColors = ["#a2d2ff", "#ffc8dd", "#bde0fe", "#fdcb6e", "#00cec9"];
let seats = Array.from({length: 1000}, () => ({ occupied: false, needsMenu: false, isCooking: false, cookStep: 0, needsToPay: false, patience: 100, colorIndex: 0, isVIP: false }));
let waitList = [];
let currentTaxBracket = 1000000;
let taxActive = false;
let taxTimer = 100;

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
            diningArea.appendChild(div);
        }
    }
}

function customerArrives() {
    if (waitList.length < 15) {
        const isVIP = Math.random() < (game.upgrades.goldLeaf ? 0.05 : 0.01);
        waitList.push(isVIP ? "🐼" : "🐒");
        renderWaitList();
    }
    checkEmptySeats();
    let spawnRate = game.upgrades.fastSpawn ? 1000 : 2500;
    setTimeout(customerArrives, spawnRate);
}

function renderWaitList() {
    document.getElementById('wait-list').innerHTML = waitList.map(m => `<div class="waiting-monkey">${m}</div>`).join('');
}

function checkEmptySeats() {
    if (waitList.length === 0) return;
    for (let i = 0; i < game.tablesOwned; i++) {
        if (!seats[i].occupied) {
            const char = waitList.shift();
            renderWaitList();
            spawnWalkingCustomer(i, char); // Triggers the animation
            break; 
        }
    }
}

// 🌟 THE WALKING IN ANIMATION 🌟
function spawnWalkingCustomer(seatIdx, char) {
    seats[seatIdx].occupied = true; // Reserve the seat so no one else takes it
    seats[seatIdx].patience = 100;
    
    const walker = document.createElement('div');
    walker.className = "walking-customer waddle-anim";
    walker.innerText = char;
    
    // Start at the door
    const door = document.querySelector('.door-frame');
    const doorRect = door.getBoundingClientRect();
    walker.style.left = (doorRect.left + doorRect.width/2 - 15) + "px";
    walker.style.top = doorRect.top + "px";
    document.body.appendChild(walker);

    // Wait 50ms for CSS to apply, then move to the table
    setTimeout(() => {
        const seatEl = document.getElementById(`seat-${seatIdx}`);
        const seatRect = seatEl.getBoundingClientRect();
        
        walker.style.left = seatRect.left + "px";
        walker.style.top = (seatRect.top + 10) + "px";

        // Wait 1.5 seconds for the walking to finish, then sit them down
        setTimeout(() => {
            walker.remove();
            seats[seatIdx].isVIP = (char === "🐼");
            seats[seatIdx].needsMenu = true; 
            seats[seatIdx].isCooking = false;
            seats[seatIdx].needsToPay = false;
            seats[seatIdx].cookStep = 0;
            seats[seatIdx].colorIndex = Math.floor(Math.random() * shirtColors.length);
            updateUI(); // Customer visually appears at the table
        }, 1500);
    }, 50);
}

function handleTableClick(index) {
    let seat = seats[index];
    if (!seat.occupied) return;

    if (seat.needsMenu) {
        seat.needsMenu = false;
        seat.patience = 100;
        updateUI();
    } else if (seat.needsToPay) {
        collectPayment(index);
    } else if (!seat.isCooking) {
        takeOrder(index);
        seat.patience = 100;
    }
}

function takeOrder(index) {
    if (seats[index].occupied && !seats[index].isCooking && !seats[index].needsMenu && !seats[index].needsToPay) {
        seats[index].isCooking = true;
        seats[index].cookStep = 0;
        seats[index].patience = 100;
        updateUI(); updateKitchenUI();
    }
}

function collectPayment(index) {
    let seat = seats[index];
    let multiplier = seat.isVIP ? 10 : 1;
    if(game.upgrades.tipJar) multiplier += 0.1;
    if(game.upgrades.goldenPots) multiplier *= 2;
    if(game.upgrades.secretSpice) multiplier *= 1.5;
    if(game.upgrades.franchise) multiplier *= 10; 
    
    game.wallet += (game.currentMenuPrice * multiplier);
    checkTaxMilestone();
    
    spawnLeavingCustomer(index, seat.isVIP ? "🐼" : "🐒"); // Triggers leaving animation
    seat.occupied = false;
    seat.needsToPay = false;
    
    saveGame(); updateUI();
}

// 🌟 THE LEAVING ANIMATION 🌟
function spawnLeavingCustomer(seatIdx, char) {
    const walker = document.createElement('div');
    walker.className = "leaving-customer waddle-anim";
    walker.innerText = char;
    
    // Start at the table
    const seatEl = document.getElementById(`seat-${seatIdx}`);
    const seatRect = seatEl.getBoundingClientRect();
    walker.style.left = seatRect.left + "px";
    walker.style.top = seatRect.top + "px";
    document.body.appendChild(walker);

    const door = document.querySelector('.door-frame');
    const doorRect = door.getBoundingClientRect();

    // Walk to the door and fade out
    setTimeout(() => {
        walker.style.left = (doorRect.left + doorRect.width/2 - 15) + "px";
        walker.style.top = doorRect.top + "px";
        walker.style.opacity = "0";
        setTimeout(() => walker.remove(), 1000);
    }, 50);
}

function buyIngredient(type, amount, cost) {
    if (type === 'noodle' && game.upgrades.cheapNoodle) cost = Math.floor(cost / 2);
    if (type === 'broth' && game.upgrades.cheapBroth) cost = Math.floor(cost / 2);

    if (game.wallet >= cost) {
        game.wallet -= cost;
        game.inv[type] += amount;
        document.getElementById('out-of-stock-msg').classList.add('hidden');
        updateUI(); saveGame();
    }
}

function clickStove(index) {
    let seat = seats[index];
    if (!seat.isCooking) return;
    let msg = document.getElementById('out-of-stock-msg');
    
    if (seat.cookStep === 0) {
        if (game.inv.noodle < 1 || game.inv.broth < 1) { msg.classList.remove('hidden'); return; }
        game.inv.noodle--; game.inv.broth--;
        seat.cookStep = 1;
    } 
    else if (seat.cookStep === 1) {
        if (game.inv.spice < 1) { msg.classList.remove('hidden'); return; }
        game.inv.spice--;
        seat.cookStep = 2;
    } 
    else if (seat.cookStep === 2) {
        if (game.inv.egg < 1) { msg.classList.remove('hidden'); return; }
        game.inv.egg--;
        seat.cookStep = 3;
        
        updateKitchenUI();
        let bowlEl = document.getElementById(`manual-bowl-${index}`);
        if(bowlEl) bowlEl.innerHTML += `<div class="egg-drop">🥚</div>`;
        
        setTimeout(() => {
            seat.isCooking = false;
            seat.needsToPay = true;
            seat.patience = 100;
            saveGame(); updateUI(); updateKitchenUI();
        }, 400);
        return;
    }
    updateUI(); updateKitchenUI();
}

function runMonkeyLoop() {
    if(game.chefOwned) {
        for(let i = 0; i < game.tablesOwned; i++) {
            let s = seats[i];
            if(s.occupied && (s.needsMenu || (!s.isCooking && !s.needsToPay) || s.needsToPay)) {
                animateMonkeyChefToTable(i);
                break;
            }
        }
    }
    setTimeout(runMonkeyLoop, game.upgrades.fastMonkey ? 400 : 800);
}

function animateMonkeyChefToTable(index) {
    const monkey = document.createElement('div');
    monkey.className = "monkey-chef-walking";
    monkey.innerText = "🤵🐒";
    
    const startBtn = document.getElementById('btn-dining').getBoundingClientRect();
    monkey.style.left = startBtn.left + "px";
    monkey.style.top = startBtn.top + "px";
    document.body.appendChild(monkey);

    const targetSeat = document.getElementById(`seat-${index}`).getBoundingClientRect();
    
    setTimeout(() => {
        monkey.style.left = targetSeat.left + "px";
        monkey.style.top = targetSeat.top + "px";
        
        setTimeout(() => {
            monkey.remove();
            let s = seats[index];
            if(s.needsMenu) { s.needsMenu = false; s.patience = 100; updateUI(); }
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
                if (bar) {
                    bar.style.width = seat.patience + "%";
                    if(seat.patience < 30) bar.style.backgroundColor = "#d63031";
                    else bar.style.backgroundColor = "#00b894";
                }

                if (seat.patience <= 0) {
                    seat.occupied = false;
                    seat.needsMenu = false;
                    seat.needsToPay = false;
                    spawnLeavingCustomer(i, "💢"); // Leaves angry if out of patience
                    updateUI(); updateKitchenUI();
                }
            }
        }
    });

    if(game.upgrades.bobaBar && seatedCount > 0) {
        game.wallet += (seatedCount * 2);
        updateUI();
    }
}, 200);

function checkTaxMilestone() {
    if (!taxActive && game.wallet >= currentTaxBracket) {
        triggerTaxEvent();
    }
}

function triggerTaxEvent() {
    taxActive = true;
    taxTimer = game.upgrades.security ? 200 : 100; 
    
    document.getElementById('enforcer-overlay').classList.remove('hidden');
    document.getElementById('tax-amount').innerText = "$" + formatMoney(currentTaxBracket);
    
    let taxInterval = setInterval(() => {
        taxTimer -= 2; 
        let percent = game.upgrades.security ? (taxTimer/200)*100 : taxTimer;
        document.getElementById('tax-timer-fill').style.width = percent + "%";
        
        if (taxTimer <= 0) {
            clearInterval(taxInterval);
            if (taxActive) raidRestaurant(); 
        }
    }, 100);
}

function payEnforcer() {
    if (game.wallet >= currentTaxBracket) {
        game.wallet -= currentTaxBracket;
        taxActive = false;
        document.getElementById('enforcer-overlay').classList.add('hidden');
        currentTaxBracket *= 1000; 
        updateUI(); saveGame();
    }
}

function raidRestaurant() {
    alert("THE ENFORCER TOOK EVERYTHING! YOU ARE BANKRUPT!");
    localStorage.clear();
    location.reload();
}

function buyTable() { let u = TRACK_TABLES[game.idxTable]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; saveGame(); updateUI(); updateKitchenUI(); } }
function buyRecipe() { let u = TRACK_RECIPES[game.idxRecipe]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.currentMenuPrice = u.value; document.getElementById('stat-menu').innerText = u.name + ` ($${formatMoney(u.value)})`; game.idxRecipe++; saveGame(); updateUI(); } }
function buyAuto() { let u = TRACK_AUTO[game.idxAuto]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.chefOwned = true; game.idxAuto++; saveGame(); updateUI(); runMonkeyLoop(); } }

function buySpecial() { 
    let u = TRACK_SPECIAL[game.idxSpecial]; 
    if (u && game.wallet >= u.cost) { 
        game.wallet -= u.cost; 
        switch(game.idxSpecial) {
            case 0: game.upgrades.fastSpawn = true; break;
            case 1: game.upgrades.comfyChairs = true; break;
            case 2: game.upgrades.cheapNoodle = true; break;
            case 3: game.upgrades.cheapBroth = true; break;
            case 4: game.upgrades.bobaBar = true; break;
            case 5: game.upgrades.tipJar = true; break;
            case 6: game.upgrades.arcade = true; break;
            case 7: game.upgrades.fastMonkey = true; break;
            case 8: game.upgrades.security = true; break;
            case 9: game.upgrades.goldenPots = true; break;
            case 10: game.upgrades.secretSpice = true; break;
            case 11: game.upgrades.goldLeaf = true; break;
            case 12: game.upgrades.franchise = true; break;
        }
        game.idxSpecial++; saveGame(); updateUI(); 
    } 
}

setInterval(() => { if(game.upgrades.arcade) { game.wallet += 10; updateUI(); } }, 1000);

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
            if (seat.needsMenu) html += `<div class="menu-request">📜?</div>`;
            if (seat.needsToPay) html += `<div class="pay-request">$</div>`;
            
            html += `<div class="patience-container"><div id="patience-bar-${i}" class="patience-fill" style="width:${seat.patience}%; background-color:${seat.patience < 30 ? '#d63031' : '#00b894'}"></div></div>`;

            if (seat.isVIP) html += `<div class="vip-panda">🐼</div>`;
            else html += `<div class="customer-wrapper"><div class="person"><div class="head"></div><div class="body" style="background: ${shirtColors[seat.colorIndex]};"></div></div></div>`;
            
            if(game.upgrades.bobaBar) html += `<div style="position:absolute; bottom:25px; left:5px; font-size:1rem; z-index:3;">🧋</div>`;

            if (seat.isCooking) html += `<span class="status-text cooking">Cooking</span>`;
            else if (seat.needsMenu) html += `<span class="status-text order" style="color:#e67e22;">Menu?</span>`;
            else if (seat.needsToPay) html += `<span class="status-text order" style="color:#05c46b;">Pay</span>`;
            else html += `<span class="status-text order">Order!</span>`;
        } else {
            html += `<span class="status-text empty" style="color:#aaa;">Empty</span>`;
        }
        html += `<div class="belt-strip"></div>`;
        
        el.innerHTML = html;
        el.onclick = () => handleTableClick(i);
    });

    renderPad('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑 TABLES');
    renderPad('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲 RECIPES');
    renderPad('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🤵 STAFF');
    renderPad('pad-special', TRACK_SPECIAL, game.idxSpecial, 'buySpecial', '✨ BUSINESS');
}

function updateKitchenUI() {
    let container = document.getElementById('stoves-container');
    container.innerHTML = ""; 
    
    seats.forEach((seat, i) => {
        if (seat.occupied && seat.isCooking) {
            let labelText = ["1. Boil", "2. Season", "3. Egg", "Done!"][seat.cookStep];
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

let typed = "";
document.addEventListener('keydown', (e) => {
    typed += e.key.toLowerCase();
    if (typed.endsWith("rafay is cool")) { document.getElementById('admin-panel').classList.remove('hidden'); typed = ""; }
    if (typed.length > 20) typed = typed.slice(-20);
});

function cheatMoney(amt) { game.wallet += amt; saveGame(); updateUI(); }
function adminMaxIngredients() { game.inv.noodle += 1000000000; game.inv.broth += 1000000000; game.inv.spice += 1000000000; game.inv.egg += 1000000000; document.getElementById('out-of-stock-msg').classList.add('hidden'); saveGame(); updateUI(); }
function adminMaxTables() { game.tablesOwned = 1000; game.idxTable = 999; saveGame(); updateUI(); updateKitchenUI(); }
function adminForceVIPs() {
    let spawned = 0;
    for(let i=0; i<game.tablesOwned; i++) {
        if(!seats[i].occupied && spawned < 10) {
            seats[i].occupied = true; seats[i].isCooking = false; seats[i].cookStep = 0; seats[i].isVIP = true; seats[i].needsMenu = true; seats[i].patience = 100; spawned++;
        }
    }
    updateUI(); closeAdmin();
}
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }

function saveGame() { localStorage.setItem('RamenGodChef_V5', JSON.stringify({ game, currentTaxBracket })); }
function loadGame() { 
    let s = localStorage.getItem('RamenGodChef_V5'); 
    if(s) { 
        let parsed = JSON.parse(s);
        game = { ...game, ...parsed.game }; 
        if(parsed.currentTaxBracket) currentTaxBracket = parsed.currentTaxBracket;
        if(game.idxRecipe > 0) document.getElementById('stat-menu').innerText = TRACK_RECIPES[game.idxRecipe-1].name + ` ($${formatMoney(game.currentMenuPrice)})`;
    } 
}
function resetGame() { if(confirm("Erase history?")) { localStorage.clear(); location.reload(); } }

initTables(); loadGame(); updateUI(); updateKitchenUI(); customerArrives();
if (game.chefOwned) runMonkeyLoop();
