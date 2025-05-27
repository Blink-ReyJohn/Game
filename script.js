// --- Base Constants ---
const BASE_LIFESPAN = 85;
const BASE_QI_REQUIREMENT = 100;
const QI_SCALE = 1.35;
const MAJOR_REALM_STAT_BOOST = 1.10;
const MINOR_REALM_STAT_BOOST = 1 + (MAJOR_REALM_STAT_BOOST - 1) * 0.7;
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
    subRealms.push({
      name: `${majorNames[m]} ${lvl}`,
      qiRequired: Math.round(qiReq)
    });
    qiReq *= QI_SCALE;
  }
}

// --- Player ---
let player = {
  name: "", age: 13, talent: 0, physique: null,
  stats: { health: 0, strength: 0, qi: 0, speed: 0 },
  subRealmIndex: 0, qi: 0,
  qiRequired: BASE_QI_REQUIREMENT,
  lifespan: BASE_LIFESPAN,
  equippedBook: null,
  statMultiplier: 1, cultivating: false,
  gold: 0, spiritStones: 0, inventory: []
};
let cultivationInterval = null;
let agingInterval = null;
let autoBreakEnabled = false;

// --- Utility Functions ---
function savePlayerData() {
  try {
    localStorage.setItem("cultivationGameSave", JSON.stringify(player));
  } catch (e) {
    console.warn("Save failed", e);
  }
}

function getRandomPhysique() {
  const totalWeight = physiquePool.reduce((sum, p) => sum + p.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const p of physiquePool) {
    if (rand < p.weight) return p;
    rand -= p.weight;
  }
}

function getTalentByPhysique(rarity) {
  switch (rarity) {
    case "Common": return getRandomInRange(10, 40);
    case "Uncommon": return getRandomInRange(30, 60);
    case "Rare": return getRandomInRange(50, 80);
    case "Epic": return getRandomInRange(70, 90);
    case "Legendary": return getRandomInRange(85, 95);
    case "Mythical": return getRandomInRange(95, 100);
    default: return getRandomInRange(10, 50);
  }
}

function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

  const realm = subRealms[player.subRealmIndex];
  document.getElementById("realm").textContent = realm.name;

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
  const xpBar = document.getElementById("xp-bar");
  xpBar.style.width = pct + "%";
  xpBar.title = `${player.qi} / ${player.qiRequired} Qi`;
  document.getElementById("xp-text").textContent = `${player.qi} / ${player.qiRequired}`;

  updateEquippedBookUI();
}

function startAging() {
  if (agingInterval) clearInterval(agingInterval);
  agingInterval = setInterval(() => {
    player.age++;
    if (player.age > player.lifespan) {
      showGameOver();
      return;
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
  modal.classList.remove("hidden");
  modal.dataset.type = "death";
  document.getElementById("cultivate-btn").disabled = true;
}

function closeNoticeModal() {
  const modal = document.getElementById("notice-modal");
  modal.classList.add("hidden");
  if (modal.dataset.type === "death") {
    localStorage.removeItem("cultivationGameSave");
    location.reload();
  }
}

// --- Rebirth Flow ---
function rerollLife() {
  document.getElementById("reroll-modal").classList.remove("hidden");
}

function confirmReroll(confirm) {
  document.getElementById("reroll-modal").classList.add("hidden");
  if (!confirm) return;

  const name = chineseNames[Math.floor(Math.random() * chineseNames.length)];
  const physique = getRandomPhysique();
  const talent = getTalentByPhysique(physique.rarity);

  player.name = name;
  player.talent = talent;
  player.physique = physique;
  player.age = 13;
  player.subRealmIndex = 0;
  player.qi = 0;
  player.qiRequired = BASE_QI_REQUIREMENT;
  player.lifespan = BASE_LIFESPAN;
  player.statMultiplier = 1;
  player.gold = 0;
  player.spiritStones = 0;
  player.inventory = [];
  player.equippedBook = null;
  player.cultivating = false;

  calculateStats();
  updateUI();
  savePlayerData();
  startAging();

  const modal = document.getElementById("notice-modal");
  modal.querySelector(".modal-message").textContent =
    `You were reborn as ${name} with ${talent} talent and the physique "${physique.name}".`;
  modal.classList.remove("hidden");
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
  try {
    nameEl.textContent = `${book.name} (Lv ${book.proficiencyLevel})`;
    detailEl.textContent = `+${((book.baseQiBoost || 0) + (book.proficiencyLevel * (book.qiPerLevel || 0))) * 100}% Qi | +${((book.baseDmgBoost || 0) + (book.proficiencyLevel * (book.dmgPerLevel || 0))) * 100}% DMG`;
    const required = 100 + (book.proficiencyLevel - 1) * 150;
    const progress = Math.min(100, (book.proficiencyProgress / required) * 100);
    bar.style.width = `${progress}%`;
  } catch (err) {
    console.error("Error rendering book UI:", err);
  }
}


// --- Boot ---
window.onload = () => {
  const saved = localStorage.getItem("cultivationGameSave");
  if (saved) {
    player = JSON.parse(saved);
    player.inventory = player.inventory || [];
    player.qiRequired = subRealms[player.subRealmIndex]?.qiRequired || BASE_QI_REQUIREMENT;

    const major = Math.floor(player.subRealmIndex / 10);
    const minor = player.subRealmIndex % 10;
    player.statMultiplier = 1;
    player.lifespan = BASE_LIFESPAN;
    for (let i = 0; i < major; i++) {
      player.statMultiplier *= MAJOR_REALM_STAT_BOOST;
      player.lifespan += 8 * (i + 1);
    }
    for (let i = 0; i < minor; i++) {
      player.statMultiplier *= MINOR_REALM_STAT_BOOST;
      player.lifespan += 3 * (major + 1);
    }

    calculateStats();
    updateEquippedBookUI();
    updateUI();
    startAging();
  } else {
    rerollLife(); // force character creation on first load
  }

  setInterval(savePlayerData, 600000); // every 10 min
};
