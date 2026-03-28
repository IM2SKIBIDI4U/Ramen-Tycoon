let game = {
    wallet: 100,
    currentMenuPrice: 50,
    inv: { noodle: 10, broth: 10, spice: 10, egg: 10 }
};

let seats = [{ state: 'cooking', cookStep: 0 }];

function formatMoney(n) {
    if (n < 1000) return Math.floor(n).toString();
    return (n / 1000).toFixed(1) + "k";
}

function updateUI() {
    document.getElementById('money').innerText = "$" + formatMoney(game.wallet);
    document.getElementById('inv-noodle').innerText = game.inv.noodle;
    document.getElementById('inv-broth').innerText = game.inv.broth;
    document.getElementById('inv-spice').innerText = game.inv.spice;
    document.getElementById('inv-egg').innerText = game.inv.egg;
}

function switchTab(tabId) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active-view'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${tabId}`).classList.add('active-view');
    event.currentTarget.classList.add('active');
}

function buyIngredient(type, cost) {
    if (game.wallet >= cost) {
        game.wallet -= cost;
        game.inv[type] += 10;
        updateUI();
    }
}

function initKitchen() {
    let container = document.getElementById('stoves-container');
    container.innerHTML = '';
    
    let div = document.createElement('div');
    div.className = 'stove-station';
    div.innerHTML = `<div class="manual-bowl step-${seats[0].cookStep}"></div>`;
    div.onclick = () => clickStove(0);
    container.appendChild(div);
}

function clickStove(index) {
    let seat = seats[index];
    let msg = document.getElementById('kitchen-msg');
    msg.classList.add('hidden');

    if (seat.cookStep === 0) {
        if (game.inv.noodle < 1) { msg.classList.remove('hidden'); return; }
        game.inv.noodle--; seat.cookStep = 1;
    } else if (seat.cookStep === 1) {
        if (game.inv.broth < 1 || game.inv.spice < 1) { msg.classList.remove('hidden'); return; }
        game.inv.broth--; game.inv.spice--; seat.cookStep = 2;
    } else if (seat.cookStep === 2) {
        if (game.inv.egg < 1) { msg.classList.remove('hidden'); return; }
        game.inv.egg--; 

        // Egg Drop Animation
        const stoveElements = document.querySelectorAll('.stove-station');
        const currentStove = stoveElements[index];
        if (currentStove) {
            const eggEmoji = document.createElement('div');
            eggEmoji.className = 'egg-drop';
            eggEmoji.innerText = '🥚';
            currentStove.appendChild(eggEmoji);
            setTimeout(() => eggEmoji.remove(), 500);
        }

        seat.cookStep = 3;
        setTimeout(() => {
            seat.cookStep = 0;
            game.wallet += game.currentMenuPrice;
            initKitchen();
            updateUI();
        }, 500);
    }
    
    updateUI();
    initKitchen();
}

// --- ADMIN PANEL FUNCTIONS ---
function setCustomMoney() {
    let amt = parseFloat(document.getElementById('custom-money').value);
    if (!isNaN(amt)) { game.wallet = amt; updateUI(); }
}
function cheatMoney(amt) { game.wallet += amt; updateUI(); }
function adminMaxIngredients() {
    game.inv = { noodle: 9999, broth: 9999, spice: 9999, egg: 9999 };
    updateUI();
}
function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }

// --- SECRET CHEAT CODE LOGIC ---
let typedString = "";
document.addEventListener("keypress", function(e) {
    typedString += e.key;
    
    // Keep the string short so it doesn't use too much memory
    if (typedString.length > 20) {
        typedString = typedString.substring(typedString.length - 20);
    }
    
    // Check if the secret phrase was typed
    if (typedString.toLowerCase().includes("rafay is cool")) {
        document.getElementById("admin-panel").classList.remove("hidden");
        typedString = ""; // Reset it so it can be triggered again later
    }
});

// Start the game
initKitchen();
updateUI();
