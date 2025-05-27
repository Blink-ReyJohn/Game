// --- Base Constants ---
const BASE_LIFESPAN = 85;
const BASE_QI_REQUIREMENT = 100;
const QI_SCALE = 1.35;
const MAJOR_REALM_STAT_BOOST = 1.10;
const MINOR_REALM_STAT_BOOST = 1 + (MAJOR_REALM_STAT_BOOST - 1) * 0.7;
let rerollPreview = null;
let activeCategory = null;

// --- Pools ---
const chineseNames = ["Li Wei", "Zhao Hui", "Chen Jie", "Zhou Lei", "Lin Tao"];
const physiquePool = [
  { name: "Ordinary Vessel", rarity: "Common", element: "None", weight: 30, stats: { health: 1.0, strength: 1.0, qi: 1.0, speed: 1.0 }},
  { name: "Iron Muscle", rarity: "Uncommon", element: "Earth", weight: 20, stats: { health: 1.2, strength: 1.2, qi: 0.9, speed: 0.9 }},
  { name: "Swift Wind Body", rarity: "Uncommon", element: "Wind", weight: 18, stats: { health: 0.9, strength: 0.9, qi: 1.0, speed: 1.3 }},
  { name: "Jade Spirit Root", rarity: "Rare", element: "Wood", weight: 10, stats: { health: 1.0, strength: 0.9, qi: 1.4, speed: 1.1 }},
  { name: "Flameheart Physique", rarity: "Rare", element: "Fire", weight: 10, stats: { health: 1.1, strength: 1.3, qi: 1.2, speed: 1.0 }},
  { name: "Thousand Vein Core", rarity: "Epic", element: "Water", weight: 6, stats: { health: 1.2, strength: 1.1, qi: 1.5, speed: 1.2 }},
  { name: "Voidbone Body", rarity: "Epic", element: "Dark", weight: 5, stats: { health: 1.0, strength: 1.0, qi: 1.6, speed: 1.4 }},
  { name: "Sacred Beast Bloodline", rarity: "Legendary", element: "Beast", weight: 3, stats: { health: 1.6, strength: 1.5, qi: 1.3, speed: 1.2 }},
  { name: "Celestial Star Meridian", rarity: "Legendary", element: "Light", weight: 2, stats: { health: 1.3, strength: 1.3, qi: 1.8, speed: 1.4 }},
  { name: "Primordial Chaos Body", rarity: "Mythical", element: "Chaos", weight: 1, stats: { health: 2.0, strength: 2.0, qi: 2.0, speed: 2.0 }}
];

// --- Realms ---
const majorNames = ["Qi Gathering", "Foundation Building", "Core Formation", "Golden Core", "Soul Formation", "Nascent Soul", "Nihility", "Ascension", "Half Immortal", "Earth Immortal"];
const subRealms = [];
let qiReq = BASE_QI_REQUIREMENT;
for (let m = 0; m < majorNames.length; m++) {
  for (let lvl = 1; lvl <= 10; lvl++) {
    subRealms.push({ name: `${majorNames[m]} ${lvl}`, qiRequired: Math.round(qiReq) });
    qiReq *= QI_SCALE;
  }
}

// --- Player ---
let player = {
  name: "", age: 13, talent: 0, physique: null,
  stats: { health: 0, strength: 0, qi: 0, speed: 0 },
  subRealmIndex: 0, qi: 0, qiRequired: BASE_QI_REQUIREMENT,
  lifespan: BASE_LIFESPAN, equippedBook: null, statMultiplier: 1,
  cultivating: false, gold: 0, spiritStones: 0, inventory: []
};
let cultivationInterval = null;
let agingInterval = null;
let autoBreakEnabled = false;

// --- Helper Functions ---
function getTalentByRarity(rarity) {
  switch (rarity) {
    case "Common": return getRandomInRange(10, 40);
    case "Uncommon": return getRandomInRange(30, 60);
    case "Rare": return getRandomInRange(50, 75);
    case "Epic": return getRandomInRange(65, 85);
    case "Legendary": return getRandomInRange(80, 95);
    case "Mythical": return getRandomInRange(95, 100);
    default: return getRandomInRange(10, 40);
  }
}

function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPhysique() {
  const totalWeight = physiquePool.reduce((sum, p) => sum + p.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const p of physiquePool) {
    if (rand < p.weight) return p;
    rand -= p.weight;
  }
}

// --- UI & Player Functions ---
function calculateStats() {
  const base = player.talent;
  const mod = player.physique?.stats || { health: 1, strength: 1, qi: 1, speed: 1 };
  player.stats.health = Math.round(base * mod.health * player.statMultiplier);
  player.stats.strength = Math.round(base * mod.strength * player.statMultiplier);
  player.stats.qi = Math.round(base * mod.qi * player.statMultiplier);
  player.stats.speed = Math.round(base * mod.speed * player.statMultiplier);
}

