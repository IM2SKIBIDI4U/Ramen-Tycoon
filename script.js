// ==========================================
// GAME DATA & GENERATION
// ==========================================
const TRACK_TABLES = []; let tCost = 50;
for (let i = 2; i <= 50; i++) { TRACK_TABLES.push({ name: `Buy Table ${i}`, cost: tCost }); tCost = Math.floor(tCost * 1.8); }

const TRACK_RECIPES = []; let rCost = 150; let rVal = 100;
for (let i = 1; i <= 100; i++) { TRACK_RECIPES.push({ name: `Recipe Tier ${i}`, cost: rCost, value: rVal }); rCost = Math.floor(rCost * 1.5); rVal = Math.floor(rVal * 1.3); }

const TRACK_AUTO = [
    { name: "Hire Kitchen Monkey", cost: 500 }
];

let game = {
    wallet: 0, tablesOwned: 1,
    idxTable: 0, idxRecipe: 0, idxAuto: 0,
    currentMenuPrice: 50, chefOwned: false
};

const COOK_TIME_MS = 5000; // EXACTLY 5 SECONDS TO COOK
const shirtColors = ["#a2d2ff", "#ffc8dd", "#bde0fe", "#fdcb6e", "#00cec9"];
let seats = Array.from({length: 50}, () => ({ occupied: false, isCooking: false, colorIndex: 0 }));

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
        seats[r].occupied = true; seats[r].isCooking = false;
        seats[r].colorIndex = Math.floor(Math.random() * shirtColors.length);
        updateUI();
    }
    setTimeout(customerArrives, 2000); // New customer every 2 seconds
}

function startCooking(index) {
    if (seats[index].occupied && !seats[index].isCooking) {
        seats[index].isCooking = true;
        let seatEl = document.getElementById(`seat-${index}`);
        
        // EGG ANIMATION + PROGRESS BAR
        seatEl.innerHTML += `<div class="egg">🥚</div><div class="cook-bar-container"><div class="cook-bar" id="bar-${index}"></div></div>`;
        
        let bar = document.getElementById(`bar-${index}`);
        let startTime = Date.now();

        let cookInterval = setInterval(() => {
            let elapsed = Date.now() - startTime;
            let percent = (elapsed / COOK_TIME_MS) * 100;
            if(bar) bar.style.width = percent + "%";

            if (elapsed >= COOK_TIME_MS) {
                clearInterval(cookInterval);
                finishCooking(index);
            }
        }, 50);
    }
}

function finishCooking(index) {
    if (seats[index].occupied && seats[index].isCooking) {
        game.wallet += game.currentMenuPrice;
        seats[index].occupied = false; 
        seats[index].isCooking = false;
        saveGame(); updateUI();
    }
}

// THE KITCHEN MONKEY LOGIC
function runMonkeyLoop() {
    if(game.chefOwned) {
        for(let i=0; i < game.tablesOwned; i++) {
            if(seats[i].occupied && !seats[i].isCooking) {
                let seatEl = document.getElementById(`seat-${i}`);
                if(seatEl) seatEl.innerHTML += `<div class="monkey-chef">🐒</div>`;
                startCooking(i);
                break; // Monkey cooks one table at a time
            }
        }
    }
    // Monkey checks for work every 1 second
    setTimeout(runMonkeyLoop, 1000);
}

// ==========================================
// UPGRADES
// ==========================================
function buyTable() { let u = TRACK_TABLES[game.idxTable]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; saveGame(); updateUI(); } }
function buyRecipe() { let u = TRACK_RECIPES[game.idxRecipe]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.currentMenuPrice = u.value; game.idxRecipe++; saveGame(); updateUI(); } }
function buyAuto() { 
    let u = TRACK_AUTO[game.idxAuto]; 
    if (u && game.wallet >= u.cost) { 
        game.wallet -= u.cost; game.chefOwned = true; game.idxAuto++; 
        saveGame(); updateUI(); runMonkeyLoop(); 
    } 
}

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
        
        if (seat.occupied && !seat.isCooking && !el.innerHTML.includes('customer-wrapper')) {
            el.innerHTML = `<div class="customer-wrapper"><div class="person"><div class="head"></div><div class="body" style="background: ${shirtColors[seat.colorIndex]};"></div></div></div><div class="belt-strip"></div>`;
        } else if (!seat.occupied && !seat.isCooking) {
            el.innerHTML = `<span class="empty-text">Click to Cook</span><div class="belt-strip"></div>`;
        }
    });

    renderPad('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑 TABLES');
    renderPad('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲 RECIPES');
    renderPad('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🐒 KITCHEN MONKEY');
}

// ==========================================
// ADMIN PANEL ($1 MILLION CHEAT)
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
function saveGame() { localStorage.setItem('RamenMonkey_V1', JSON.stringify(game)); }
function loadGame() { let s = localStorage.getItem('RamenMonkey_V1'); if(s) { game = { ...game, ...JSON.parse(s) }; } }
function resetGame() { localStorage.clear(); location.reload(); }

initTables(); loadGame(); updateUI(); customerArrives();
if (game.chefOwned) runMonkeyLoop();
