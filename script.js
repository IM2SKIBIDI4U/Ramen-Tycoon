// --- NEW SOUND SYSTEM ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    
    if(type === 'cash') { osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); osc.start(); osc.stop(audioCtx.currentTime + 0.1); }
    else if(type === 'cook') { osc.type = 'square'; osc.frequency.setValueAtTime(200, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1); gain.gain.setValueAtTime(0.05, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); osc.start(); osc.stop(audioCtx.currentTime + 0.1); }
    else if(type === 'serve') { osc.type = 'triangle'; osc.frequency.setValueAtTime(400, audioCtx.currentTime); gain.gain.setValueAtTime(0.05, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1); osc.start(); osc.stop(audioCtx.currentTime + 0.1); }
    else if(type === 'error') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2); osc.start(); osc.stop(audioCtx.currentTime + 0.2); }
}

// --- FORMATTERS ---
const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qd", "Qnd", "Sxd", "Spd", "Ocd"];
function formatMoney(n) {
    if (n < 1000) return Math.floor(n).toString();
    let exponent = Math.floor(Math.log10(n)); let suffixNum = Math.floor(exponent / 3);
    if (suffixNum < suffixes.length) { let shortValue = n / Math.pow(10, suffixNum * 3); return shortValue.toFixed(2) + suffixes[suffixNum]; }
    return n.toExponential(2);
}

// --- VISUAL EFFECTS ---
function spawnFloatingMoney(amount, targetId, color = '#2ecc71') {
    let targetEl = document.getElementById(targetId);
    let floatText = document.createElement('div');
    floatText.className = 'floating-money';
    floatText.innerText = typeof amount === 'number' ? `+$${formatMoney(amount)}` : amount;
    floatText.style.position = 'absolute';
    floatText.style.color = color;
    floatText.style.fontWeight = 'bold';
    floatText.style.fontSize = '1.2rem';
    floatText.style.pointerEvents = 'none';
    floatText.style.zIndex = '100';
    floatText.style.animation = 'floatUp 1s ease-out forwards';
    
    if (targetEl) {
        let rect = targetEl.getBoundingClientRect();
        floatText.style.left = (rect.left + window.scrollX + 20) + 'px';
        floatText.style.top = (rect.top + window.scrollY) + 'px';
    } else {
        floatText.style.left = '50%';
        floatText.style.top = '50%';
    }
    
    document.body.appendChild(floatText);
    setTimeout(() => floatText.remove(), 1000);
}

if (!document.getElementById('floating-money-style')) {
    let style = document.createElement('style');
    style.id = 'floating-money-style';
    style.innerHTML = `@keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-50px); } }`;
    document.head.appendChild(style);
}

// --- ARRAYS & DATA ---
const TRACK_TABLES = Array.from({length: 1000}, (_, i) => ({ 
    name: `Table ${i+2}`, 
    cost: Math.floor(200 * Math.pow(1.12, i)) 
}));

const TRACK_WOK = Array.from({length: 1000}, (_, i) => ({ 
    name: `Wok Lvl ${i+2}`, 
    cost: Math.floor(75000 * Math.pow(1.13, i)) 
}));

const TRACK_AUTO = Array.from({length: 1000}, (_, i) => ({ 
    name: `Chef Speed Lvl ${i+1}`, 
    cost: Math.floor(1200 * Math.pow(1.11, i)) 
}));
const TRACK_ADS = Array.from({length: 1000}, (_, i) => ({ 
    name: `Marketing Lvl ${i+1}`, 
    cost: Math.floor(1000 * Math.pow(1.15, i)) 
}));

const R_PRE = ["Basic", "Spicy", "Crispy", "Golden", "Mega", "Ultra", "Hyper", "Quantum", "Galactic", "Cosmic", "Mystic", "Atomic", "Neon", "Shadow", "Celestial", "Divine", "Infernal", "Supreme", "Ethereal", "Infinity"];
const R_BASE = ["Shoyu", "Miso", "Tonkotsu", "Udon", "Soba", "Truffle", "Wagyu", "Dragon", "Phoenix", "Nova", "Kelp", "Katsu", "Kimchi", "Kitsune", "Bison", "Kraken", "Leviathan", "Titan", "Emperor", "Godzilla"];
const RAMEN_NAMES = ["Basic Shoyu", "Miso Pork", "Spicy Tonkotsu", "Chicken Paitan", "Seafood Ramen", "Veggie Udon", "Truffle Ramen"];
const TRACK_RECIPES = Array.from({length: 1000}, (_, i) => {
    let name = i < RAMEN_NAMES.length ? RAMEN_NAMES[i] : `${R_PRE[i % R_PRE.length]} ${R_BASE[Math.floor(i / R_PRE.length) % R_BASE.length]} Ramen`;
    if (i === 999) name = "The Universal Ramen";
    
    let cost = Math.floor(500 * Math.pow(1.072, i)); 
    let value = Math.floor(65 * Math.pow(1.1345, i)); 
    
    return { name, cost, value };
});

const TRACK_DECOR = [ { id: 'theme-default', name: 'Standard Store', cost: 0 }, { id: 'theme-neon', name: 'Cyberpunk Neon', cost: 500000 }, { id: 'theme-zen', name: 'Zen Garden', cost: 10000000 }, { id: 'theme-gold', name: 'Solid Gold Palace', cost: 1000000000 } ];

const TRACK_STAFF = [
    { id: 'waiter', name: 'Waiter Chimp (Auto Serve/Pay)', baseCost: 50000, mult: 5 },
    { id: 'ninja', name: 'Ninja Macaque (Insta-Cook Chance)', baseCost: 250000, mult: 10 },
    { id: 'mascot', name: 'Capuchin Mascot (+Patience/Tips)', baseCost: 1000000, mult: 15 }
];

const INITIAL_RIVALS = [
    { id: 'sushi', name: '🍣 Sushi Pandas', hp: 50000, maxHp: 50000, cost: 5000, multReward: 0.5 },
    { id: 'burger', name: '🍔 Burger Bears', hp: 1000000, maxHp: 1000000, cost: 50000, multReward: 1.0 },
    { id: 'pizza', name: '🍕 Pizza Penguins', hp: 50000000, maxHp: 50000000, cost: 1000000, multReward: 2.0 },
    { id: 'taco', name: '🌮 Taco Tigers', hp: 1e10, maxHp: 1e10, cost: 5e8, multReward: 5.0 },
    { id: 'boss', name: '🦍 The Silverback Syndicate', hp: 1e15, maxHp: 1e15, cost: 1e12, multReward: 20.0 }
];

const defaultInv = { noodle: 10, broth: 10, spice: 10, egg: 10, boba: 10 };
let game = {
    wallet: 150, monkeyMoney: 0, turfMult: 1, lastSaveTime: Date.now(),
    tablesOwned: 1, idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxSpecial: 0, currentMenuPrice: 50,
    activeDecor: 'theme-default', decorOwned: ['theme-default'], autoRefill: false,
    staff: { waiter: 0, ninja: 0, mascot: 0 }, rivals: JSON.parse(JSON.stringify(INITIAL_RIVALS)),
    inv: { ...defaultInv }, upgrades: {}, achievements: [], autoChefSpeedMulti: 1, idxAds: 0,
    servedCount: 0, totalEarned: 0, vipServed: 0, combo: 0, bestCombo: 0,
    rivalsDefeated: 0, eventsTriggered: 0, missionCycle: 0, missions: [],
    missionStreak: 0, lastMissionReset: Date.now(),
    restaurantXp: 0, popularity: 50, dailySpecialIndex: 0,
    specialEndsAt: Date.now() + 86400000,
    nightMode: false, deliveryActive: null, deliveriesCompleted: 0,
    staffTraining: { waiter: 0, ninja: 0, mascot: 0 }, reviews: [],
    physical: {
        capacity: 1, speedLevel: 0, cookingLevel: 0, interactionLevel: 0,
        ingredientsReadyFor: null, activeOrder: null, carriedFood: []
    }
};

window.vipPartyActive = 0; 

const MISSION_DEFINITIONS = [
    { id: 'serve', icon: '🍜', title: 'Bowl Rush', description: 'Serve hungry customers', type: 'servedCount', baseTarget: 5, reward: 250 },
    { id: 'revenue', icon: '💰', title: 'Stack the Cash', description: 'Earn restaurant revenue', type: 'totalEarned', baseTarget: 500, reward: 400 },
    { id: 'vip', icon: '👑', title: 'VIP Treatment', description: 'Serve VIP or critic customers', type: 'vipServed', baseTarget: 1, reward: 750 },
    { id: 'combo', icon: '🔥', title: 'Perfect Service', description: 'Build a payment combo', type: 'bestCombo', baseTarget: 5, reward: 650 },
    { id: 'rivals', icon: '⚔️', title: 'Market Takeover', description: 'Defeat rival restaurants', type: 'rivalsDefeated', baseTarget: 1, reward: 1000 },
    { id: 'events', icon: '⚡', title: 'Chaos Coordinator', description: 'Trigger special events', type: 'eventsTriggered', baseTarget: 2, reward: 500 }
];

const ACHIEVEMENT_DEFINITIONS = [
    { id: 'first-bowl', icon: '🥢', title: 'First Bowl', description: 'Serve your first customer', check: () => game.servedCount >= 1 },
    { id: 'busy-kitchen', icon: '🍥', title: 'Busy Kitchen', description: 'Serve 25 customers', check: () => game.servedCount >= 25 },
    { id: 'combo-master', icon: '🔥', title: 'Combo Master', description: 'Reach a 10 bowl combo', check: () => game.bestCombo >= 10 },
    { id: 'vip-club', icon: '👑', title: 'VIP Club', description: 'Serve 5 VIPs or critics', check: () => game.vipServed >= 5 },
    { id: 'tycoon', icon: '💎', title: 'True Tycoon', description: 'Earn $100,000 lifetime revenue', check: () => game.totalEarned >= 100000 },
    { id: 'warlord', icon: '⚔️', title: 'Turf Warlord', description: 'Defeat your first rival', check: () => game.rivalsDefeated >= 1 }
];

const DAILY_SPECIALS = [
    { name: 'Golden Egg Ramen', icon: '🥚', description: 'Eggs taste legendary today', multiplier: 1.5 },
    { name: 'Neon Boba Blast', icon: '🧋', description: 'Boba fans pay premium prices', multiplier: 1.35 },
    { name: 'Chef’s Secret Miso', icon: '🥣', description: 'A cozy bowl for serious foodies', multiplier: 1.25 },
    { name: 'Dragon Spice Challenge', icon: '🌶️', description: 'Brave guests leave giant tips', multiplier: 1.75 },
    { name: 'Midnight Tonkotsu', icon: '🌙', description: 'Late-night broth is twice as rich', multiplier: 1.6 }
];

function createMissionSet() {
    const cycle = game.missionCycle || 0;
    const start = cycle % MISSION_DEFINITIONS.length;
    return [0, 1, 2].map((offset) => {
        const definition = MISSION_DEFINITIONS[(start + offset) % MISSION_DEFINITIONS.length];
        const scale = 1 + Math.floor(cycle / 3) * 0.25;
        return {
            id: `${definition.id}-${cycle}`,
            title: definition.title,
            icon: definition.icon,
            description: definition.description,
            type: definition.type,
            target: Math.ceil(definition.baseTarget * scale),
            reward: Math.ceil(definition.reward * scale),
            claimed: false
        };
    });
}

