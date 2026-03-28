// ==========================================
// GAME DATA & GENERATION
// ==========================================
const TRACK_TABLES = []; let tCost = 50;
for (let i = 2; i <= 50; i++) { TRACK_TABLES.push({ name: `Buy Table ${i}`, cost: tCost }); tCost = Math.floor(tCost * 1.8); }

const TRACK_RECIPES = []; let rCost = 150; let rVal = 100;
for (let i = 1; i <= 100; i++) { TRACK_RECIPES.push({ name: `Recipe Tier ${i}`, cost: rCost, value: rVal }); rCost = Math.floor(rCost * 1.5); rVal = Math.floor(rVal * 1.3); }

const TRACK_AUTO = [{ name: "Hire Kitchen Monkey", cost: 500 }];

let game = {
    wallet: 0, tablesOwned: 1,
    idxTable: 0, idxRecipe: 0, idxAuto: 0,
    currentMenuPrice: 50, chefOwned: false
};

const COOK_TIME_MS = 5000; // EXACTLY 5 SECONDS TO COOK
const shirtColors = ["#a2d2ff", "#ffc8dd", "#bde0fe", "#fdcb6e", "#00cec9"];

// Added isVIP flag to track if the Red Panda is sitting there
let seats = Array.from({length: 50}, () => ({ occupied: false, isCooking: false, colorIndex: 0, isVIP: false }));

// ==========================================
// INITIALIZATION
// ==========================================
function initTables() {
    let diningArea = document.getElementById('dining-area');
    if (diningArea.children.length === 0) {
        for (let i = 0; i < 50; i++) {
            let div = document.createElement('div');
            div.id = `seat-${i}`; div.className = 'seat locked';
            div.onclick = () => startCooking(i);
            diningArea.appendChild(div);
        }
    }
}

// ==========================================
// GAMEPLAY LOGIC
// ==========================================
function customerArrives() {
    let emptySeats = [];
    for(let i = 0; i < game.tablesOwned; i++) { if(!seats[i].occupied) emptySeats.push(i); }
    
    if (emptySeats.length > 0) {
        let r = emptySeats[Math.floor(Math.random() * emptySeats.length)];
        seats[r].occupied = true; 
        seats[r].isCooking = false;
        seats[r].colorIndex = Math.floor(Math.random() * shirtColors.length);
        
        // 5% Chance for VIP Red Panda to spawn!
        seats[r].isVIP = Math.random() < 0.05; 
        
        updateUI();
    }
    setTimeout(customerArrives, 2000); // New customer every 2 seconds
}

function startCooking(index) {
    if (seats[index].occupied && !seats[index].isCooking) {
        seats[index].isCooking = true;
        
        // Spawn the pot and egg IN THE KITCHEN
        let stoves = document.getElementById('stoves-container');
        let pot = document.createElement('div');
        pot.className = 'kitchen-pot';
        pot.id = `pot-${index}`;
        pot.innerHTML = `
            <div class="egg-drop">🥚</div>
            <div class="pot-bar-container"><div class="pot-bar" id="bar-${index}"></div></div>
        `;
        stoves.appendChild(pot);
        
        let startTime = Date.now();
        let cookInterval = setInterval(() => {
            let elapsed = Date.now() - startTime;
            let percent = (elapsed / COOK_TIME_MS) * 100;
            let bar = document.getElementById(`bar-${index}`);
            if(bar) bar.style.width = percent + "%";

            if (elapsed >= COOK_TIME_MS) {
                clearInterval(cookInterval);
                finishCooking(index);
            }
        }, 50);
        
        updateUI(); // Updates the table text to "Wait..."
    }
}

function finishCooking(index) {
    if (seats[index].occupied && seats[index].isCooking) {
        // VIP pays 10x the normal amount
        let multiplier = seats[index].isVIP ? 10 : 1;
        game.wallet += (game.currentMenuPrice * multiplier);
        
        // Clear the table
        seats[index].occupied = false; 
        seats[index].isCooking = false;
        seats[index].isVIP = false;
        
        // Remove the pot from the kitchen
        let pot = document.getElementById(`pot-${index}`);
        if(pot) pot.remove();

        saveGame(); updateUI();
    }
}

