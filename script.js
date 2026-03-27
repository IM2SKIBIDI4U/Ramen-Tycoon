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
        gameState.money += pay;
        seats[index].occupied = false;
        seats[index].order = "";
        saveGame();
        updateUI();
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
        if (seat.occupied) {
            seatEl.classList.add('occupied');
            seatEl.innerHTML = `👤<br><span class="order-tag">${seat.order}</span>`;
        } else {
            seatEl.classList.remove('occupied');
            seatEl.innerHTML = "Empty";
        }
    });

    // Button states
    document.getElementById('buy-miso').disabled = (gameState.money < 100 || gameState.hasMiso);
    if(gameState.hasMiso) document.getElementById('buy-miso').innerText = "Miso Unlocked!";
    
    document.getElementById('buy-chef').disabled = (gameState.money < 250 || gameState.hasChef);
    if(gameState.hasChef) document.getElementById('buy-chef').innerText = "Chef Hired!";
}

// Loops
setInterval(customerArrives, 3000); // Customer every 3 seconds

setInterval(() => {
    if(gameState.hasChef) {
        seats.forEach((s, i) => { if(s.occupied) serveCustomer(i); });
    }
}, 1000); // Chef checks seats every second

function saveGame() { localStorage.setItem('ramenSave', JSON.stringify(gameState)); }
function loadGame() {
    let saved = localStorage.getItem('ramenSave');
    if(saved) gameState = JSON.parse(saved);
}
function resetGame() {
    localStorage.clear();
    location.reload();
}
