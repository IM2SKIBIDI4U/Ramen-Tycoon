/* Ramen Tycoon - repaired game script
 * This file intentionally contains one copy of each declaration. It avoids creating
 * AudioContext during page parsing, validates save data, and keeps UI updates null-safe.
 */
'use strict';

const suffixes = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qd', 'Qnd', 'Sxd', 'Spd', 'Ocd'];
const defaultInv = { noodle: 10, broth: 10, spice: 10, egg: 10, boba: 10 };
const RAMEN_NAMES = ['Basic Shoyu', 'Miso Pork', 'Spicy Tonkotsu', 'Chicken Paitan', 'Seafood Ramen', 'Veggie Udon', 'Truffle Ramen'];
const R_PRE = ['Basic', 'Spicy', 'Crispy', 'Golden', 'Mega', 'Ultra', 'Hyper', 'Quantum', 'Galactic', 'Cosmic', 'Mystic', 'Atomic', 'Neon', 'Shadow', 'Celestial', 'Divine', 'Infernal', 'Supreme'];
const R_BASE = ['Shoyu', 'Miso', 'Tonkotsu', 'Udon', 'Soba', 'Truffle', 'Wagyu', 'Dragon', 'Phoenix', 'Nova', 'Kelp', 'Katsu', 'Kimchi', 'Kitsune', 'Bison', 'Kraken', 'Leviathan', 'Titan', 'Emperor'];

const track = (length, name, start, growth) => Array.from({ length }, (_, i) => ({ name: name(i), cost: Math.floor(start * Math.pow(growth, i)) }));
const TRACK_TABLES = track(1000, i => `Table ${i + 2}`, 500, 1.18);
const TRACK_WOK = track(1000, i => `Wok Lvl ${i + 2}`, 100000, 1.19);
const TRACK_AUTO = track(1000, i => `Chef Speed Lvl ${i + 1}`, 2500, 1.16);
const TRACK_ADS = track(1000, i => `Marketing Lvl ${i + 1}`, 2000, 1.20);
const TRACK_RECIPES = Array.from({ length: 1000 }, (_, i) => ({
    name: i === 999 ? 'The Universal Ramen' : (RAMEN_NAMES[i] || `${R_PRE[i % R_PRE.length]} ${R_BASE[Math.floor(i / R_PRE.length) % R_BASE.length]} Ramen`),
    cost: Math.floor(1000 * Math.pow(1.14, i)),
    value: Math.floor(50 * Math.pow(1.11, i))
}));
const TRACK_DECOR = [
    { id: 'theme-default', name: 'Standard Store', cost: 0 },
    { id: 'theme-neon', name: 'Cyberpunk Neon', cost: 500000 },
    { id: 'theme-zen', name: 'Zen Garden', cost: 10000000 }
];
const TRACK_STAFF = [
    { id: 'waiter', name: 'Waiter Chimp (Auto Serve/Pay)', baseCost: 50000, mult: 5 },
    { id: 'ninja', name: 'Ninja Macaque (Insta-Cook Chance)', baseCost: 250000, mult: 10 },
    { id: 'mascot', name: 'Capuchin Mascot (+Patience/Tips)', baseCost: 1000000, mult: 15 }
];
const INITIAL_RIVALS = [
    { id: 'sushi', name: '🍣 Sushi Pandas', hp: 50000, maxHp: 50000, cost: 5000, multReward: 0.5 },
    { id: 'burger', name: '🍔 Burger Bears', hp: 1000000, maxHp: 1000000, cost: 50000, multReward: 1 },
    { id: 'pizza', name: '🍕 Pizza Penguins', hp: 50000000, maxHp: 50000000, cost: 1000000, multReward: 2 },
    { id: 'taco', name: '🌮 Taco Tigers', hp: 1e10, maxHp: 1e10, cost: 5e8, multReward: 5 },
    { id: 'boss', name: '🦍 The Silverback Syndicate', hp: 1e15, maxHp: 1e15, cost: 1e12, multReward: 20 }
];
const DAILY_SPECIALS = [
    { name: 'Golden Egg Ramen', icon: '🥚', description: 'Eggs taste legendary today', multiplier: 1.5 },
    { name: 'Neon Boba Blast', icon: '🧋', description: 'Boba fans pay premium prices', multiplier: 1.35 },
    { name: 'Chef’s Secret Miso', icon: '🥣', description: 'A cozy bowl for serious foodies', multiplier: 1.25 },
    { name: 'Dragon Spice Challenge', icon: '🌶️', description: 'Brave guests leave giant tips', multiplier: 1.75 },
    { name: 'Midnight Tonkotsu', icon: '🌙', description: 'Late-night broth is twice as rich', multiplier: 1.6 }
];