const charColors = { skin: ["#ffdbac", "#f1c27d", "#e0ac69", "#8d5524", "#4a3219"], hair: ["#090806", "#4a2511", "#b7a69e", "#d6c4c2", "#e25822"], shirt: ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"], pants: ["#2980b9", "#2c3e50", "#7f8c8d"] };

function generateRandomChar() { 
    let isVipRoll = Math.random() < 0.01;
    if (window.vipPartyActive > 0) {
        isVipRoll = true;
        window.vipPartyActive--;
    }
    
    return { 
        skin: charColors.skin[Math.floor(Math.random()*5)], 
        hair: charColors.hair[Math.floor(Math.random()*5)], 
        shirt: charColors.shirt[Math.floor(Math.random()*5)], 
        pants: charColors.pants[Math.floor(Math.random()*3)], 
        isVIP: isVipRoll, 
        isCritic: Math.random() < 0.02, 
        wantsBoba: Math.random() < 0.2 
    }; 
}

function renderCharHTML(c) { 
    let crown = c.isVIP ? `<div class="vip-crown">👑</div>` : ''; 
    let critic = c.isCritic ? `<div style="position:absolute; top:-20px; right:-10px; font-size:1.2rem; z-index:10;">🧐</div>` : ''; 
    let boba = c.wantsBoba ? `<div style="position:absolute; top:-5px; right:-20px; font-size:1.2rem; z-index:15;">🧋</div>` : '';
    let vipClass = c.isVIP ? ' vip-char' : '';
    return `<div class="rpg-char${vipClass}" style="--skin:${c.skin}; --hair:${c.hair}; --shirt:${c.isVIP?'#f1c40f':c.shirt}; --pants:${c.pants};">${crown}${critic}${boba}<div class="rpg-head"><div class="rpg-hair"></div><div class="rpg-eyes"><div class="rpg-eye"></div><div class="rpg-eye"></div></div></div><div class="rpg-body"></div><div class="rpg-legs"><div class="rpg-leg"></div><div class="rpg-leg"></div></div></div>`; 
}

function normalizeGameState() {
    const numericDefaults = {
        wallet: 150, monkeyMoney: 0, turfMult: 1, tablesOwned: 1,
        idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxAds: 0,
        currentMenuPrice: 50, autoChefSpeedMulti: 1, restaurantXp: 0,
        popularity: 50, dailySpecialIndex: 0, specialEndsAt: Date.now() + 86400000,
        deliveriesCompleted: 0
    };
    Object.entries(numericDefaults).forEach(([key, fallback]) => {
        if (!Number.isFinite(game[key])) game[key] = fallback;
    });
    game.activeDecor = typeof game.activeDecor === 'string' ? game.activeDecor : 'theme-default';
    game.autoRefill = Boolean(game.autoRefill);
    game.nightMode = Boolean(game.nightMode);
    game.popularity = Math.max(0, Math.min(100, game.popularity));
    game.staffTraining = { waiter: 0, ninja: 0, mascot: 0, ...(game.staffTraining || {}) };
    game.reviews = Array.isArray(game.reviews) ? game.reviews.slice(0, 6) : [];
    game.physical = {
        capacity: 1, speedLevel: 0, cookingLevel: 0, interactionLevel: 0,
        ingredientsReadyFor: null, activeOrder: null, carriedFood: [],
        ...(game.physical || {})
    };
    game.physical.capacity = Math.max(1, Math.min(4, Number(game.physical.capacity) || 1));
    game.physical.speedLevel = Math.max(0, Number(game.physical.speedLevel) || 0);
    game.physical.cookingLevel = Math.max(0, Number(game.physical.cookingLevel) || 0);
    game.physical.interactionLevel = Math.max(0, Number(game.physical.interactionLevel) || 0);
    game.physical.carriedFood = Array.isArray(game.physical.carriedFood) ? game.physical.carriedFood : [];
    // Seats and active orders are runtime-only; never restore a half-finished shift.
    game.physical.activeOrder = null;
    game.physical.ingredientsReadyFor = null;
    game.physical.carriedFood = [];
    if (!game.deliveryActive || !Number.isFinite(game.deliveryActive.endsAt) || game.deliveryActive.endsAt <= Date.now()) {
        game.deliveryActive = null;
    }
    game.inv = { ...defaultInv, ...(game.inv || {}) };
    game.staff = { waiter: 0, ninja: 0, mascot: 0, ...(game.staff || {}) };
    game.rivals = Array.isArray(game.rivals) && game.rivals.length ? game.rivals : JSON.parse(JSON.stringify(INITIAL_RIVALS));
    game.decorOwned = Array.isArray(game.decorOwned) && game.decorOwned.length ? game.decorOwned : ['theme-default'];
    game.achievements = Array.isArray(game.achievements) ? game.achievements : [];
    game.missionCycle = Number.isFinite(game.missionCycle) ? game.missionCycle : 0;
    game.missionStreak = Number.isFinite(game.missionStreak) ? game.missionStreak : 0;
    game.lastMissionReset = Number.isFinite(game.lastMissionReset) ? game.lastMissionReset : Date.now();
    ['servedCount', 'totalEarned', 'vipServed', 'combo', 'bestCombo', 'rivalsDefeated', 'eventsTriggered'].forEach((key) => {
        game[key] = Number.isFinite(game[key]) ? game[key] : 0;
    });
    if (!Array.isArray(game.missions) || game.missions.length !== 3) game.missions = createMissionSet();
}

function getRestaurantLevel() {
    return 1 + Math.floor(Math.sqrt(Math.max(0, game.restaurantXp) / 25));
}

function gainRestaurantXp(amount) {
    const oldLevel = getRestaurantLevel();
    game.restaurantXp += Math.max(0, amount);
    const newLevel = getRestaurantLevel();
    if (newLevel > oldLevel) {
        game.wallet += newLevel * 100;
        showAchievementToast({ icon: '🏆', title: `Restaurant Level ${newLevel}!` });
    }
}

function rotateDailySpecialIfNeeded() {
    if (Date.now() < game.specialEndsAt) return;
    game.dailySpecialIndex = (game.dailySpecialIndex + 1) % DAILY_SPECIALS.length;
    game.specialEndsAt = Date.now() + 86400000;
    saveGame();
}

function getDailySpecial() {
    rotateDailySpecialIfNeeded();
    return DAILY_SPECIALS[game.dailySpecialIndex] || DAILY_SPECIALS[0];
}

function getPopularityMultiplier() {
    return 0.75 + (game.popularity / 200);
}

function addReview(text, positive = true) {
    game.reviews.unshift({ text, positive, time: Date.now() });
    game.reviews = game.reviews.slice(0, 6);
}

function renderReviewFeed() {
    const container = document.getElementById('review-feed');
    if (!container) return;
    if (!game.reviews.length) {
        container.innerHTML = '<div class="empty-reviews">Your first guests are still deciding what to write...</div>';
        return;
    }
    container.innerHTML = game.reviews.map(review => `<div class="review-card ${review.positive ? 'positive' : 'negative'}"><span>${review.positive ? '⭐' : '💬'}</span><p>${review.text}</p></div>`).join('');
}

function renderDeliveryPanel() {
    const status = document.getElementById('delivery-status');
    const button = document.getElementById('btn-delivery');
    if (!status || !button) return;
    if (game.deliveryActive) {
        const remaining = Math.max(0, Math.ceil((game.deliveryActive.endsAt - Date.now()) / 1000));
        status.innerText = `In transit · ${remaining}s`;
        button.innerText = 'Cooking...';
        button.disabled = true;
    } else {
        status.innerText = `${game.deliveriesCompleted} delivered`;
        button.innerText = 'Dispatch Order';
        button.disabled = false;
    }
}

function renderRestaurantControls() {
    const special = getDailySpecial();
    const specialLabel = document.getElementById('daily-special');
    const countdown = document.getElementById('special-countdown');
    const nightButton = document.getElementById('btn-night');
    if (specialLabel) specialLabel.innerText = `${special.icon} ${special.name} · ${special.multiplier}x`;
    if (countdown) countdown.innerText = `${special.description} · ${Math.max(1, Math.ceil((game.specialEndsAt - Date.now()) / 3600000))}h left`;
    if (nightButton) nightButton.innerText = game.nightMode ? '☀️ Day Shift' : '🌙 Night Shift';
    renderDeliveryPanel();
}

function resetMissionsIfNeeded() {
    if (Date.now() - game.lastMissionReset < 86400000) return;
    game.missionCycle++;
    game.missionStreak = 0;
    game.lastMissionReset = Date.now();
    game.missions = createMissionSet();
    saveGame();
}

function getMissionProgress(mission) {
    return Math.min(mission.target, Number(game[mission.type] || 0));
}

function showAchievementToast(achievement) {
    const toast = document.getElementById('achieve-toast');
    const name = document.getElementById('achieve-name');
    if (!toast || !name) return;
    name.innerText = `${achievement.icon} ${achievement.title}`;
    toast.classList.remove('hidden-toast');
    clearTimeout(window.achievementToastTimeout);
    window.achievementToastTimeout = setTimeout(() => toast.classList.add('hidden-toast'), 4500);
}

function checkAchievements() {
    ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
        if (!game.achievements.includes(achievement.id) && achievement.check()) {
            game.achievements.push(achievement.id);
            game.monkeyMoney += 1;
            showAchievementToast(achievement);
            spawnFloatingMoney('+1 Monkey Money', 'money', '#f1c40f');
        }
    });
}

function claimMission(index) {
    const mission = game.missions[index];
    if (!mission || mission.claimed || getMissionProgress(mission) < mission.target) return;
    mission.claimed = true;
    game.wallet += mission.reward;
    game.missionStreak++;
    playSound('cash');
    showAchievementToast({ icon: '🎯', title: `${mission.title} Complete` });
    updateUI();
    saveGame();
}

function renderAchievementsPanel() {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    container.innerHTML = ACHIEVEMENT_DEFINITIONS.map((achievement) => {
        const unlocked = game.achievements.includes(achievement.id);
        return `<div class="achievement-card ${unlocked ? 'unlocked' : ''}">
            <span class="achievement-icon">${unlocked ? achievement.icon : '🔒'}</span>
            <div><b>${achievement.title}</b><small>${achievement.description}</small></div>
        </div>`;
    }).join('');
}

function renderMissionsPanel() {
    resetMissionsIfNeeded();
    const container = document.getElementById('mission-container');
    if (!container) return;
    const streak = document.getElementById('mission-streak');
    const served = document.getElementById('mission-served');
    const revenue = document.getElementById('mission-revenue');
    const bestCombo = document.getElementById('mission-best-combo');
    if (streak) streak.innerText = game.missionStreak;
    if (served) served.innerText = formatMoney(game.servedCount);
    if (revenue) revenue.innerText = `$${formatMoney(game.totalEarned)}`;
    if (bestCombo) bestCombo.innerText = game.bestCombo;
    container.innerHTML = game.missions.map((mission, index) => {
        const progress = getMissionProgress(mission);
        const percent = Math.min(100, (progress / mission.target) * 100);
        const complete = progress >= mission.target;
        const buttonText = mission.claimed ? 'CLAIMED' : (complete ? 'CLAIM REWARD' : 'IN PROGRESS');
        return `<div class="mission-card ${mission.claimed ? 'claimed' : ''}">
            <div class="mission-card-top"><span class="mission-icon">${mission.icon}</span><div><b>${mission.title}</b><small>${mission.description}</small></div></div>
            <div class="mission-progress"><div style="width:${percent}%"></div></div>
            <div class="mission-card-bottom"><span>${formatMoney(progress)} / ${formatMoney(mission.target)}</span><button class="mission-claim ${complete && !mission.claimed ? 'ready' : ''}" onclick="claimMission(${index})" ${complete && !mission.claimed ? '' : 'disabled'}>${buttonText}</button></div>
            <div class="mission-reward">Reward: <strong>$${formatMoney(mission.reward)}</strong></div>
        </div>`;
    }).join('');
    renderAchievementsPanel();
    renderReviewFeed();
}

let seats = Array.from({length: 1000}, () => ({ occupied: false, needsMenu: false, isCooking: false, cookStep: 0, needsServing: false, needsToPay: false, patience: 100, charData: null }));
let waitList = []; let isRushHour = false; let rushMultiplier = 1;

const FPS_MAP = [
    '################',
    '#..............#',
    '#..#.....#.....#',
    '#..............#',
    '#.....##..####.#',
    '#..............#',
    '#..#........#..#',
    '#..............#',
    '#..............#',
    '################'
];
const FPS_TABLE_POSITIONS = [
    { x: 4.5, y: 3.5, design: 'round' }, { x: 8.5, y: 3.5, design: 'square' }, { x: 11.5, y: 3.5, design: 'booth' },
    { x: 4.5, y: 6.5, design: 'barrel' }, { x: 8.5, y: 6.5, design: 'low' }, { x: 11.5, y: 6.5, design: 'square' }
];
const FPS_TABLE_GROUPS = [[0, 1], [3, 4]];
const FPS_DECOR = [
    { x: 1.1, y: 1.7, kind: 'window' },
    { x: 5.2, y: 1.05, kind: 'sign' },
    { x: 9.7, y: 1.05, kind: 'shelf' },
    { x: 14.5, y: 1.6, kind: 'plant' },
    { x: 1.1, y: 5.2, kind: 'lantern' },
    { x: 14.5, y: 5.2, kind: 'lantern' },
    { x: 3.1, y: 4.8, kind: 'floorplant', surface: 'floor' },
    { x: 7.1, y: 5.2, kind: 'rug', surface: 'floor' },
    { x: 13.2, y: 7.1, kind: 'divider', surface: 'floor' }
];
const FPS_WORLD_OBJECTS = [
    { x: 2.3, y: 1.45, kind: 'menu-board', label: 'MENU' },
    { x: 13.2, y: 1.55, kind: 'fridge', label: 'INGREDIENTS' },
    { x: 13.2, y: 3.25, kind: 'stove', label: 'RAMEN STATION' },
    { x: 13.1, y: 4.65, kind: 'pickup', label: 'PASS' },
    { x: 2.2, y: 4.45, kind: 'takeout', label: 'TAKEOUT' },
    { x: 7.5, y: 8.78, kind: 'door', label: 'ENTRANCE' }
];
const FPS_FOV = Math.PI / 3;
const FPS_RENDER_DISTANCE = 9.5;
let fpsOpen = false;
let fpsAnimationFrame = null;
let fpsLastFrame = 0;
let fpsKeys = {};
let fpsPlayer = { x: 2.5, y: 7.6, angle: -Math.PI / 2, pitch: 0 };
let fpsCanvas = null;
let fpsContext = null;
let fpsCookingTimer = null;
let takeoutQueue = [];
let takeoutSequence = 0;

function normalizeFpsAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}

function isFpsWall(x, y) {
    if (Math.floor(y) === 9 && x > 6.5 && x < 8.5) return false;
    const row = FPS_MAP[Math.floor(y)];
    return !row || row[Math.floor(x)] === '#';
}

function hasFpsLineOfSight(point) {
    const distance = Math.hypot(point.x - fpsPlayer.x, point.y - fpsPlayer.y);
    if (distance > FPS_RENDER_DISTANCE) return false;
    const steps = Math.max(2, Math.ceil(distance / 0.12));
    for (let step = 1; step < steps; step++) {
        const progress = step / steps;
        if (isFpsWall(
            fpsPlayer.x + (point.x - fpsPlayer.x) * progress,
            fpsPlayer.y + (point.y - fpsPlayer.y) * progress
        )) return false;
    }
    return true;
}

function resizeFpsCanvas() {
    if (!fpsCanvas) return;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    fpsCanvas.width = Math.floor(window.innerWidth * scale);
    fpsCanvas.height = Math.floor(window.innerHeight * scale);
    fpsCanvas.style.width = `${window.innerWidth}px`;
    fpsCanvas.style.height = `${window.innerHeight}px`;
    if (fpsContext) fpsContext.setTransform(scale, 0, 0, scale, 0, 0);
}

function getFpsTargetTable() {
    let closest = null;
    FPS_TABLE_POSITIONS.forEach((position, index) => {
        if (index >= game.tablesOwned) return;
        const dx = position.x - fpsPlayer.x;
        const dy = position.y - fpsPlayer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const relative = normalizeFpsAngle(Math.atan2(dy, dx) - fpsPlayer.angle);
        if (distance < 2.1 && Math.abs(relative) < 0.8 && hasFpsLineOfSight(position) && (!closest || distance < closest.distance)) {
            closest = { index, distance };
        }
    });
    return closest;
}

function getFpsTargetObject() {
    let closest = null;
    FPS_WORLD_OBJECTS.forEach(object => {
        const dx = object.x - fpsPlayer.x;
        const dy = object.y - fpsPlayer.y;
        const distance = Math.hypot(dx, dy);
        const relative = normalizeFpsAngle(Math.atan2(dy, dx) - fpsPlayer.angle);
        const reach = 2.15 + (game.physical?.interactionLevel || 0) * 0.18;
        if (distance < reach && Math.abs(relative) < 0.82 && hasFpsLineOfSight(object) && (!closest || distance < closest.distance)) {
            closest = { ...object, distance };
        }
    });
    return closest;
}

function getFpsCarryingCount() {
    return (game.physical.carriedFood || []).length + (game.physical.ingredientsReadyFor !== null ? 1 : 0);
}

function getFpsActiveOrderLabel() {
    if (game.physical.activeOrder === null || game.physical.activeOrder === undefined) return 'No active order';
    return typeof game.physical.activeOrder === 'number'
        ? `Table ${game.physical.activeOrder + 1} order`
        : 'Takeout order';
}

function isFpsObjectBlocked(x, y) {
    const tableBlocked = FPS_TABLE_POSITIONS.some((table, index) => {
        return index < game.tablesOwned && Math.hypot(table.x - x, table.y - y) < 0.62;
    });
    if (tableBlocked) return true;
    return FPS_WORLD_OBJECTS.some(object => {
        if (object.kind === 'door') return false;
        const solid = ['fridge', 'stove', 'pickup', 'takeout'].includes(object.kind);
        return solid && Math.hypot(object.x - x, object.y - y) < 0.58;
    });
}

function getFpsTableStatus(index) {
    const seat = seats[index];
    if (!seat || !seat.occupied) return 'Empty table';
    if (!seat.charData) return 'Customer arriving';
    const group = getFpsOrderGroup(index);
    if (group.length > 1 && seat.needsMenu) return `${group.length} guests are ready to order`;
    if (seat.needsMenu) return 'Customer is ready to order';
    if (game.physical.activeOrder === index) return `Order in progress · ${getFpsActiveOrderLabel()}`;
    if (seat.needsServing) return 'Ramen is ready to serve';
    if (seat.needsToPay) return 'Payment is waiting';
    return 'Table in service';
}

function getFpsTableAction(index) {
    const seat = seats[index];
    if (!seat || !seat.occupied || !seat.charData) return 'Wait for a customer';
    const group = getFpsOrderGroup(index);
    if (group.length > 1) return `Take ${group.length} orders together`;
    if (seat.needsMenu) return 'Take order';
    if (game.physical.activeOrder === index) return 'Continue order in kitchen';
    if (seat.needsServing) return 'Serve ramen';
    if (seat.needsToPay) return 'Collect payment';
    return 'Check table';
}

function getFpsOrderGroup(index) {
    for (const group of FPS_TABLE_GROUPS) {
        if (!group.includes(index)) continue;
        const ready = group.filter(groupIndex => {
            const seat = seats[groupIndex];
            return seat && seat.occupied && seat.charData && seat.needsMenu;
        });
        const seated = group.filter(groupIndex => seats[groupIndex]?.occupied && seats[groupIndex]?.charData);
        if (seated.length > 1 && ready.length > 1) return ready;
    }
    return seats[index]?.needsMenu ? [index] : [];
}

function interactWithFpsTable() {
    const target = getFpsTargetTable();
    if (!target) return;
    const seat = seats[target.index];
    if (!seat || !seat.occupied || !seat.charData) return;
    if (seat.needsMenu) {
        if (game.physical.activeOrder !== null) {
            playSound('error');
            return;
        }
        seat.needsMenu = false;
        seat.patience = 100;
        game.physical.activeOrder = target.index;
        game.physical.ingredientsReadyFor = null;
        playSound('serve');
        updateFpsHud();
        updateUI();
        saveGame();
        return;
    }
    const group = getFpsOrderGroup(target.index);
    if (group.length > 1 && seat.needsMenu) group.forEach(groupIndex => interactWithFpsTableAtIndex(groupIndex));
    else interactWithFpsTableAtIndex(target.index);
}

function interactWithFpsTableAtIndex(index) {
    const seat = seats[index];
    if (!seat || !seat.occupied || !seat.charData) return;
    if (seat.needsServing) {
        const carryingIndex = (game.physical.carriedFood || []).indexOf(index);
        if (carryingIndex === -1) {
            playSound('error');
            return;
        }
        if (seat.charData.wantsBoba) {
            if (game.inv.boba < 1) {
                document.getElementById('out-of-stock-msg')?.classList.remove('hidden');
                playSound('error');
                return;
            }
            game.inv.boba--;
        }
        game.physical.carriedFood.splice(carryingIndex, 1);
        seat.needsServing = false;
        seat.needsToPay = true;
        seat.patience = 100;
        playSound('serve');
        updateUI();
        updateFpsHud();
        saveGame();
    } else if (seat.needsToPay) {
        collectPayment(index);
        updateFpsHud();
    }
}

function interactWithFpsStation(kind) {
    const physical = game.physical;
    if (kind === 'terminal') {
        renderFpsUpgradePanel();
        return;
    }
    if (kind === 'fridge') {
        if (physical.activeOrder === null || physical.ingredientsReadyFor !== null) {
            playSound('error');
            return;
        }
        if (getFpsCarryingCount() >= physical.capacity) {
            playSound('error');
            return;
        }
        const needs = { noodle: 1, broth: 1, spice: 1, egg: 1 };
        if (Object.keys(needs).some(key => game.inv[key] < needs[key])) {
            document.getElementById('out-of-stock-msg')?.classList.remove('hidden');
            playSound('error');
            return;
        }
        Object.entries(needs).forEach(([key, amount]) => game.inv[key] -= amount);
        physical.ingredientsReadyFor = physical.activeOrder;
        playSound('cook');
        updateUI();
        updateFpsHud();
        saveGame();
        return;
    }
    if (kind === 'stove') {
        if (physical.ingredientsReadyFor === null || fpsCookingTimer) {
            playSound('error');
            return;
        }
        const order = physical.ingredientsReadyFor;
        const duration = Math.max(800, 2600 - physical.cookingLevel * 350 - game.idxAuto * 80);
        physical.ingredientsReadyFor = null;
        fpsCookingTimer = setTimeout(() => finishFpsCooking(order), duration);
        playSound('cook');
        updateFpsHud();
        return;
    }
    if (kind === 'takeout' || kind === 'pickup') {
        if (kind === 'takeout') {
            const waiting = takeoutQueue.find(customer => customer.phase === 'waiting' || customer.phase === 'ready');
            if (waiting && waiting.phase === 'waiting' && physical.activeOrder === null) {
                physical.activeOrder = `takeout:${waiting.id}`;
                waiting.phase = 'ordered';
                playSound('serve');
                updateFpsHud();
                return;
            }
            if (waiting && waiting.phase === 'ready' && physical.carriedFood.includes(`takeout:${waiting.id}`)) {
                physical.carriedFood = physical.carriedFood.filter(id => id !== `takeout:${waiting.id}`);
                completeTakeoutOrder(waiting);
                updateFpsHud();
                return;
            }
        }
        if (kind === 'pickup' && physical.carriedFood.length) {
            playSound('serve');
            return;
        }
        if (physical.activeOrder !== null) {
            playSound('error');
        }
    }
}

function finishFpsCooking(order) {
    fpsCookingTimer = null;
    if (typeof order === 'number') {
        const seat = seats[order];
        if (seat && seat.occupied) seat.needsServing = true;
    } else {
        const customer = takeoutQueue.find(item => `takeout:${item.id}` === order);
        if (customer) customer.phase = 'ready';
    }
    game.physical.carriedFood = [...(game.physical.carriedFood || []), order];
    game.physical.activeOrder = null;
    playSound('serve');
    updateUI();
    updateFpsHud();
    saveGame();
}

function completeTakeoutOrder(customer) {
    if (!customer) return;
    const mult = customer.char.isVIP ? 2.5 : 1;
    const reward = Math.ceil(game.currentMenuPrice * mult * getPrestigeMultiplier() * getDailySpecial().multiplier);
    game.wallet += reward;
    game.totalEarned += reward;
    game.servedCount++;
    game.popularity = Math.min(100, game.popularity + 0.25);
    gainRestaurantXp(Math.max(1, Math.ceil(reward / 100)));
    addReview('A takeout guest left with a perfectly packed bowl.');
    spawnFloatingMoney(reward, 'money');
    playSound('cash');
    takeoutQueue = takeoutQueue.filter(item => item.id !== customer.id);
    checkAchievements();
    updateUI();
    saveGame();
}

function updateFpsHud() {
    const economy = document.getElementById('fps-economy');
    if (!economy) return;
    const physical = game.physical;
    economy.innerText = `Cash $${formatMoney(game.wallet)} · Orders ${physical.activeOrder === null ? 0 : 1}/${physical.capacity} · Carrying ${getFpsCarryingCount()}/${physical.capacity}`;
}

function getFpsUpgradeDefinitions() {
    const physical = game.physical;
    return [
        { type: 'capacity', title: 'Carry capacity', detail: `${physical.capacity}/4 bowls · carry more orders`, level: physical.capacity, max: 4, cost: 450 * Math.pow(2.2, physical.capacity - 1) },
        { type: 'speed', title: 'Walking speed', detail: `Level ${physical.speedLevel} · move faster between stations`, level: physical.speedLevel, max: 5, cost: 700 * Math.pow(2, physical.speedLevel) },
        { type: 'cooking', title: 'Cooking speed', detail: `Level ${physical.cookingLevel} · reduce station time`, level: physical.cookingLevel, max: 5, cost: 900 * Math.pow(2, physical.cookingLevel) },
        { type: 'interaction', title: 'Service training', detail: `Level ${physical.interactionLevel} · wider interaction range`, level: physical.interactionLevel, max: 5, cost: 600 * Math.pow(2, physical.interactionLevel) }
    ];
}

