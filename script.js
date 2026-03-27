// --- INITIAL STATE ---
let gameState = {
    money: 0,
    unlockedItems: ["Basic Ramen"],
    hasMiso: false,
    hasChef: false
};

const seats = [
    { occupied: false, order: "" },
    { occupied: false, order: "" },
    { occupied: false, order: "" }
];

// --- RUN ON START ---
loadGame();
updateUI();

// --- GAME LOGIC ---

function customerArrives() {
    let emptySeats = [];
    seats.forEach((s, i) => { if(!s.occupied) emptySeats.push(i); });

    if (emptySeats.length > 0) {
        let randomIndex = emptySeats[Math.floor(Math.random() * emptySeats.length)];
        seats[randomIndex].occupied = true;
        seats[randomIndex].order = gameState.unlockedItems[Math.floor(Math.random() * gameState.unlockedItems.length)];
        updateUI();
    }
}

function serveCustomer(index) {
    if (seats[index].occupied) {
        let pay = (seats[index].order === "Miso Ramen") ? 25 : 10;
        
        let seatEl = document.getElementById(`seat-${index}`);
        let customerDiv = seatEl.querySelector('.customer');
        
        if(customerDiv) {
            customerDiv.innerHTML = `+$${pay}`;
            customerDiv.classList.add('served-anim');
        }

        setTimeout(() => {
            gameState.money += pay;
            seats[index].occupied = false;
            seats[index].order = "";
            saveGame();
            updateUI();
        }, 500); 
    }
}

function buyMiso() {
    if (gameState.money >= 100 && !gameState.hasMiso) {
        gameState.money -= 100;
        gameState.hasMiso = true;
        gameState.unlockedItems.push("Miso Ramen");
        saveGame();
        updateUI();
    }
}

function buyChef() {
    if (gameState.money >= 250 && !gameState.hasChef) {
        gameState.money -= 250;
        gameState.hasChef = true;
        saveGame();
        updateUI();
    }
}

// --- UTILITY ---

function updateUI() {
    document.getElementById('money').innerText = "$" + gameState.money;
    document.getElementById('menu-list').innerText = gameState.unlockedItems.join(", ");

    seats.forEach((seat, i) => {
        let seatEl = document.getElementById(`seat-${i}`);
        
        if (seat.occupied && !seatEl.innerHTML.includes('customer')) {
            seatEl.innerHTML = `<div class="customer">👤<br><span class="order-tag">${seat.order}</span></div>`;
            seatEl.style.borderColor = "#e63946";
        } else if (!seat.occupied) {
            seatEl.innerHTML = `<span class="empty-text">Empty</span>`;
            seatEl.style.borderColor = "#ccc";
        }
    });

    document.getElementById('buy-miso').disabled = (gameState.money < 100 || gameState.hasMiso);
    if(gameState.hasMiso) document.getElementById('buy-miso').innerText = "Miso Unlocked!";
    
    document.getElementById('buy-chef').disabled = (gameState.money < 250 || gameState.hasChef);
    if(gameState.hasChef) document.getElementById('buy-chef').innerText = "Chef Hired!";
}

setInterval(customerArrives, 3000); 

setInterval(() => {
    if(gameState.hasChef) {
        let occupiedSeats = [];
        seats.forEach((s, i) => { if(s.occupied) occupiedSeats.push(i); });
        if(occupiedSeats.length > 0) {
            serveCustomer(occupiedSeats[0]);
        }
    }
}, 1500); 

function saveGame() { localStorage.setItem('ramenSave', JSON.stringify(gameState)); }
function loadGame() {
    let saved = localStorage.getItem('ramenSave');
    if(saved) gameState = JSON.parse(saved);
}
function resetGame() {
    localStorage.clear();
    location.reload();
}

// ==========================================
// 🛠️ SECRET ADMIN PANEL LOGIC 🛠️
// ==========================================

// Method 1: The Console Command
window.rafayIsTheBest = function() {
    document.getElementById('admin-panel').classList.remove('hidden');
    return "Welcome to the mainframe, Boss Rafay.";
}

// Method 2: The Keyboard Cheat Code
let secretCode = "rafay";
let typedKeys = "";

document.addEventListener('keydown', (e) => {
    typedKeys += e.key.toLowerCase();
    
    // Keep only the last 5 letters typed
    if (typedKeys.length > secretCode.length) {
        typedKeys = typedKeys.slice(-secretCode.length);
    }
    
    // Check if it matches!
    if (typedKeys === secretCode) {
        document.getElementById('admin-panel').classList.remove('hidden');
        typedKeys = ""; // Reset the keys so you can type it again later
    }
});

// Admin Button Functions
function cheatMoney() {
    gameState.money += 1000;
    saveGame();
    updateUI();
}

function closeAdmin() {
    document.getElementById('admin-panel').classList.add('hidden');
}