function updateUI() {
  document.getElementById("player-name").textContent = player.name || "Unnamed";
  document.getElementById("age").textContent = player.age;
  document.getElementById("talent").textContent = player.talent;
  document.getElementById("realm").textContent = subRealms[player.subRealmIndex].name;

  const physEl = document.getElementById("physique");
  if (player.physique) {
    physEl.className = `tooltip rarity-${player.physique.rarity}`;
    physEl.textContent = player.physique.name;
    physEl.setAttribute("data-tooltip", `Rarity: ${player.physique.rarity} | Element: ${player.physique.element}`);
  }

  document.getElementById("health").textContent = player.stats.health;
  document.getElementById("strength").textContent = player.stats.strength;
  document.getElementById("qi").textContent = player.stats.qi;
  document.getElementById("speed").textContent = player.stats.speed;
  document.getElementById("lifespan").textContent = player.lifespan;
  document.getElementById("gold").textContent = player.gold;
  document.getElementById("spirit-stones").textContent = player.spiritStones;

  const pct = Math.min(100, (player.qi / player.qiRequired) * 100);
  document.getElementById("xp-bar").style.width = pct + "%";
  document.getElementById("xp-bar").title = `${player.qi} / ${player.qiRequired} Qi`;
  document.getElementById("xp-text").textContent = `${player.qi} / ${player.qiRequired}`;

  updateEquippedBookUI();
}

function updateEquippedBookUI() {
  const book = player.equippedBook;
  const nameEl = document.getElementById("equipped-book-name");
  const detailEl = document.getElementById("equipped-book-details");
  const bar = document.getElementById("proficiency-bar");

  if (!book) {
    nameEl.textContent = "None";
    detailEl.textContent = "—";
    bar.style.width = "0%";
    return;
  }

  nameEl.textContent = `${book.name} (Lv ${book.proficiencyLevel || 1})`;
  detailEl.textContent = `+${((book.baseQiBoost || 0) + (book.proficiencyLevel * (book.qiPerLevel || 0))) * 100}% Qi | +${((book.baseDmgBoost || 0) + (book.proficiencyLevel * (book.dmgPerLevel || 0))) * 100}% DMG`;

  const required = 100 + (book.proficiencyLevel - 1) * 150;
  const progress = Math.min(100, (book.proficiencyProgress / required) * 100);
  bar.style.width = `${progress}%`;
}

function startAging() {
  if (agingInterval) clearInterval(agingInterval);
  agingInterval = setInterval(() => {
    player.age++;
    if (player.age > player.lifespan) {
      showGameOver();
    }
    updateUI();
    savePlayerData();
  }, 30000);
}

function showGameOver() {
  clearInterval(cultivationInterval);
  clearInterval(agingInterval);
  const modal = document.getElementById("notice-modal");
  modal.querySelector(".modal-message").textContent = "☠️ You passed away from old age. Game Over.";
  modal.dataset.type = "death";
  modal.classList.remove("hidden");
  document.getElementById("cultivate-btn").disabled = true;
}

function savePlayerData() {
  try {
    localStorage.setItem("cultivationGameSave", JSON.stringify(player));
  } catch (e) {
    console.warn("Save failed", e);
  }
}

// --- Cultivation Logic ---
function toggleCultivation() {
  const btn = document.getElementById("cultivate-btn");
  if (!player.cultivating) {
    player.cultivating = true;
    btn.textContent = "Stop Cultivating";
    cultivationInterval = setInterval(() => {
      let qiGain = player.stats.qi;
      player.qi = Math.min(player.qiRequired, player.qi + qiGain);
      updateUI();
      savePlayerData();
      if (autoBreakEnabled && player.qi >= player.qiRequired) breakthrough();
    }, 1000);
  } else {
    player.cultivating = false;
    btn.textContent = "Start Cultivating";
    clearInterval(cultivationInterval);
  }
}

function toggleAutoBreak() {
  autoBreakEnabled = !autoBreakEnabled;
  document.getElementById("auto-break-btn").classList.toggle("active", autoBreakEnabled);
}

function breakthrough() {
  if (player.qi < player.qiRequired) {
    const modal = document.getElementById("notice-modal");
    modal.querySelector(".modal-message").textContent = `Need ${player.qiRequired} Qi, but you have ${player.qi}.`;
    modal.dataset.type = "warning";
    modal.classList.remove("hidden");
    return;
  }

  player.qi = 0;
  const prevMajor = Math.floor(player.subRealmIndex / 10);
  if (player.subRealmIndex < subRealms.length - 1) {
    player.subRealmIndex++;
    player.qiRequired = subRealms[player.subRealmIndex].qiRequired;
    const newMajor = Math.floor(player.subRealmIndex / 10);
    const tier = newMajor;

    player.statMultiplier *= newMajor > prevMajor ? MAJOR_REALM_STAT_BOOST : MINOR_REALM_STAT_BOOST;
    player.lifespan += newMajor > prevMajor ? 8 * (tier + 1) : 3 * (tier + 1);
    calculateStats();
    updateUI();
    savePlayerData();
  }
}