function renderFpsUpgradePanel() {
    const panel = document.getElementById('fps-upgrade-panel');
    const container = document.getElementById('fps-upgrade-options');
    if (!panel || !container) return;
    container.innerHTML = getFpsUpgradeDefinitions().map(upgrade => {
        const maxed = upgrade.level >= upgrade.max;
        const cost = Math.ceil(upgrade.cost);
        return `<div class="fps-upgrade-option">
            <div><strong>${upgrade.title}</strong><small>${upgrade.detail}</small></div>
            <button onclick="buyFpsUpgrade('${upgrade.type}')" ${maxed || game.wallet < cost ? 'disabled' : ''}>${maxed ? 'MAX' : `$${formatMoney(cost)}`}</button>
        </div>`;
    }).join('');
    panel.classList.remove('hidden');
}

function closeFpsUpgradePanel() {
    document.getElementById('fps-upgrade-panel')?.classList.add('hidden');
}

function buyFpsUpgrade(type) {
    const upgrade = getFpsUpgradeDefinitions().find(item => item.type === type);
    if (!upgrade || upgrade.level >= upgrade.max || game.wallet < upgrade.cost) {
        playSound('error');
        return;
    }
    game.wallet -= Math.ceil(upgrade.cost);
    if (type === 'capacity') game.physical.capacity++;
    if (type === 'speed') game.physical.speedLevel++;
    if (type === 'cooking') game.physical.cookingLevel++;
    if (type === 'interaction') game.physical.interactionLevel++;
    gainRestaurantXp(8);
    playSound('cash');
    renderFpsUpgradePanel();
    updateFpsHud();
    updateUI();
    saveGame();
}

function interactWithFpsScene() {
    const table = getFpsTargetTable();
    const object = getFpsTargetObject();
    if (table && (!object || table.distance <= object.distance + 0.15)) {
        interactWithFpsTable();
    } else if (object) {
        interactWithFpsStation(object.kind);
    }
}

function updateFpsMovement(delta) {
    const forward = (fpsKeys.w ? 1 : 0) - (fpsKeys.s ? 1 : 0);
    const strafe = (fpsKeys.d ? 1 : 0) - (fpsKeys.a ? 1 : 0);
    const swivel = (fpsKeys.arrowright ? 1 : 0) - (fpsKeys.arrowleft ? 1 : 0);
    const verticalLook = (fpsKeys.arrowup ? 1 : 0) - (fpsKeys.arrowdown ? 1 : 0);
    if (swivel) fpsPlayer.angle += swivel * delta * 1.8;
    if (verticalLook) fpsPlayer.pitch = Math.max(-0.62, Math.min(0.62, fpsPlayer.pitch + verticalLook * delta * 1.5));
    if (!forward && !strafe) return;
    const sprint = fpsKeys.shift ? 1.65 : 1;
    const speed = delta * (2.8 + game.physical.speedLevel * 0.3) * sprint;
    const length = Math.sqrt(forward * forward + strafe * strafe) || 1;
    const dx = ((Math.cos(fpsPlayer.angle) * forward) + (Math.cos(fpsPlayer.angle + Math.PI / 2) * strafe)) / length * speed;
    const dy = ((Math.sin(fpsPlayer.angle) * forward) + (Math.sin(fpsPlayer.angle + Math.PI / 2) * strafe)) / length * speed;
    const nextX = fpsPlayer.x + dx;
    const nextY = fpsPlayer.y + dy;
    if (!isFpsWall(nextX, fpsPlayer.y) && !isFpsObjectBlocked(nextX, fpsPlayer.y)) fpsPlayer.x = nextX;
    if (!isFpsWall(fpsPlayer.x, nextY) && !isFpsObjectBlocked(fpsPlayer.x, nextY)) fpsPlayer.y = nextY;
}