const freshGame = () => ({
    wallet: 150, monkeyMoney: 0, turfMult: 1, lastSaveTime: Date.now(), tablesOwned: 1,
    idxTable: 0, idxRecipe: 0, idxWok: 0, idxAuto: 0, idxAds: 0, currentMenuPrice: 50,
    activeDecor: 'theme-default', decorOwned: ['theme-default'], autoRefill: false,
    staff: { waiter: 0, ninja: 0, mascot: 0 }, staffTraining: { waiter: 0, ninja: 0, mascot: 0 },
    rivals: structuredClone(INITIAL_RIVALS), inv: { ...defaultInv }, achievements: [],
    servedCount: 0, totalEarned: 0, vipServed: 0, combo: 0, bestCombo: 0, popularity: 50,
    rivalsDefeated: 0, eventsTriggered: 0, deliveriesCompleted: 0, nightMode: false,
    autoChefSpeedMulti: 1, dailySpecialIndex: 0, specialEndsAt: Date.now() + 86400000
});
let game = freshGame();
let seats = Array.from({ length: 1000 }, () => ({ occupied: false, charData: null, needsMenu: false, isCooking: false, cookStep: 0, needsServing: false, needsToPay: false, patience: 100 }));
let waitList = [];
let rushMultiplier = 1;
let audioCtx = null;