// --- Inventory & Region ---
function toggleInventory() {
  document.getElementById("inventory-panel").classList.toggle("hidden");
  document.getElementById("center-content").classList.add("hidden");
  document.getElementById("battle-panel").classList.add("hidden");
}

function toggleBattle() {
  document.getElementById("battle-panel").classList.toggle("hidden");
  document.getElementById("center-content").classList.add("hidden");
  document.getElementById("inventory-panel").classList.add("hidden");
}

function selectRegion(regionName) {
  const modal = document.getElementById("notice-modal");
  modal.querySelector(".modal-message").textContent = `You travel to ${regionName}.`;
  modal.dataset.type = "info";
  modal.classList.remove("hidden");
}

// --- Character Reroll ---
function rerollLife() {
  const name = chineseNames[Math.floor(Math.random() * chineseNames.length)];
  const physique = getRandomPhysique();
  const talent = getTalentByRarity(physique.rarity);

  player.name = name;
  player.physique = physique;
  player.talent = talent;
  player.age = 13;
  player.subRealmIndex = 0;
  player.qi = 0;
  player.qiRequired = BASE_QI_REQUIREMENT;
  player.lifespan = BASE_LIFESPAN;
  player.statMultiplier = 1;
  player.inventory = [];
  player.cultivating = false;
  player.equippedBook = null;
  player.gold = 0;
  player.spiritStones = 0;

  calculateStats();
  updateUI();
  savePlayerData();
  startAging();

  const modal = document.getElementById("notice-modal");
  modal.querySelector(".modal-message").textContent = `Reborn as ${name} with ${talent} talent and physique "${physique.name}".`;
  modal.classList.remove("hidden");
}

// --- Inventory Order ---
const rarityOrder = {
  "Mythical": 0,
  "Legendary": 1,
  "Epic": 2,
  "Rare": 3,
  "Uncommon": 4,
  "Common": 5,
  "Gray": 6
};

function filterInventory(type) {
  const wrapper = document.getElementById("inventory-scroll-wrapper");
  const grid = document.getElementById("inventory-grid");
  const tabs = document.getElementById("inventory-tabs").children;

  if (activeCategory === type) {
    grid.innerHTML = "";
    wrapper.classList.add("hidden");
    for (const tab of tabs) tab.style.display = "inline-block";
    activeCategory = null;
    return;
  }

  activeCategory = type;
  grid.innerHTML = "";
  wrapper.classList.remove("hidden");

  for (const tab of tabs) {
    tab.style.display = tab.id.includes(type) || type === "all" ? "inline-block" : "none";
  }

  const sorted = [...player.inventory].sort((a, b) => {
    const rarityA = rarityOrder[a.rarity] ?? 99;
    const rarityB = rarityOrder[b.rarity] ?? 99;
    if (rarityA !== rarityB) return rarityA - rarityB;
    return a.name.localeCompare(b.name);
  });

  const headerMap = {
    book: "📘 Books",
    equipment: "🛡️ Equipment",
    consumable: "🧪 Consumables"
  };

  const group = type === "all" ? ["equipment", "book", "consumable"] : [type];

  group.forEach(t => {
    const header = document.createElement("h3");
    header.textContent = headerMap[t];
    grid.appendChild(header);
    renderItems(sorted.filter(i => i.type === t), grid);
  });
}

function renderItems(items, container) {
  for (const item of items) {
    const div = document.createElement("div");
    div.className = `inventory-item rarity-${item.rarity.toLowerCase()}`;
    div.textContent = item.name + (item.quantity ? ` x${item.quantity}` : "");
    container.appendChild(div);
  }
}


// --- Modal Close ---
function closeNoticeModal() {
  const modal = document.getElementById("notice-modal");
  modal.classList.add("hidden");
  if (modal.dataset.type === "death") {
    localStorage.removeItem("cultivationGameSave");
    location.reload();
  }
}

// --- Expose to Window ---
window.toggleCultivation = toggleCultivation;
window.breakthrough = breakthrough;
window.toggleInventory = toggleInventory;
window.toggleBattle = toggleBattle;
window.selectRegion = selectRegion;
window.rerollLife = rerollLife;
window.closeNoticeModal = closeNoticeModal;

// --- On Load ---
window.onload = () => {
  const saved = localStorage.getItem("cultivationGameSave");
  if (saved) {
    player = JSON.parse(saved);
    calculateStats();
    updateUI();
    startAging();
  } else {
    rerollLife();
  }

  setInterval(savePlayerData, 600000);
};
