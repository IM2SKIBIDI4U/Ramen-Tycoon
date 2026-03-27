// --- GAME STATE ---
let gameState = {
    money: 0,
    unlockedItems: ["Basic Ramen"],
    hasMiso: false
};

const seats = [
    { occupied: false, order: "" },
    { occupied: false, order: "" },
    { occupied: false, order: "" }
];

// --- INITIALIZE ---
loadGame();
updateUI();

// --- CORE FUNCTIONS ---

function customerArrives() {
    // Find empty seats
    const emptyIndices = [];
    seats.forEach((s, i) => { if(!s.occupied) emptyIndices.push(i); });

    if (emptyIndices.length > 0) {
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        seats[randomIndex].occupied = true;
        
        // Randomly pick an item from unlocked menu
        const menu = gameState.unlockedItems;
        seats[randomIndex].order = menu[Math.floor(Math.random() * menu.length)];
        
        updateUI();
    }
}

function serveCustomer(index) {
    const seat = seats[index];
    if (seat.occupied) {
        // Calculate Pay
        let pay = 10;
        if (seat.order === "Miso Ramen") pay = 25;
        
        gameState.money += pay;
        seat.occupied = false;
        seat.order = "";
        
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

// --- SYSTEM FUNCTIONS ---

function updateUI() {
    // Update Stats
    document.getElementById('money').innerText = "$" + gameState.money;
    document.getElementById('menu-list').innerText = gameState.unlockedItems.join(", ");

    // Update Seats
    seats.forEach((seat, i) => {
        const seatEl = document.getElementById(`seat-${i}`);
        if (seat.occupied) {
            seatEl.classList.add('occupied');
            seatEl.innerHTML = `👤<br><span class="order-tag">${seat.order}</span>`;
        } else {
            seatEl.classList.remove('occupied');
            seatEl.innerHTML = "Empty";
        }
    });

    // Update Button
    const misoBtn = document.getElementById('buy-miso');
    if (gameState.hasMiso) {
        misoBtn.innerText = "Miso Unlocked!";
        misoBtn.disabled = true;
    } else {
        misoBtn.disabled = gameState.money < 100;
    }
}

function saveGame() {
    localStorage.setItem('ramenTycoonSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('ramenTycoonSave');
    if (saved) {
        gameState = JSON.parse(saved);
    }
}

function resetGame() {
    if(confirm("Are you sure you want to start your shop over from scratch?")) {
        localStorage.clear();
        location.reload();
    }
}

// Customer arrival loop
setInterval(customerArrives, 4000);
