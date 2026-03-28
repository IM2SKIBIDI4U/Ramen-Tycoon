const charColors = {
    skin: ["#ffdbac", "#f1c27d", "#e0ac69"],
    shirt: ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f"]
};

let game = {
    wallet: 300, tablesOwned: 1, idxTable: 0, idxRecipe: 0, idxAuto: 0, currentMenuPrice: 50,
    inv: { noodle: 20, broth: 20, spice: 20, egg: 20 }
};

const TRACK_TABLES = [{name:"Table 2", cost:200}, {name:"Table 3", cost:500}, {name:"Table 4", cost:1200}];
const TRACK_RECIPES = [{name:"Miso", cost:400, val:100}, {name:"Tonkotsu", cost:2000, val:250}];
const TRACK_AUTO = [{name:"Host Monkey", cost:300}, {name:"Waiter Monkey", cost:1500}];

let seats = Array.from({length: 10}, () => ({ occupied: false, needsMenu: false, isCooking: false, cookStep: 0, needsServing: false, needsToPay: false, charData: null }));

function switchTab(tab) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active-view'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${tab}`).classList.add('active-view');
    document.getElementById(`btn-${tab}`).classList.add('active');
}

function spawnCustomer() {
    for (let i = 0; i < game.tablesOwned; i++) {
        if (!seats[i].occupied) {
            seats[i].occupied = true;
            seats[i].needsMenu = true;
            seats[i].charData = {
                skin: charColors.skin[Math.floor(Math.random()*3)],
                shirt: charColors.shirt[Math.floor(Math.random()*4)]
            };
            break;
        }
    }
    setTimeout(spawnCustomer, 4000);
}

// THE MONKEY AI - Handles everything but the Stove
function runMonkeyAI() {
    if (game.idxAuto > 0) {
        for (let i = 0; i < game.tablesOwned; i++) {
            let s = seats[i];
            if (!s.occupied) continue;

            if (s.needsMenu) { s.needsMenu = false; s.isCooking = true; break; }
            if (s.needsServing) { s.needsServing = false; s.needsToPay = true; break; }
            if (s.needsToPay) { 
                game.wallet += game.currentMenuPrice; 
                s.occupied = false; s.needsToPay = false; s.charData = null; 
                break; 
            }
        }
    }
    updateUI();
    updateKitchenUI();
    setTimeout(runMonkeyAI, 1500);
}

function clickStove(index) {
    let s = seats[index];
    if (!s.isCooking) return;

    if (s.cookStep === 0 && game.inv.noodle > 0) { game.inv.noodle--; s.cookStep = 1; }
    else if (s.cookStep === 1 && game.inv.broth > 0) { game.inv.broth--; s.cookStep = 2; }
    else if (s.cookStep === 2 && game.inv.egg > 0) { 
        game.inv.egg--; s.cookStep = 3; 
        setTimeout(() => { s.isCooking = false; s.cookStep = 0; s.needsServing = true; updateUI(); }, 500);
    }
    updateUI();
    updateKitchenUI();
}

function updateUI() {
    document.getElementById('money').innerText = "$" + game.wallet;
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
            div.innerHTML = `<div class="status-bubble">${bubble}</div>
                             <div class="rpg-char" style="--skin:${s.charData.skin}; --shirt:${s.charData.shirt};">
                                <div class="rpg-head"></div><div class="rpg-body"></div>
                             </div>`;
        }
        dArea.appendChild(div);
    }

    renderPad('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑');
    renderPad('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲');
    renderPad('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🐒');
}

function updateKitchenUI() {
    let container = document.getElementById('stoves-container');
    container.innerHTML = "";
    seats.forEach((s, i) => {
        if (s.isCooking) {
            let div = document.createElement('div');
            div.className = "stove-station";
            div.onclick = () => clickStove(i);
            div.innerHTML = `<div class="manual-bowl step-${s.cookStep}"></div>`;
            container.appendChild(div);
        }
    });
}

function renderPad(id, track, idx, func, icon) {
    let el = document.getElementById(id);
    let u = track[idx];
    if (!u) { el.innerHTML = "MAX"; return; }
    let aff = game.wallet >= u.cost ? "affordable" : "";
    el.innerHTML = `<button class="tycoon-pad ${aff}" onclick="${func}()">${icon} ${u.name}<br>$${u.cost}</button>`;
}

function buyTable() { let u = TRACK_TABLES[game.idxTable]; if(game.wallet >= u.cost){ game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; updateUI(); } }
function buyRecipe() { let u = TRACK_RECIPES[game.idxRecipe]; if(game.wallet >= u.cost){ game.wallet -= u.cost; game.currentMenuPrice = u.val; game.idxRecipe++; updateUI(); } }
function buyAuto() { let u = TRACK_AUTO[game.idxAuto]; if(game.wallet >= u.cost){ game.wallet -= u.cost; game.idxAuto++; updateUI(); } }
function buyIngredient(type, amt, cost) { if(game.wallet >= cost){ game.wallet -= cost; game.inv[type] += amt; updateUI(); } }
function resetGame() { localStorage.clear(); location.reload(); }

spawnCustomer();
runMonkeyAI();
