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
        
        // 1. Find the customer visually
        let seatEl = document.getElementById(`seat-${index}`);
        let customerDiv = seatEl.querySelector('.customer');
        
        // 2. Change them into money and play the float animation
        if(customerDiv) {
            customerDiv.innerHTML = `+$${pay}`;
            customerDiv.classList.add('served-anim');
        }

        // 3. Wait half a second for the animation to finish before clearing the seat
        setTimeout(() => {
            gameState.money += pay;
            seats[index].occupied = false;
            seats[index].order = "";
            saveGame();
            updateUI();
        }, 500); // 500 milliseconds = 0.5 seconds
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
        
        // Only update the HTML if a new customer just sat down
        // (We don't want to interrupt the float-away animation)
        if (seat.occupied && !seatEl.innerHTML.includes('customer')) {
            seatEl.innerHTML = `<div class="customer">👤<br><span class="order-tag">${seat.order}</span></div>`;
            seatEl.style.borderColor = "#e63946";
        } else if (!seat.occupied) {
            seatEl.innerHTML = `<span class="empty-text">Empty</span>`;
            seatEl.style.borderColor = "#ccc";
        }
    });

    // Button states
    document.getElementById('buy-miso').disabled = (gameState.money < 100 || gameState.hasMiso);
    if(gameState.hasMiso) document.getElementById('buy-miso').innerText = "Miso Unlocked!";
    
    document.getElementById('buy-chef').disabled = (gameState.money < 250 || gameState.hasChef);
    if(gameState.hasChef) document.getElementById('buy-chef').innerText = "Chef Hired!";
}

// Loops
setInterval(customerArrives, 3000); // Customer arrives every 3 seconds

setInterval(() => {
    if(gameState.hasChef) {
        // Find a random occupied seat and serve it
        let occupiedSeats = [];
        seats.forEach((s, i) => { if(s.occupied) occupiedSeats.push(i); });
        if(occupiedSeats.length > 0) {
            serveCustomer(occupiedSeats[0]);
        }
    }
}, 1500); // Chef serves someone every 1.5 seconds

function saveGame() { localStorage.setItem('ramenSave', JSON.stringify(gameState)); }
function loadGame() {
    let saved = localStorage.getItem('ramenSave');
    if(saved) gameState = JSON.parse(saved);
}
function resetGame() {
    localStorage.clear();
    location.reload();
}