function drawFpsDecor(context, decor, canvasWidth, canvasHeight) {
    const dx = decor.x - fpsPlayer.x;
    const dy = decor.y - fpsPlayer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const relative = normalizeFpsAngle(Math.atan2(dy, dx) - fpsPlayer.angle);
    if (distance > FPS_RENDER_DISTANCE || Math.abs(relative) > FPS_FOV / 2 + 0.2 || !hasFpsLineOfSight(decor)) return;
    const screenX = canvasWidth / 2 + (relative / FPS_FOV) * canvasWidth;
    const size = Math.min(canvasHeight * 0.32, 130 / Math.max(0.5, distance));
    const horizon = canvasHeight / 2 + fpsPlayer.pitch * canvasHeight * 0.8;
    const centerY = horizon - canvasHeight * 0.16;
    context.save();
     context.globalAlpha = Math.max(0.78, 1 - distance / 28);
    if (decor.surface === 'floor') {
        const floorY = horizon + canvasHeight * 0.27 + Math.min(55, distance * 3);
        if (decor.kind === 'rug') {
            context.fillStyle = '#8e44ad';
            context.shadowColor = 'rgba(0,0,0,0.4)';
            context.shadowBlur = size * 0.12;
            context.beginPath();
            context.ellipse(screenX, floorY, size * 0.9, size * 0.22, 0, 0, Math.PI * 2);
            context.fill();
            context.shadowBlur = 0;
            context.strokeStyle = '#ffeaa7';
            context.lineWidth = Math.max(2, size * 0.035);
            context.stroke();
        } else if (decor.kind === 'floorplant') {
            context.fillStyle = '#8e552e';
            context.fillRect(screenX - size * 0.22, floorY - size * 0.18, size * 0.44, size * 0.32);
            context.fillStyle = '#00b894';
            [[-0.3, -0.15], [0.3, -0.12], [-0.05, -0.48], [0.18, -0.55]].forEach(([x, y]) => {
                context.beginPath();
                context.ellipse(screenX + size * x, floorY + size * y, size * 0.16, size * 0.36, x, 0, Math.PI * 2);
                context.fill();
            });
        } else {
            context.fillStyle = '#6d3d25';
            context.fillRect(screenX - size * 0.65, floorY - size * 0.95, size * 1.3, size * 0.12);
            context.fillRect(screenX - size * 0.58, floorY - size * 0.83, size * 0.09, size * 0.83);
            context.fillRect(screenX + size * 0.49, floorY - size * 0.83, size * 0.09, size * 0.83);
            context.fillStyle = '#d35400';
            context.fillRect(screenX - size * 0.42, floorY - size * 0.73, size * 0.18, size * 0.28);
            context.fillRect(screenX + size * 0.24, floorY - size * 0.73, size * 0.18, size * 0.28);
        }
    } else if (decor.kind === 'window') {
        const sky = context.createLinearGradient(0, centerY - size / 2, 0, centerY + size / 2);
        sky.addColorStop(0, '#74b9ff');
        sky.addColorStop(1, '#192a56');
        context.fillStyle = '#202a36';
        context.fillRect(screenX - size * 0.7, centerY - size * 0.48, size * 1.4, size);
        context.fillStyle = sky;
        context.fillRect(screenX - size * 0.58, centerY - size * 0.36, size * 1.16, size * 0.72);
        context.fillStyle = '#ffeaa7';
        context.fillRect(screenX - size * 0.08, centerY - size * 0.36, size * 0.06, size * 0.72);
        context.fillRect(screenX - size * 0.58, centerY - size * 0.03, size * 1.16, size * 0.06);
    } else if (decor.kind === 'sign') {
        context.fillStyle = '#241b35';
        context.shadowColor = '#e056fd';
        context.shadowBlur = size * 0.18;
        context.fillRect(screenX - size * 0.8, centerY - size * 0.34, size * 1.6, size * 0.68);
        context.shadowBlur = 0;
        context.strokeStyle = '#ff9ff3';
        context.lineWidth = Math.max(2, size * 0.035);
        context.strokeRect(screenX - size * 0.72, centerY - size * 0.26, size * 1.44, size * 0.52);
        context.fillStyle = '#ffeaa7';
        context.font = `900 ${Math.max(8, size * 0.17)}px sans-serif`;
        context.textAlign = 'center';
        context.fillText('RAMEN MONKEY', screenX, centerY + size * 0.06);
    } else if (decor.kind === 'shelf') {
        context.fillStyle = '#3d261c';
        context.fillRect(screenX - size * 0.7, centerY - size * 0.26, size * 1.4, size * 0.52);
        context.fillStyle = '#a66a3f';
        context.fillRect(screenX - size * 0.78, centerY - size * 0.12, size * 1.56, size * 0.08);
        context.fillRect(screenX - size * 0.78, centerY + size * 0.22, size * 1.56, size * 0.08);
        context.font = `${Math.max(12, size * 0.25)}px serif`;
        context.textAlign = 'center';
        ['🍜', '🫙', '🥢'].forEach((icon, index) => context.fillText(icon, screenX - size * 0.48 + index * size * 0.48, centerY + size * 0.12));
    } else if (decor.kind === 'plant') {
        context.fillStyle = '#8e552e';
        context.fillRect(screenX - size * 0.2, centerY + size * 0.02, size * 0.4, size * 0.43);
        context.fillStyle = '#00b894';
        [[-0.3, 0], [0.3, 0], [-0.05, -0.3], [0.15, -0.45]].forEach(([x, y]) => {
            context.beginPath();
            context.ellipse(screenX + size * x, centerY + size * y, size * 0.17, size * 0.35, x, 0, Math.PI * 2);
            context.fill();
        });
    } else {
        context.fillStyle = '#d63031';
        context.shadowColor = '#ff7675';
        context.shadowBlur = size * 0.2;
        context.beginPath();
        context.ellipse(screenX, centerY, size * 0.28, size * 0.38, 0, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
        context.fillStyle = '#ffeaa7';
        context.fillRect(screenX - size * 0.04, centerY - size * 0.62, size * 0.08, size * 0.24);
        context.fillRect(screenX - size * 0.34, centerY + size * 0.4, size * 0.68, size * 0.05);
    }
    context.restore();
}

function getFpsProjection(point, canvasWidth, canvasHeight) {
    const dx = point.x - fpsPlayer.x;
    const dy = point.y - fpsPlayer.y;
    const distance = Math.max(0.35, Math.hypot(dx, dy));
    const relative = normalizeFpsAngle(Math.atan2(dy, dx) - fpsPlayer.angle);
    if (distance > FPS_RENDER_DISTANCE || Math.abs(relative) > FPS_FOV / 2 + 0.2 || !hasFpsLineOfSight(point)) return null;
    const horizon = canvasHeight / 2 + fpsPlayer.pitch * canvasHeight * 0.8;
    return {
        distance,
        relative,
        screenX: canvasWidth / 2 + (relative / FPS_FOV) * canvasWidth,
        horizon,
        floorY: horizon + canvasHeight * 0.23 + Math.min(45, distance * 3),
        size: Math.min(canvasHeight * 0.5, 180 / distance)
    };
}

function drawFpsWorldObject(context, object, canvasWidth, canvasHeight) {
    const projection = getFpsProjection(object, canvasWidth, canvasHeight);
    if (!projection) return;
    const { screenX, horizon, floorY, size, distance } = projection;
    const target = getFpsTargetObject();
    const isTarget = target && target.kind === object.kind;
    context.save();
    context.globalAlpha = Math.max(0.82, 1 - distance / 32);
    context.shadowColor = 'rgba(0,0,0,0.5)';
    context.shadowBlur = Math.max(2, size * 0.06);
    if (object.kind === 'fridge') {
        context.fillStyle = '#dfe6e9';
        context.fillRect(screenX - size * 0.42, floorY - size * 1.18, size * 0.84, size * 1.18);
        context.fillStyle = '#b2bec3';
        context.fillRect(screenX - size * 0.04, floorY - size * 1.05, size * 0.06, size * 0.92);
        context.fillStyle = '#00b894';
        context.fillRect(screenX - size * 0.3, floorY - size * 0.92, size * 0.18, size * 0.08);
    } else if (object.kind === 'stove') {
        context.fillStyle = '#636e72';
        context.fillRect(screenX - size * 0.62, floorY - size * 0.58, size * 1.24, size * 0.58);
        context.fillStyle = '#2d3436';
        [-0.32, 0.32].forEach(x => {
            context.beginPath();
            context.arc(screenX + size * x, floorY - size * 0.42, size * 0.14, 0, Math.PI * 2);
            context.fill();
        });
        context.fillStyle = '#e17055';
        context.fillRect(screenX - size * 0.08, floorY - size * 0.7, size * 0.16, size * 0.12);
    } else if (object.kind === 'pickup' || object.kind === 'takeout') {
        context.fillStyle = object.kind === 'takeout' ? '#6c5ce7' : '#00b894';
        context.fillRect(screenX - size * 0.65, floorY - size * 0.48, size * 1.3, size * 0.48);
        context.fillStyle = '#ffeaa7';
        context.fillRect(screenX - size * 0.55, floorY - size * 0.74, size * 1.1, size * 0.12);
        context.fillStyle = '#fff';
        context.font = `900 ${Math.max(9, size * 0.16)}px sans-serif`;
        context.textAlign = 'center';
        context.fillText(object.kind === 'takeout' ? 'TO-GO' : 'PASS', screenX, floorY - size * 0.52);
    } else if (object.kind === 'terminal') {
        context.fillStyle = '#2d3436';
        context.fillRect(screenX - size * 0.45, floorY - size * 0.92, size * 0.9, size * 0.92);
        context.fillStyle = '#74b9ff';
        context.fillRect(screenX - size * 0.32, floorY - size * 0.76, size * 0.64, size * 0.38);
        context.fillStyle = '#55efc4';
        context.fillRect(screenX - size * 0.28, floorY - size * 0.23, size * 0.56, size * 0.08);
    } else if (object.kind === 'door') {
        context.fillStyle = '#6d3d25';
        context.fillRect(screenX - size * 0.48, floorY - size * 1.7, size * 0.96, size * 1.7);
        context.fillStyle = '#74b9ff';
        context.fillRect(screenX - size * 0.35, floorY - size * 1.5, size * 0.7, size * 0.88);
        context.fillStyle = '#ffeaa7';
        context.beginPath();
        context.arc(screenX + size * 0.28, floorY - size * 0.85, size * 0.05, 0, Math.PI * 2);
        context.fill();
    } else {
        context.fillStyle = '#241b35';
        context.fillRect(screenX - size * 0.75, horizon - size * 0.45, size * 1.5, size * 0.65);
        context.fillStyle = '#ffeaa7';
        context.font = `900 ${Math.max(9, size * 0.16)}px sans-serif`;
        context.textAlign = 'center';
        context.fillText(object.label, screenX, horizon - size * 0.05);
    }
    context.shadowBlur = 0;
    if (isTarget) {
        context.strokeStyle = '#ffeaa7';
        context.lineWidth = 4;
        context.strokeRect(screenX - size * 0.75, floorY - size * 1.75, size * 1.5, size * 1.75);
    }
    context.restore();
}

function drawFpsTable(context, table, canvasWidth, canvasHeight) {
    const dx = table.x - fpsPlayer.x;
    const dy = table.y - fpsPlayer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const relative = normalizeFpsAngle(Math.atan2(dy, dx) - fpsPlayer.angle);
    if (distance > FPS_RENDER_DISTANCE || Math.abs(relative) > FPS_FOV / 2 + 0.15 || !hasFpsLineOfSight(table)) return;
    const screenX = canvasWidth / 2 + (relative / FPS_FOV) * canvasWidth;
    let tableHeight = Math.min(canvasHeight * 0.55, 175 / Math.max(0.4, distance));
    if (table.design === 'low') tableHeight *= 0.72;
    const tableWidth = tableHeight * (table.design === 'booth' ? 1.7 : table.design === 'barrel' ? 0.95 : 1.25);
    const horizon = canvasHeight / 2 + fpsPlayer.pitch * canvasHeight * 0.8;
    const floorY = horizon + canvasHeight * 0.23 + Math.min(40, distance * 3);
    const seat = seats[table.index];
    const isTarget = getFpsTargetTable()?.index === table.index;
    context.save();
    context.globalAlpha = Math.max(0.45, 1 - distance / 14);
    context.fillStyle = 'rgba(0,0,0,0.35)';
    context.beginPath();
    context.ellipse(screenX, floorY + tableHeight * 0.48, tableWidth * 0.68, tableHeight * 0.11, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#3d261c';
    context.fillRect(screenX - tableWidth / 2, floorY - tableHeight * 0.2, tableWidth, tableHeight * 0.8);
    const tabletop = context.createLinearGradient(screenX, floorY - tableHeight * 0.37, screenX, floorY - tableHeight * 0.17);
    tabletop.addColorStop(0, seat && seat.occupied ? (seat.needsServing ? '#55efc4' : seat.needsToPay ? '#ffeaa7' : '#e17055') : '#c08a5b');
    tabletop.addColorStop(1, '#6d3d25');
    context.fillStyle = tabletop;
    if (table.design === 'round' || table.design === 'barrel') {
        context.beginPath();
        context.ellipse(screenX, floorY - tableHeight * 0.26, tableWidth * 0.52, tableHeight * 0.14, 0, 0, Math.PI * 2);
        context.fill();
    } else {
        context.fillRect(screenX - tableWidth / 2, floorY - tableHeight * 0.35, tableWidth, tableHeight * 0.18);
    }
    if (table.design === 'booth') {
        context.fillStyle = '#7f4f35';
        context.fillRect(screenX - tableWidth * 0.53, floorY - tableHeight * 1.05, tableWidth * 1.06, tableHeight * 0.16);
        context.fillStyle = '#c08a5b';
        context.fillRect(screenX - tableWidth * 0.5, floorY - tableHeight * 0.91, tableWidth, tableHeight * 0.08);
    }
    context.fillStyle = '#21160f';
    context.fillRect(screenX - tableWidth * 0.38, floorY - tableHeight * 0.04, tableWidth * 0.12, tableHeight * 0.55);
    context.fillRect(screenX + tableWidth * 0.26, floorY - tableHeight * 0.04, tableWidth * 0.12, tableHeight * 0.55);
    context.fillStyle = '#8e6e53';
    context.fillRect(screenX - tableWidth * 0.51, floorY - tableHeight * 0.27, tableWidth * 0.04, tableHeight * 0.2);
    context.fillRect(screenX + tableWidth * 0.47, floorY - tableHeight * 0.27, tableWidth * 0.04, tableHeight * 0.2);
    if (seat && seat.occupied && seat.charData) {
        const body = context.createLinearGradient(screenX, floorY - tableHeight * 0.95, screenX, floorY - tableHeight * 0.55);
        body.addColorStop(0, seat.charData.isVIP ? '#ffeaa7' : seat.charData.shirt);
        body.addColorStop(1, seat.charData.isVIP ? '#d6a928' : '#2d3436');
        context.fillStyle = body;
        context.fillRect(screenX - tableWidth * 0.16, floorY - tableHeight * 0.78, tableWidth * 0.32, tableHeight * 0.42);
        context.fillStyle = seat.charData.skin;
        context.beginPath();
        context.ellipse(screenX - tableWidth * 0.22, floorY - tableHeight * 0.56, tableWidth * 0.09, tableHeight * 0.15, -0.25, 0, Math.PI * 2);
        context.ellipse(screenX + tableWidth * 0.22, floorY - tableHeight * 0.56, tableWidth * 0.09, tableHeight * 0.15, 0.25, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(screenX, floorY - tableHeight * 1.05, Math.max(5, tableHeight * 0.16), 0, Math.PI * 2);
        context.fill();
        context.fillStyle = seat.charData.hair || '#2d3436';
        context.beginPath();
        context.arc(screenX, floorY - tableHeight * 1.1, Math.max(5, tableHeight * 0.16), Math.PI, Math.PI * 2);
        context.fill();
        context.fillStyle = '#2d3436';
        context.beginPath();
        context.arc(screenX - tableWidth * 0.05, floorY - tableHeight * 1.06, 2, 0, Math.PI * 2);
        context.arc(screenX + tableWidth * 0.05, floorY - tableHeight * 1.06, 2, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#f5f6fa';
        context.beginPath();
        context.ellipse(screenX, floorY - tableHeight * 0.42, tableWidth * 0.18, tableHeight * 0.07, 0, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#e17055';
        context.beginPath();
        context.ellipse(screenX, floorY - tableHeight * 0.44, tableWidth * 0.12, tableHeight * 0.04, 0, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = 'rgba(255,255,255,0.75)';
        context.lineWidth = Math.max(1, tableHeight * 0.012);
        context.beginPath();
        context.moveTo(screenX - tableWidth * 0.08, floorY - tableHeight * 0.57);
        context.quadraticCurveTo(screenX - tableWidth * 0.15, floorY - tableHeight * 0.75, screenX - tableWidth * 0.08, floorY - tableHeight * 0.86);
        context.stroke();
    }
    if (isTarget) {
        context.strokeStyle = '#ffeaa7';
        context.lineWidth = 4;
        context.strokeRect(screenX - tableWidth / 2 - 6, floorY - tableHeight * 1.1, tableWidth + 12, tableHeight * 1.2);
    }
    context.restore();
}

function renderFpsScene(timestamp = 0) {
    if (!fpsOpen || !fpsContext) return;
    const delta = Math.min(0.05, (timestamp - fpsLastFrame) / 1000 || 0);
    fpsLastFrame = timestamp;
    updateFpsMovement(delta);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const context = fpsContext;
    const night = game.nightMode;
    const horizon = height / 2 + fpsPlayer.pitch * height * 0.8;
    context.fillStyle = night ? '#080d24' : '#80c7e8';
    context.fillRect(0, 0, width, horizon);
    context.fillStyle = night ? '#15131b' : '#5d4037';
    context.fillRect(0, horizon, width, height - horizon);
    context.fillStyle = night ? 'rgba(108,92,231,0.13)' : 'rgba(255,234,167,0.15)';
    context.fillRect(0, horizon, width, height - horizon);

    const rayStep = 2;
    for (let column = 0; column < width; column += rayStep) {
        const rayAngle = fpsPlayer.angle - FPS_FOV / 2 + (column / width) * FPS_FOV;
        let distance = 0;
        while (distance < 18) {
            distance += 0.025;
            if (isFpsWall(fpsPlayer.x + Math.cos(rayAngle) * distance, fpsPlayer.y + Math.sin(rayAngle) * distance)) break;
        }
        const corrected = Math.max(0.1, distance * Math.cos(rayAngle - fpsPlayer.angle));
        const wallHeight = Math.min(height, height / corrected * 0.82);
        const hitX = fpsPlayer.x + Math.cos(rayAngle) * distance;
        const hitY = fpsPlayer.y + Math.sin(rayAngle) * distance;
        const wallTile = FPS_MAP[Math.floor(hitY)]?.[Math.floor(hitX)] || '#';
        const shade = Math.max(35, Math.min(190, 185 - corrected * 10));
        const wallPalette = wallTile === '#' && Math.floor(hitY) === 0
            ? [shade * 0.72, shade * 0.58, shade * 0.42]
            : [shade, shade * 0.78, shade * 0.52];
        context.fillStyle = night
            ? `rgb(${wallPalette[0] * 0.32},${wallPalette[1] * 0.36},${Math.min(190, wallPalette[2] * 1.25)})`
            : `rgb(${wallPalette[0]},${wallPalette[1]},${wallPalette[2]})`;
        context.fillRect(column, horizon - wallHeight / 2, rayStep + 1, wallHeight);
        if (Math.floor(hitX * 2) % 2 === 0 && corrected < 9) {
            context.fillStyle = night ? 'rgba(255,255,255,0.035)' : 'rgba(255,245,220,0.08)';
            context.fillRect(column, horizon - wallHeight / 2, 1, wallHeight);
        }
    }

    FPS_DECOR.forEach(decor => drawFpsDecor(context, decor, width, height));
    FPS_WORLD_OBJECTS
        .map(object => ({ ...object, distance: Math.hypot(object.x - fpsPlayer.x, object.y - fpsPlayer.y) }))
        .sort((a, b) => b.distance - a.distance)
        .forEach(object => drawFpsWorldObject(context, object, width, height));
    FPS_TABLE_POSITIONS
        .map((position, index) => ({ ...position, index, distance: Math.hypot(position.x - fpsPlayer.x, position.y - fpsPlayer.y) }))
        .sort((a, b) => b.distance - a.distance)
        .forEach(table => drawFpsTable(context, table, width, height));

    const target = getFpsTargetTable();
    const objectTarget = getFpsTargetObject();
    const objective = document.querySelector('.fps-objective');
    const status = document.getElementById('fps-status');
    if (target && (!objectTarget || target.distance <= objectTarget.distance + 0.15)) {
        if (objective) objective.innerText = `E · ${getFpsTableAction(target.index)}`;
        if (status) status.innerText = getFpsTableStatus(target.index);
    } else if (objectTarget) {
        if (objective) objective.innerText = `E · ${objectTarget.label}`;
        if (status) status.innerText = `${objectTarget.label} · ${getFpsActiveOrderLabel()}`;
    } else {
        if (objective) objective.innerText = 'Walk close to a guest or station';
        if (status) status.innerText = `Service floor · ${fpsPlayer.x.toFixed(1)}, ${fpsPlayer.y.toFixed(1)}`;
    }
    updateFpsHud();
    fpsAnimationFrame = requestAnimationFrame(renderFpsScene);
}

function bindFirstPersonControls() {
    if (window.firstPersonControlsBound) return;
    window.firstPersonControlsBound = true;
    document.addEventListener('keydown', event => {
        if (!fpsOpen) return;
        const key = event.key.toLowerCase();
        if (key === 'escape') {
            closeFirstPerson();
            return;
        }
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(key)) {
            fpsKeys[key] = true;
            event.preventDefault();
        }
        if (key === 'u' && !event.repeat) {
            const panel = document.getElementById('fps-upgrade-panel');
            if (panel?.classList.contains('hidden')) renderFpsUpgradePanel();
            else closeFpsUpgradePanel();
            event.preventDefault();
        }
        if (key === 'e' && !event.repeat) {
            if (document.getElementById('fps-upgrade-panel')?.classList.contains('hidden') === false) return;
            interactWithFpsScene();
            event.preventDefault();
        }
    });
    document.addEventListener('keyup', event => {
        if (fpsOpen) fpsKeys[event.key.toLowerCase()] = false;
    });
    document.addEventListener('mousemove', event => {
        if (fpsOpen && document.pointerLockElement === fpsCanvas) {
            fpsPlayer.angle += event.movementX * 0.0025;
            // Pointer movement follows the usual FPS convention: moving up looks up.
            fpsPlayer.pitch = Math.max(-0.62, Math.min(0.62, fpsPlayer.pitch - event.movementY * 0.002));
        }
    });
    if (fpsCanvas && !window.fpsCanvasClickBound) {
        fpsCanvas.addEventListener('click', () => {
            if (fpsOpen && document.pointerLockElement !== fpsCanvas) fpsCanvas.requestPointerLock?.();
        });
        window.fpsCanvasClickBound = true;
    }
    window.addEventListener('resize', resizeFpsCanvas);
}

function toggleFirstPerson() {
    fpsCanvas = document.getElementById('fps-canvas');
    fpsContext = fpsCanvas ? fpsCanvas.getContext('2d') : null;
    const overlay = document.getElementById('fps-overlay');
    if (!overlay || !fpsCanvas || !fpsContext) return;
    bindFirstPersonControls();
    fpsOpen = !fpsOpen;
    overlay.classList.toggle('hidden', !fpsOpen);
    document.body.classList.toggle('first-person-open', fpsOpen);
    if (fpsOpen) {
        resizeFpsCanvas();
        fpsLastFrame = 0;
        fpsAnimationFrame = requestAnimationFrame(renderFpsScene);
        fpsCanvas.focus();
        fpsCanvas.requestPointerLock?.();
    } else if (fpsAnimationFrame) {
        cancelAnimationFrame(fpsAnimationFrame);
    }
}

function closeFirstPerson() {
    if (!fpsOpen) return;
    fpsOpen = false;
    document.getElementById('fps-overlay')?.classList.add('hidden');
    document.body.classList.remove('first-person-open');
    fpsKeys = {};
    if (document.pointerLockElement === fpsCanvas) document.exitPointerLock();
    if (fpsAnimationFrame) cancelAnimationFrame(fpsAnimationFrame);
}

function switchTab(tab) { document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active-view')); document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); document.getElementById(`view-${tab}`).classList.add('active-view'); document.getElementById(`btn-${tab}`).classList.add('active'); if(tab==='decor') renderDecorPanel(); if(tab==='staff') renderStaffPanel(); if(tab==='map') renderTurfPanel(); if(tab==='missions') renderMissionsPanel(); }

function initTables() { let d = document.getElementById('dining-area'); if(d && d.children.length === 0) { for(let i=0; i<1000; i++) { let div = document.createElement('div'); div.id = `seat-${i}`; div.className = 'seat locked'; d.appendChild(div); } } }

function getPrestigeMultiplier() { 
    return (1 + (game.monkeyMoney * 0.5)) * game.turfMult; 
}

function customerArrives() { 
    const char = generateRandomChar();
    if (Math.random() < 0.3 && takeoutQueue.length < 5) {
        takeoutQueue.push({ id: ++takeoutSequence, char, phase: 'approach', progress: 0 });
    } else if (waitList.length < 10) {
        waitList.push(char);
    } 
    renderWaitList();
    checkEmptySeats(); 
    
    let baseDelay = 4000 * Math.pow(0.92, game.idxAds || 0);
    let finalDelay = Math.max(300, baseDelay / rushMultiplier); 
    
    setTimeout(customerArrives, finalDelay); 
}

function renderWaitList() { 
    let el = document.getElementById('wait-list');
    if (el) el.innerHTML = waitList.map(char => `<div style="margin-bottom: 5px;">${renderCharHTML(char)}</div>`).join(''); 
    const takeout = document.getElementById('takeout-line');
    if (takeout) {
        takeout.innerHTML = takeoutQueue.map(customer => `<div class="takeout-guest"><span>🚶</span>${customer.phase === 'ready' ? '🍜 READY' : 'TAKEOUT'}</div>`).join('');
    }
}

function checkEmptySeats() {
    if (waitList.length === 0) return;
    for (let i = 0; i < game.tablesOwned; i++) {
        if (!seats[i].occupied) {
            const char = waitList.shift();
            renderWaitList();
            spawnWalkingCustomer(i, char);
            // Some guests arrive as a two-person party and take neighboring tables.
            if (Math.random() < 0.28 && i % 3 === 0 && i + 1 < game.tablesOwned && !seats[i + 1].occupied && waitList.length) {
                const companion = waitList.shift();
                renderWaitList();
                spawnWalkingCustomer(i + 1, companion);
            }
            break;
        }
    }
}

function spawnWalkingCustomer(seatIdx, char) {
    seats[seatIdx].occupied = true; seats[seatIdx].patience = 100; updateUI();
    setTimeout(() => { seats[seatIdx].charData = char; seats[seatIdx].needsMenu = true; updateUI(); }, 1000 / rushMultiplier);
}

function handleTableClick(index) {
    let seat = seats[index]; 
    if (!seat || !seat.occupied || seat.charData === null) return;

    // 1. TAKE ORDER & START COOKING AUTOMATICALLY
    if (seat.needsMenu) { 
        seat.needsMenu = false; 
        seat.patience = 100; 
        seat.isCooking = true; 
        seat.cookStep = 0; 
        updateUI(); 
        updateKitchenUI();
    } 
    // 2. SERVE THE RAMEN
    else if (seat.needsServing) { 
        if(seat.charData && seat.charData.wantsBoba) {
            if(game.inv.boba < 1) { 
                let msg = document.getElementById('out-of-stock-msg');
                if (msg) msg.classList.remove('hidden'); 
                playSound('error'); 
                return; 
            }
            game.inv.boba--;
        }
        seat.needsServing = false; 
        seat.needsToPay = true; 
        seat.patience = 100; 
        playSound('serve'); 
        updateUI(); 
    } 
    // 3. COLLECT THE COIN
    else if (seat.needsToPay) {
        collectPayment(index); 
    }
    // 4. COOK STAGE FAILSAFE (Forces stove initialization if client stalls)
    else if (!seat.isCooking) { 
        seat.isCooking = true; 
        seat.cookStep = 0; 
        seat.patience = 100; 
        updateUI(); 
        updateKitchenUI(); 
    }
}

function collectPayment(index) {
    let seat = seats[index]; if(!seat || !seat.charData) return;
    let mult = seat.charData.isVIP ? 10 : 1;
    if(seat.charData.isCritic) mult *= 25; 
    if(game.staff.mascot > 0) mult += (game.staff.mascot * 0.5) + ((game.staffTraining.mascot || 0) * 0.25);
    
    game.combo++;
    game.bestCombo = Math.max(game.bestCombo, game.combo);
    const comboMultiplier = 1 + Math.min(game.combo, 10) * 0.05;
    let finalValue = (game.currentMenuPrice * mult) * getPrestigeMultiplier() * rushMultiplier * comboMultiplier * getDailySpecial().multiplier * getPopularityMultiplier();
    
    if (game.idxRecipe >= 999) finalValue *= 1000000;
    
    game.wallet += finalValue;
    game.totalEarned += finalValue;
    game.servedCount++;
    if (seat.charData.isVIP || seat.charData.isCritic) game.vipServed++;
    game.popularity = Math.min(100, game.popularity + (seat.charData.isVIP ? 1.5 : 0.35));
    gainRestaurantXp(Math.max(1, Math.ceil(finalValue / 100)));
    addReview(seat.charData.isCritic ? 'The critic is scribbling notes. That is usually a good sign.' : (seat.charData.isVIP ? 'The VIP is already asking for a second bowl!' : 'Fast service, warm broth, happy guest.'));
    playSound('cash');
    spawnFloatingMoney(finalValue, `seat-${index}`);

    seat.occupied = false; 
    seat.charData = null;
    seat.needsMenu = false;
    seat.isCooking = false;
    seat.cookStep = 0;
    seat.needsServing = false;
    seat.needsToPay = false;
    seat.patience = 100;

    checkAchievements();
    saveGame(); 
    updateUI();
}

function buyIngredient(type, amount, cost) { 
    if (game.wallet >= cost) { 
        game.wallet -= cost; game.inv[type] += amount; 
        let msg = document.getElementById('out-of-stock-msg');
        if (msg) msg.classList.add('hidden'); 
        playSound('cook'); updateUI(); saveGame(); 
    } else { playSound('error'); }
}

function buyAutoRefill() {
    if (game.wallet >= 50000 && !game.autoRefill) {
        game.wallet -= 50000; game.autoRefill = true; playSound('cash'); saveGame(); updateUI();
    } else { playSound('error'); }
}

// --- BACKGROUND LOOPS ---
setInterval(() => {
    if (game.autoRefill) {
        let restockAmount = 100; let cost = 50; let threshold = 10; let didRefill = false;
        if (game.inv.noodle <= threshold && game.wallet >= cost) { game.inv.noodle += restockAmount; game.wallet -= cost; didRefill = true; }
        if (game.inv.broth <= threshold && game.wallet >= cost) { game.inv.broth += restockAmount; game.wallet -= cost; didRefill = true; }
        if (game.inv.spice <= threshold && game.wallet >= cost) { game.inv.spice += restockAmount; game.wallet -= cost; didRefill = true; }
        if (game.inv.egg <= threshold && game.wallet >= cost) { game.inv.egg += restockAmount; game.wallet -= cost; didRefill = true; }
        if (game.inv.boba <= threshold && game.wallet >= cost) { game.inv.boba += restockAmount; game.wallet -= cost; didRefill = true; }
        if (didRefill) { updateUI(); updateKitchenUI(); }
    }
}, 1000);

setInterval(() => {
    if (game.deliveryActive && Date.now() >= game.deliveryActive.endsAt) {
        completeDelivery();
    } else if (game.deliveryActive) {
        renderDeliveryPanel();
    }
    rotateDailySpecialIfNeeded();
    renderRestaurantControls();
    takeoutQueue.forEach(customer => {
        if (customer.phase === 'approach') {
            customer.progress = Math.min(1, customer.progress + 0.28);
            if (customer.progress >= 1) customer.phase = 'waiting';
        }
    });
    renderWaitList();
}, 1000);

// --- PATIENCE DRAIN SYSTEM ---
setInterval(() => {
    let uiNeedsUpdate = false;
    let drainRate = 5; 
    
    if (game.staff && game.staff.mascot > 0) {
        drainRate -= (game.staff.mascot * 0.4);
    }
    drainRate = Math.max(1, drainRate);

    for (let i = 0; i < game.tablesOwned; i++) {
        let seat = seats[i];
        if (seat && seat.occupied && seat.charData) {
            seat.patience -= drainRate;
            uiNeedsUpdate = true;

            if (seat.patience <= 0) {
                playSound('error');
                spawnFloatingMoney("😡 WALKOUT!", `seat-${i}`, '#e74c3c');
                
                seat.occupied = false; 
                seat.charData = null;
                seat.needsMenu = false;
                seat.isCooking = false;
                seat.cookStep = 0;
                seat.needsServing = false;
                seat.needsToPay = false;
                seat.patience = 100;
                game.combo = 0;
                game.popularity = Math.max(0, game.popularity - 2);
                addReview('The wait was too long. The guest left before trying the ramen.', false);
                updateKitchenUI();
            }
        }
    }
    if (uiNeedsUpdate) updateUI();
}, 1000);

let lastClickTime = 0;
let clickWarnings = 0;

function clickStove(index) {
    let now = Date.now();
    if (now - lastClickTime < 50) { 
        clickWarnings++;
        if (clickWarnings > 5) {
            alert("🚨 ANTI-CHEAT: Auto-clicker detected! The Health Inspector fined you $10,000!");
            game.wallet = Math.max(0, game.wallet - 10000); 
            clickWarnings = 0; updateUI(); playSound('error');
        }
        return; 
    }
    lastClickTime = now;
    clickWarnings = Math.max(0, clickWarnings - 0.2);

    let seat = seats[index]; if (!seat || !seat.isCooking) return;
    let msg = document.getElementById('out-of-stock-msg');
    
    if(seat.cookStep === 0 && game.staff.ninja > 0 && Math.random() < ((game.staff.ninja * 0.05) + ((game.staffTraining.ninja || 0) * 0.02))) {
        if(game.inv.noodle<1||game.inv.broth<1||game.inv.spice<1||game.inv.egg<1) { if(msg) msg.classList.remove('hidden'); playSound('error'); return; }
        game.inv.noodle--; game.inv.broth--; game.inv.spice--; game.inv.egg--;
        seat.cookStep = 3; playSound('cook'); finishCooking(index); return;
    }

    if (seat.cookStep === 0) { if (game.inv.noodle < 1 || game.inv.broth < 1) { if(msg) msg.classList.remove('hidden'); playSound('error'); return; } game.inv.noodle--; game.inv.broth--; playSound('cook'); seat.cookStep = 1; } 
    else if (seat.cookStep === 1) { if (game.inv.spice < 1) { if(msg) msg.classList.remove('hidden'); playSound('error'); return; } game.inv.spice--; playSound('cook'); seat.cookStep = 2; } 
    else if (seat.cookStep === 2) { 
        if (game.inv.egg < 1) { if(msg) msg.classList.remove('hidden'); playSound('error'); return; } 
        game.inv.egg--; playSound('cook'); seat.cookStep = 3; 
        
        const stoveElements = document.querySelectorAll('.stove-station');
        const currentStove = stoveElements[index];
        if (currentStove) {
            const eggEmoji = document.createElement('div'); eggEmoji.className = 'egg-drop'; eggEmoji.innerText = '🥚';
            currentStove.appendChild(eggEmoji); setTimeout(() => eggEmoji.remove(), 500);
        }
        finishCooking(index); return; 
    }
    updateUI(); updateKitchenUI();
}

function finishCooking(index) {
    let seat = seats[index]; if(!seat) return;
    setTimeout(() => {
        seat.isCooking = false; 
        seat.needsServing = true; 
        seat.patience = 100;
        
        let maxExtra = game.idxWok;
        if (maxExtra > 0) {
            let extra = 0;
            for (let j = 0; j < game.tablesOwned; j++) { 
                if (extra >= maxExtra) break; 
                let otherSeat = seats[j];
                if (j !== index && otherSeat && otherSeat.occupied && otherSeat.isCooking) { 
                    let reqNoodle = otherSeat.cookStep === 0 ? 1 : 0;
                    let reqBroth  = otherSeat.cookStep === 0 ? 1 : 0;
                    let reqSpice  = otherSeat.cookStep <= 1 ? 1 : 0;
                    let reqEgg    = otherSeat.cookStep <= 2 ? 1 : 0;
                    
                    if (game.inv.noodle >= reqNoodle && game.inv.broth >= reqBroth && game.inv.spice >= reqSpice && game.inv.egg >= reqEgg) {
                        game.inv.noodle -= reqNoodle; game.inv.broth -= reqBroth; game.inv.spice -= reqSpice; game.inv.egg -= reqEgg;
                        otherSeat.isCooking = false; otherSeat.needsServing = true; otherSeat.patience = 100; otherSeat.cookStep = 3; extra++; 
                    } else {
                        let msg = document.getElementById('out-of-stock-msg'); if(msg) msg.classList.remove('hidden');
                    }
                } 
            }
        }
        saveGame(); updateUI(); updateKitchenUI();
    }, 400);
}

function getMonkeySpeed() { 
    let baseSpeed = 3000 * Math.pow(0.85, game.idxAuto);
    let trainingBoost = 1 - Math.min(0.45, (game.staffTraining.waiter || 0) * 0.03);
    let finalSpeed = baseSpeed * (game.autoChefSpeedMulti || 1) * trainingBoost;
    return Math.max(50, finalSpeed / rushMultiplier); 
}

function runMonkeyLoop() {
    if (game.staff && game.staff.waiter > 0) {
        for (let i = 0; i < game.tablesOwned; i++) {
            let s = seats[i];
            if (!s || !s.occupied || s.charData === null) continue;
            
            if (s.needsMenu || s.needsServing || s.needsToPay) { 
                if (s.needsServing && s.charData.wantsBoba && game.inv.boba < 1) continue; 
                
                handleTableClick(i); 
                break; 
            }
        }
    }
    let currentSpeed = getMonkeySpeed();
    setTimeout(runMonkeyLoop, currentSpeed);
}

function buyTable() { let u = TRACK_TABLES[game.idxTable]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.tablesOwned++; game.idxTable++; playSound('cash'); saveGame(); updateUI(); updateKitchenUI(); } }
function buyRecipe() { let u = TRACK_RECIPES[game.idxRecipe]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.currentMenuPrice = u.value; game.idxRecipe++; playSound('cash'); saveGame(); updateUI(); } }
function buyAuto() { 
    let u = TRACK_AUTO[game.idxAuto]; 
    if (u && game.wallet >= u.cost) { 
        game.wallet -= u.cost; 
        game.idxAuto++; 
        playSound('cash'); 
        saveGame(); 
        updateUI(); 
        updateKitchenUI(); 
    } 
}
function buyWok() { let u = TRACK_WOK[game.idxWok]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.idxWok++; playSound('cash'); saveGame(); updateUI(); } }
function buyAds() { let u = TRACK_ADS[game.idxAds]; if (u && game.wallet >= u.cost) { game.wallet -= u.cost; game.idxAds++; playSound('cash'); saveGame(); updateUI(); } }

function renderPad(id, track, idx, func, title) {
    let container = document.getElementById(id); 
    if(!container) return; 
    let u = track[idx];
    if (!u) { container.innerHTML = `<button class="tycoon-pad" style="background:#333;">${title}<br>MAX LEVEL</button>`; } 
    else { let afford = game.wallet >= u.cost ? "affordable" : ""; container.innerHTML = `<button class="tycoon-pad ${afford}" onclick="${func}()"><b>${title}</b><br>Lvl ${idx+1}: ${u.name}<br>$${formatMoney(u.cost)}</button>`; }
}

function updateUI() {
    if(document.getElementById('money')) document.getElementById('money').innerText = "$" + formatMoney(game.wallet);
    if(document.getElementById('inv-noodle')) document.getElementById('inv-noodle').innerText = formatMoney(game.inv.noodle); 
    if(document.getElementById('inv-broth')) document.getElementById('inv-broth').innerText = formatMoney(game.inv.broth);
    if(document.getElementById('inv-spice')) document.getElementById('inv-spice').innerText = formatMoney(game.inv.spice); 
    if(document.getElementById('inv-egg')) document.getElementById('inv-egg').innerText = formatMoney(game.inv.egg);
    if(document.getElementById('inv-boba')) document.getElementById('inv-boba').innerText = formatMoney(game.inv.boba);
    
    let autoBtn = document.getElementById('btn-auto-refill');
    if(autoBtn) {
        if(game.autoRefill) { autoBtn.innerText = "ACTIVE"; autoBtn.disabled = true; }
        else { autoBtn.innerText = "Buy ($50k)"; autoBtn.disabled = false; }
    }

    if(document.getElementById('stat-stars')) document.getElementById('stat-stars').innerText = game.monkeyMoney; 
    if(document.getElementById('stat-turf')) document.getElementById('stat-turf').innerText = game.turfMult.toFixed(1);
    if(document.getElementById('star-mult')) document.getElementById('star-mult').innerText = getPrestigeMultiplier().toFixed(1);
    if(document.getElementById('stat-served')) document.getElementById('stat-served').innerText = formatMoney(game.servedCount);
    if(document.getElementById('stat-combo')) document.getElementById('stat-combo').innerText = game.combo;
    if(document.getElementById('stat-level')) document.getElementById('stat-level').innerText = getRestaurantLevel();
    if(document.getElementById('stat-popularity')) document.getElementById('stat-popularity').innerText = Math.round(game.popularity);
    
    let currentRecipeName = (game.idxRecipe > 0 && TRACK_RECIPES[game.idxRecipe-1]) ? TRACK_RECIPES[game.idxRecipe-1].name : RAMEN_NAMES[0];
    if(document.getElementById('stat-menu')) document.getElementById('stat-menu').innerText = `${currentRecipeName} ($${formatMoney(game.currentMenuPrice)})`;

    let pBtn = document.getElementById('btn-prestige'); 
    if(pBtn) { if(game.idxRecipe >= 999) pBtn.removeAttribute('disabled'); else pBtn.setAttribute('disabled', 'true'); }

    seats.forEach((seat, i) => {
        let el = document.getElementById(`seat-${i}`); if (!el) return;
        if (i >= game.tablesOwned) { el.classList.add('locked'); return; } else el.classList.remove('locked');
        
        let html = "";
        if (seat.occupied && seat.charData) {
            if (seat.needsMenu) html += `<div class="menu-request">📜?</div>`;
            if (seat.needsServing) html += `<div class="serve-request">🍜</div>`;
            if (seat.needsToPay && !seat.needsServing) html += `<div class="pay-request">$</div>`;
            html += `<div class="patience-container"><div id="patience-bar-${i}" class="patience-fill" style="width:${seat.patience}%; background-color:${seat.patience < 30 ? '#d63031' : '#00b894'}"></div></div>`;
            html += `<div class="customer-wrapper">${renderCharHTML(seat.charData)}</div>`;
        } else { html += `<span class="status-text" style="color:#aaa;">Empty</span>`; }
        html += `<div class="belt-strip"></div>`; el.innerHTML = html; el.onclick = () => handleTableClick(i);
    });

    renderPad('pad-table', TRACK_TABLES, game.idxTable, 'buyTable', '🪑 TABLES'); 
    renderPad('pad-recipe', TRACK_RECIPES, game.idxRecipe, 'buyRecipe', '🍲 RECIPES');
    renderPad('pad-wok', TRACK_WOK, game.idxWok, 'buyWok', '🍳 WOK'); 
    renderPad('pad-auto', TRACK_AUTO, game.idxAuto, 'buyAuto', '🐒 MAIN CHEF');
    renderPad('pad-ads', TRACK_ADS, game.idxAds || 0, 'buyAds', '📺 ADVERTISE');
    renderRestaurantControls();
    renderMissionsPanel();
}

function updateKitchenUI() {
    let container = document.getElementById('stoves-container'); 
    if(!container) return;
    container.innerHTML = ""; 
    seats.forEach((seat, i) => {
        if (seat.occupied && seat.isCooking) {
            let stove = document.createElement('div'); stove.className = "stove-station"; stove.onclick = () => clickStove(i);
            let chefHTML = game.idxAuto > 0 ? `<div class="visual-chef">🐒</div>` : '';
            stove.innerHTML = `<div class="stove-label">Step ${seat.cookStep+1}</div><div class="manual-bowl step-${seat.cookStep}"></div><div class="stove-burner"></div>${chefHTML}`;
            container.appendChild(stove);
        }
    });
}

function buyStaff(id, cost) { if(game.wallet >= cost) { game.wallet -= cost; game.staff[id]++; playSound('cash'); saveGame(); updateUI(); renderStaffPanel(); } }

function trainStaff(id) {
    const currentLevel = game.staffTraining[id] || 0;
    const cost = 2500 * (currentLevel + 1);
    if (game.wallet < cost) {
        playSound('error');
        return;
    }
    game.wallet -= cost;
    game.staffTraining[id] = currentLevel + 1;
    gainRestaurantXp(10);
    playSound('cash');
    addReview(`The ${id} team just finished advanced training. Service is getting sharper.`, true);
    saveGame();
    updateUI();
    renderStaffPanel();
}

function renderStaffPanel() {
    let container = document.getElementById('staff-container');
    if(!container) return;
    let html = "";
    TRACK_STAFF.forEach(s => {
        let cost = s.baseCost * Math.pow(s.mult, game.staff[s.id]);
        let afford = game.wallet >= cost ? "affordable" : "";
        const trainingLevel = game.staffTraining[s.id] || 0;
        const trainingCost = 2500 * (trainingLevel + 1);
        html += `<div class="staff-card"><button class="tycoon-pad ${afford}" onclick="buyStaff('${s.id}', ${cost})"><b>${s.name}</b><br>Hired: ${game.staff[s.id]}<br>Hire Cost: $${formatMoney(cost)}</button><button class="training-btn ${game.wallet >= trainingCost ? 'ready' : ''}" onclick="trainStaff('${s.id}')">🎓 Train Lv.${trainingLevel} · $${formatMoney(trainingCost)}</button></div>`;
    });
    container.innerHTML = html;
}

function attackRival(idx) {
    let rival = game.rivals[idx]; if(!rival) return;
    if(rival.hp > 0 && game.wallet >= rival.cost) {
        game.wallet -= rival.cost;
        rival.hp -= Math.max(1, rival.maxHp * 0.1); 
        playSound('cook');
        if(rival.hp <= 0) { rival.hp = 0; game.turfMult += rival.multReward; game.rivalsDefeated++; checkAchievements(); playSound('cash'); alert(`DEFEATED ${rival.name}! Global Profit Multiplier increased by +${rival.multReward}x!`); }
        saveGame(); updateUI(); renderTurfPanel();
    } else { playSound('error'); }
}
function renderTurfPanel() {
    let container = document.getElementById('turf-container');
    if(!container) return;
    let html = "";
    game.rivals.forEach((r, i) => {
        if(r.hp <= 0) { html += `<div class="rival-card" style="opacity:0.5;"><h3>${r.name} (DEFEATED)</h3><span>+${r.multReward}x Multiplier Active</span></div>`; }
        else {
            let pct = (r.hp / r.maxHp) * 100;
            let afford = game.wallet >= r.cost ? "affordable" : "";
            html += `<div class="rival-card"><div class="rival-info"><h3>${r.name}</h3><div class="hp-bar-bg"><div class="hp-bar-fill" style="width:${pct}%"></div></div></div><button class="tycoon-pad ${afford}" onclick="attackRival(${i})">Launch Campaign<br>Cost: $${formatMoney(r.cost)}</button></div>`;
        }
    });
    container.innerHTML = html;
}

function buyDecor(id, cost) { if(game.decorOwned.includes(id)) { game.activeDecor = id; applyTheme(); saveGame(); renderDecorPanel(); } else if(game.wallet >= cost) { game.wallet -= cost; game.decorOwned.push(id); game.activeDecor = id; playSound('cash'); applyTheme(); saveGame(); updateUI(); renderDecorPanel(); } else { playSound('error'); } }
function renderDecorPanel() { let container = document.getElementById('decor-container'); if(!container) return; let html = ""; TRACK_DECOR.forEach(d => { let isOwned = game.decorOwned.includes(d.id); let isActive = game.activeDecor === d.id; let btnText = isActive ? "EQUIPPED" : (isOwned ? "EQUIP" : `BUY: $${formatMoney(d.cost)}`); let canAfford = game.wallet >= d.cost || isOwned ? "affordable" : ""; html += `<button class="tycoon-pad ${canAfford} ${isActive?'active':''}" style="margin:5px;" onclick="buyDecor('${d.id}', ${d.cost})"><b>${d.name}</b><br>${btnText}</button>`; }); container.innerHTML = html; }
function applyTheme() {
    const mc = document.getElementById('main-container');
    if (!mc) return;
    mc.className = `game-container ${game.activeDecor} ${game.nightMode ? 'night-mode' : ''}`;
    const scene = document.getElementById('restaurant-scene');
    if (scene) scene.style.setProperty('--camera-angle', `${game.cameraAngle}deg`);
}

function toggleNightMode() {
    game.nightMode = !game.nightMode;
    applyTheme();
    renderRestaurantControls();
    saveGame();
}

function startDelivery() {
    if (game.deliveryActive) return;
    const reward = Math.ceil(Math.max(150, game.currentMenuPrice * 5) * getDailySpecial().multiplier * getPopularityMultiplier());
    game.deliveryActive = { endsAt: Date.now() + 15000, reward };
    playSound('serve');
    renderDeliveryPanel();
    saveGame();
}

function completeDelivery() {
    if (!game.deliveryActive) return;
    const reward = game.deliveryActive.reward;
    game.wallet += reward;
    game.deliveriesCompleted++;
    game.popularity = Math.min(100, game.popularity + 1);
    gainRestaurantXp(15);
    addReview('A delivery arrived hot, fast, and packed with extra noodles.');
    showAchievementToast({ icon: '🚚', title: 'Delivery Complete!' });
    game.deliveryActive = null;
    playSound('cash');
    updateUI();
    saveGame();
}

function prestigeGame() { 
    if(game.idxRecipe >= 999 && confirm("Sell franchise for Monkey Money? Reset money/upgrades for 50 Monkey Money and a permanent profit multiplier!")) { 
        let st = (game.monkeyMoney || 0) + 50; 
        let tm = game.turfMult; let d = game.decorOwned; let ad = game.activeDecor; let rv = game.rivals; let ach = game.achievements || [];
        localStorage.clear(); 
        game = { wallet: 150, monkeyMoney: st, turfMult: tm, lastSaveTime: Date.now(), tablesOwned: 1, idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxAds: 0, idxSpecial: 0, currentMenuPrice: 50, activeDecor: ad, decorOwned: d, autoRefill: false, staff: {waiter:0,ninja:0,mascot:0}, rivals: rv, inv: {...defaultInv}, upgrades: {}, achievements: ach, autoChefSpeedMulti: 1 }; 
        saveGame(); location.reload(); 
    } else if (game.idxRecipe < 999) {
        alert("You must unlock Universal Ramen (Level 1000) before you can franchise!");
    }
}
function resetGame() { if(confirm("Erase all history?")) { localStorage.clear(); location.reload(); } }

function openBlackMarket() {
    let cost = 10;
    let buy = confirm(`🕵️ THE BLACK MARKET 🕵️\n\nSpend 10 Monkey Money to permanently make your Auto-Chefs 10% faster?\n\nYou have: ${game.monkeyMoney || 0} MM`);
    if (buy) {
        if (game.monkeyMoney >= cost) {
            game.monkeyMoney -= cost;
            game.autoChefSpeedMulti = (game.autoChefSpeedMulti || 1) * 0.9;
            saveGame(); updateUI();
            alert("⚙️ UPGRADE SUCCESSFUL! Your Auto-Chefs are now permanently faster!");
        } else { alert("❌ Not enough Monkey Money! Defeat rivals or Franchise to earn more."); }
    }
}

let rushTimeout;
function triggerEvent(type) {
    const toast = document.getElementById('event-toast');
    game.eventsTriggered++;
    checkAchievements();

    if (type === 'rush') {
        isRushHour = true;
        rushMultiplier = 2;
        if (toast) {
            toast.innerText = '🚨 RUSH HOUR! Profits and customer speed doubled for 30 seconds! 🚨';
            toast.classList.remove('hidden');
        }
        clearTimeout(rushTimeout);
        rushTimeout = setTimeout(() => {
            isRushHour = false;
            rushMultiplier = 1;
            if (toast) toast.classList.add('hidden');
        }, 30000);
    } else if (type === 'health') {
        const fine = Math.min(game.wallet, 10000);
        game.wallet -= fine;
        if (toast) {
            toast.innerText = `🧾 HEALTH INSPECTOR FINE: -$${formatMoney(fine)}`;
            toast.classList.remove('hidden');
            clearTimeout(rushTimeout);
            rushTimeout = setTimeout(() => toast.classList.add('hidden'), 4000);
        }
        playSound('error');
        updateUI();
        saveGame();
    }
}

function nukeRivals() {
    if (!confirm('Defeat every rival and claim all remaining turf bonuses?')) return;

    let bonus = 0;
    game.rivals.forEach(rival => {
        if (rival.hp > 0) {
            rival.hp = 0;
            bonus += rival.multReward;
        }
    });
    game.turfMult += bonus;
    playSound('cash');
    saveGame();
    updateUI();
    renderTurfPanel();
}

function closeAdmin() {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.classList.add('hidden');
}

let goldenMonkeyTimer;
function scheduleGoldenMonkey() {
    clearTimeout(goldenMonkeyTimer);
    goldenMonkeyTimer = setTimeout(() => {
        spawnGoldenMonkey();
        scheduleGoldenMonkey();
    }, 25000 + Math.random() * 25000);
}

function spawnGoldenMonkey() {
    if (document.querySelector('.golden-macaque')) return;
    const monkey = document.createElement('button');
    monkey.className = 'golden-macaque';
    monkey.type = 'button';
    monkey.innerText = '🐒';
    monkey.title = 'Click for a golden bonus!';
    monkey.setAttribute('aria-label', 'Collect the golden monkey bonus');
    monkey.onclick = () => claimGoldenMonkey(monkey);
    document.body.appendChild(monkey);
    setTimeout(() => monkey.remove(), 12000);
}

function claimGoldenMonkey(monkey) {
    if (!monkey || !monkey.isConnected) return;
    const reward = Math.max(250, game.currentMenuPrice * 20) * getPrestigeMultiplier();
    game.wallet += reward;
    game.monkeyMoney++;
    game.eventsTriggered++;
    window.vipPartyActive += 5;
    monkey.remove();
    showAchievementToast({ icon: '🌟', title: 'Golden Monkey Found!' });
    spawnFloatingMoney(`+$${formatMoney(reward)} +1 MM`, 'money', '#f1c40f');
    checkAchievements();
    updateUI();
    saveGame();
}

let typed = ""; document.addEventListener('keydown', (e) => { typed += e.key.toLowerCase(); if (typed.endsWith("idk")) { let ap = document.getElementById('admin-panel'); if(ap) ap.classList.remove('hidden'); typed = ""; } if (typed.length > 20) typed = typed.slice(-20); });
function cheatMoney(amt) { game.wallet += amt; saveGame(); updateUI(); }
function setCustomMoney() { let val = parseFloat(document.getElementById('custom-money').value); if(!isNaN(val)) { game.wallet = val; saveGame(); updateUI(); } }
function adminMaxIngredients() { game.inv.noodle=1e15; game.inv.broth=1e15; game.inv.spice=1e15; game.inv.egg=1e15; game.inv.boba=1e15; if(document.getElementById('out-of-stock-msg')) document.getElementById('out-of-stock-msg').classList.add('hidden'); saveGame(); updateUI(); }
function cheatStars() { game.monkeyMoney++; saveGame(); updateUI(); }

function adminMaxEverything() {
    game.wallet = 1e50; 
    game.monkeyMoney = 1e9;
    game.tablesOwned = 1000; 
    game.idxTable = 999;
    game.idxRecipe = 999; 
    game.idxWok = 999;
    game.idxAuto = 999;
    game.idxAds = 999;
    adminMaxIngredients();
    saveGame();
    updateUI();
    location.reload();
}

function saveGame() {
    game.lastSaveTime = Date.now();
    localStorage.setItem('RamenUltimateData', JSON.stringify(game));
}

function loadGame() {
    let saved = localStorage.getItem('RamenUltimateData');
    if (saved) {
        try {
            let parsed = JSON.parse(saved);
            game = Object.assign(game, parsed);
        } catch (error) {
            localStorage.removeItem('RamenUltimateData');
            console.warn('Saved game was invalid. Starting a fresh restaurant.', error);
        }

        let now = Date.now();
        let timeDiff = now - (game.lastSaveTime || now);
        let secondsAway = Math.floor(timeDiff / 1000);

        if (secondsAway > 60) {
            if(document.getElementById('offline-earned')) document.getElementById('offline-earned').innerText = "0";
            if(document.getElementById('offline-time')) document.getElementById('offline-time').innerText = `${Math.floor(secondsAway/60)} Minutes`;
            if(document.getElementById('offline-modal')) document.getElementById('offline-modal').classList.remove('hidden');
        }
        game.lastSaveTime = now;
    }
    normalizeGameState();
    resetMissionsIfNeeded();
}

function closeOfflineModal() {
    let modal = document.getElementById('offline-modal');
    if (modal) modal.classList.add('hidden');
    playSound('cash');
    game.lastSaveTime = Date.now();
    saveGame();
}

// --- BOOT UP THE GAME ---
window.onload = () => {
    loadGame();          
    applyTheme();
    initTables();        
    updateUI();          
    updateKitchenUI();   
    customerArrives();   
    runMonkeyLoop(); 
    scheduleGoldenMonkey();
};