// THE KITCHEN MONKEY LOGIC
function runMonkeyLoop() {
    if(game.chefOwned) {
        for(let i=0; i < game.tablesOwned; i++) {
            if(seats[i].occupied && !seats[i].isCooking) {
                // Monkey appears on the table to take the order, which sends the food to the kitchen
                let seatEl = document.getElementById(`seat-${i}`);
                if(seatEl) {
                    let monkey = document.createElement('div');
                    monkey.className = "monkey-chef";
                    monkey.innerText = "🐒";
                    seatEl.appendChild(monkey);
                    setTimeout(() => monkey.remove(), 500); // Monkey jumps away
                }
                startCooking(i);
                break; // Monkey takes one order at a time
            }
        }
    }
    setTimeout(runMonkeyLoop, 1000);
}

// ==========================================
// UPGRADES
// ==========================================
function buyTable() { let u = TRACK_TABLES[game.idxTable]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; saveGame(); updateUI(); } }
function buyRecipe() { let u = TRACK_RECIPES[game.idxRecipe]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.currentMenuPrice = u.value; game.idxRecipe++; saveGame(); updateUI(); } }
function buyAuto() { let u = TRACK_AUTO[game.idxAuto]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.chefOwned = true; game.idxAuto++; saveGame(); updateUI(); runMonkeyLoop(); } }

// ==========================================
// UI & SYSTEMS
// ==========================================
function formatMoney(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    return Math.floor(n).toLocaleString();
}

function renderPad(id, track, idx, func, title) {
    let container = document.getElementById(id); let u = track[idx];
    if (!u) { container.innerHTML = `<button class="tycoon-pad" style="background:#ccc; border-color:#999; color:#000;">${title}<br>MAXED</button>`; } 
    else {
        let afford = game.wallet >= u.cost ? "affordable" : "";
        container.innerHTML = `<button class="tycoon-pad ${afford}" onclick="${func}()"><b>${title}</b><br>${u.name}<br>$${formatMoney(u.cost)}</button>`;
    }
}

function updateUI() {
    document.getElementById('money').innerText = "$" + formatMoney(game.wallet);
    document.getElementById('stat-menu').innerText = `Tier ${game.idxRecipe} ($${formatMoney(game.currentMenuPrice)})`;

    seats.forEach((seat, i) => {
        let el = document.getElementById(`seat-${i}`); if (!el) return;
        if (i >= game.tablesOwned) { el.classList.add('locked'); return; } else { el.classList.remove('locked'); }
        
        let html = "";
        
        if (seat.occupied) {
            // Check if VIP or Normal Customer
            if (seat.isVIP) {
                html += `<div class="vip-panda">🐼</div>`;
            } else {
                html += `<div class="customer-wrapper"><div class="person"><div class="head"></div><div class="body" style="background: ${shirtColors[seat.colorIndex]};"></div></div></div>`;
            }
            // Check if cooking
            if (seat.isCooking) {
                html += `<span class="status-text cooking">Wait...</span>`;
            } else {
                html += `<span class="status-text order">Click!</span>`;
            }
        } else {
            html += `<span class="status-text empty">Empty</span>`;
        }
        html += `<div class="belt-strip"></div>`;
        
        // Prevent flickering by only replacing HTML if it has changed
        let stateString = `${seat.occupied}-${seat.isCooking}-${seat.isVIP}`;
        if (el.getAttribute('data-state') !== stateString) {
            el.innerHTML = html;
            el.setAttribute('data-state', stateString);
        }
    });

    renderPad('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑 TABLES');
    renderPad('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲 RECIPES');
    renderPad('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🐒 KITCHEN MONKEY');
}

// ==========================================
// ADMIN PANEL
// ==========================================
let typed = "";
document.addEventListener('keydown', (e) => {
    typed += e.key.toLowerCase();
    if (typed.endsWith("rafay")) { document.getElementById('admin-panel').classList.remove('hidden'); typed = ""; }
});
function cheatMoney(amt) { game.wallet += amt; saveGame(); updateUI(); }
function adminMaxTables() { game.tablesOwned = 50; game.idxTable = 50; saveGame(); updateUI(); }
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }

// ==========================================
// SAVE/LOAD
// ==========================================
function saveGame() { localStorage.setItem('RamenVIPKitchen_V1', JSON.stringify(game)); }
function loadGame() { let s = localStorage.getItem('RamenVIPKitchen_V1'); if(s) { game = { ...game, ...JSON.parse(s) }; } }
function resetGame() { localStorage.clear(); location.reload(); }

initTables(); loadGame(); updateUI(); customerArrives();
if (game.chefOwned) runMonkeyLoop();