function formatMoney(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    if (Math.abs(n) < 1000) return Math.floor(n).toString();
    const exponent = Math.floor(Math.log10(Math.abs(n)));
    const index = Math.floor(exponent / 3);
    return index < suffixes.length ? `${(n / Math.pow(10, index * 3)).toFixed(2)}${suffixes[index]}` : n.toExponential(2);
}
function playSound(type) {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx ||= new Ctx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        const tones = { cash: [800, 1200, 'sine'], cook: [200, 100, 'square'], serve: [400, 600, 'triangle'], error: [150, 90, 'sawtooth'] };
        const [from, to, wave] = tones[type] || tones.error;
        osc.type = wave; osc.frequency.setValueAtTime(from, now); osc.frequency.exponentialRampToValueAtTime(to, now + 0.1);
        gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.13);
    } catch (_) { /* Audio is optional. */ }
}
function el(id) { return document.getElementById(id); }
function saveGame() { game.lastSaveTime = Date.now(); localStorage.setItem('RamenUltimateData', JSON.stringify(game)); }
function normalizeGameState() {
    const defaults = freshGame();
    Object.keys(defaults).forEach(key => { if (game[key] === undefined || game[key] === null) game[key] = defaults[key]; });
    ['wallet', 'monkeyMoney', 'turfMult', 'tablesOwned', 'idxTable', 'idxRecipe', 'idxWok', 'idxAuto', 'idxAds', 'currentMenuPrice', 'popularity'].forEach(k => { game[k] = Number.isFinite(Number(game[k])) ? Number(game[k]) : defaults[k]; });
    game.tablesOwned = Math.max(1, Math.min(1000, Math.floor(game.tablesOwned)));
    game.inv = { ...defaultInv, ...(game.inv || {}) }; game.staff = { ...defaults.staff, ...(game.staff || {}) }; game.staffTraining = { ...defaults.staffTraining, ...(game.staffTraining || {}) };
    game.decorOwned = Array.isArray(game.decorOwned) && game.decorOwned.length ? game.decorOwned : ['theme-default'];
    game.rivals = Array.isArray(game.rivals) && game.rivals.length ? game.rivals : structuredClone(INITIAL_RIVALS);
}
function loadGame() { try { const saved = localStorage.getItem('RamenUltimateData'); if (saved) game = Object.assign(freshGame(), JSON.parse(saved)); } catch (_) { localStorage.removeItem('RamenUltimateData'); game = freshGame(); } normalizeGameState(); }
function getPrestigeMultiplier() { return (1 + game.monkeyMoney * 0.5) * game.turfMult; }
function getDailySpecial() { if (Date.now() >= game.specialEndsAt) { game.dailySpecialIndex = (game.dailySpecialIndex + 1) % DAILY_SPECIALS.length; game.specialEndsAt = Date.now() + 86400000; saveGame(); } return DAILY_SPECIALS[game.dailySpecialIndex] || DAILY_SPECIALS[0]; }
function generateRandomChar() { return { isVIP: Math.random() < 0.01, isCritic: Math.random() < 0.02, wantsBoba: Math.random() < 0.2 }; }
function renderCharHTML(c) { return `<div class="rpg-char${c.isVIP ? ' vip-char' : ''}">${c.isVIP ? '👑 ' : ''}${c.isCritic ? '🧐 ' : ''}🐒${c.wantsBoba ? ' 🧋' : ''}</div>`; }
function spawnFloatingMoney(amount, targetId, color = '#2ecc71') { const node = document.createElement('div'); node.className = 'floating-money'; node.textContent = typeof amount === 'number' ? `+$${formatMoney(amount)}` : amount; node.style.cssText = `position:fixed;color:${color};font-weight:bold;z-index:100;animation:floatUp 1s ease-out forwards;left:50%;top:50%;`; const target = el(targetId); if (target) { const r = target.getBoundingClientRect(); node.style.left = `${r.left + 20}px`; node.style.top = `${r.top}px`; } document.body.appendChild(node); setTimeout(() => node.remove(), 1000); }
function renderWaitList() { const node = el('wait-list'); if (node) node.innerHTML = waitList.map(renderCharHTML).join(''); }
function customerArrives() { if (waitList.length < 10) waitList.push(generateRandomChar()); renderWaitList(); checkEmptySeats(); setTimeout(customerArrives, Math.max(300, 4000 * Math.pow(0.92, game.idxAds) / rushMultiplier)); }
function checkEmptySeats() { const index = seats.slice(0, game.tablesOwned).findIndex(s => !s.occupied); if (index < 0 || !waitList.length) return; const seat = seats[index]; seat.occupied = true; seat.charData = waitList.shift(); seat.needsMenu = true; seat.patience = 100; renderWaitList(); updateUI(); }
function collectPayment(index) { const seat = seats[index]; if (!seat?.charData) return; let mult = seat.charData.isVIP ? 10 : 1; if (seat.charData.isCritic) mult *= 25; mult += (game.staff.mascot || 0) * 0.5; const value = game.currentMenuPrice * mult * getPrestigeMultiplier() * rushMultiplier * getDailySpecial().multiplier; game.wallet += value; game.totalEarned += value; game.servedCount++; if (seat.charData.isVIP || seat.charData.isCritic) game.vipServed++; game.combo++; game.bestCombo = Math.max(game.bestCombo, game.combo); spawnFloatingMoney(value, `seat-${index}`); playSound('cash'); Object.assign(seat, { occupied: false, charData: null, needsMenu: false, isCooking: false, cookStep: 0, needsServing: false, needsToPay: false, patience: 100 }); saveGame(); updateUI(); }
function handleTableClick(index) { const seat = seats[index]; if (!seat?.occupied || !seat.charData) return; if (seat.needsMenu || (!seat.isCooking && !seat.needsServing && !seat.needsToPay)) { seat.needsMenu = false; seat.isCooking = true; seat.cookStep = 0; updateUI(); updateKitchenUI(); } else if (seat.needsServing) { if (seat.charData.wantsBoba && game.inv.boba < 1) return playSound('error'); if (seat.charData.wantsBoba) game.inv.boba--; seat.needsServing = false; seat.needsToPay = true; playSound('serve'); updateUI(); } else if (seat.needsToPay) collectPayment(index); }
function clickStove(index) { const seat = seats[index]; if (!seat?.isCooking) return; const needs = ['noodle', 'broth', 'spice', 'egg']; const item = needs[seat.cookStep]; if (game.inv[item] < 1) return playSound('error'); game.inv[item]--; seat.cookStep++; playSound('cook'); if (seat.cookStep >= needs.length) { seat.isCooking = false; seat.needsServing = true; seat.patience = 100; } updateUI(); updateKitchenUI(); saveGame(); }
function initTables() { const node = el('dining-area'); if (!node || node.children.length) return; for (let i = 0; i < 1000; i++) { const table = document.createElement('div'); table.id = `seat-${i}`; table.onclick = () => handleTableClick(i); node.appendChild(table); } }
function updateKitchenUI() { const node = el('stoves-container'); if (!node) return; node.innerHTML = ''; seats.slice(0, game.tablesOwned).forEach((seat, i) => { if (!seat.isCooking) return; const stove = document.createElement('button'); stove.className = 'stove-station'; stove.textContent = `Step ${seat.cookStep + 1}`; stove.onclick = () => clickStove(i); node.appendChild(stove); }); }
function updateUI() { if (el('money')) el('money').textContent = `$${formatMoney(game.wallet)}`; Object.keys(defaultInv).forEach(k => { if (el(`inv-${k}`)) el(`inv-${k}`).textContent = formatMoney(game.inv[k]); }); if (el('stat-stars')) el('stat-stars').textContent = game.monkeyMoney; if (el('stat-served')) el('stat-served').textContent = formatMoney(game.servedCount); seats.forEach((seat, i) => { const node = el(`seat-${i}`); if (!node) return; node.classList.toggle('locked', i >= game.tablesOwned); node.innerHTML = seat.occupied && seat.charData ? `${seat.needsMenu ? '📜 ' : ''}${seat.needsServing ? '🍜 ' : ''}${seat.needsToPay ? '$ ' : ''}${renderCharHTML(seat.charData)}` : '<span class="status-text">Empty</span>'; }); updateKitchenUI(); }
function buy(track, key, valueKey = null) { const item = track[game[key]]; if (!item || game.wallet < item.cost) return playSound('error'); game.wallet -= item.cost; if (valueKey) game.currentMenuPrice = item[valueKey]; game[key]++; playSound('cash'); saveGame(); updateUI(); }
function buyTable() { buy(TRACK_TABLES, 'idxTable'); game.tablesOwned++; updateUI(); }
function buyRecipe() { buy(TRACK_RECIPES, 'idxRecipe', 'value'); }
function buyWok() { buy(TRACK_WOK, 'idxWok'); }
function buyAuto() { buy(TRACK_AUTO, 'idxAuto'); }
function buyAds() { buy(TRACK_ADS, 'idxAds'); }
function buyIngredient(type, amount, cost) { if (game.wallet < cost) return playSound('error'); game.wallet -= cost; game.inv[type] = (game.inv[type] || 0) + amount; playSound('cook'); saveGame(); updateUI(); }
function buyAutoRefill() { if (game.autoRefill || game.wallet < 50000) return playSound('error'); game.wallet -= 50000; game.autoRefill = true; saveGame(); updateUI(); }
function switchTab(tab) { document.querySelectorAll('.view-panel').forEach(p => p.classList.toggle('active-view', p.id === tab)); }
function applyTheme() { const node = el('main-container'); if (node) node.className = `game-container ${game.activeDecor || 'theme-default'}${game.nightMode ? ' night-mode' : ''}`; }
function toggleNightMode() { game.nightMode = !game.nightMode; applyTheme(); saveGame(); }
function resetGame() { if (confirm('Erase all history?')) { localStorage.removeItem('RamenUltimateData'); location.reload(); } }
function prestigeGame() { if (game.idxRecipe < 999) return alert('You must unlock Universal Ramen first.'); if (!confirm('Sell franchise for 50 Monkey Money?')) return; const mm = game.monkeyMoney + 50; game = freshGame(); game.monkeyMoney = mm; saveGame(); location.reload(); }
function cheatMoney(amount) { game.wallet += Number(amount) || 0; saveGame(); updateUI(); }
function cheatStars() { game.monkeyMoney++; saveGame(); updateUI(); }
function resetMissionsIfNeeded() {}

window.addEventListener('load', () => { loadGame(); initTables(); applyTheme(); updateUI(); customerArrives(); });
