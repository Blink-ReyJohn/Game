// === Constants and Globals ===
const BASE_LIFESPAN = 85;
const BASE_QI_REQUIREMENT = 100;
const QI_SCALE = 1.35;
const MAJOR_REALM_STAT_BOOST = 1.10;
const MINOR_REALM_STAT_BOOST = 1 + (MAJOR_REALM_STAT_BOOST - 1) * 0.7;
let rerollPreview = null;
let activeCategory = null;
let cultivationInterval = null;
let agingInterval = null;
let autoBreakEnabled = false;

const chineseNames = ["Li Wei", "Zhao Hui", "Chen Jie", "Zhou Lei", "Lin Tao"];
const physiquePool = [
  { name: "Ordinary Vessel", rarity: "Common", element: "None", weight: 30, stats: { health: 1, strength: 1, qi: 1, speed: 1 }},
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

const majorNames = ["Qi Gathering","Foundation Building","Core Formation","Golden Core","Soul Formation","Nascent Soul","Nihility","Ascension","Half Immortal","Earth Immortal"];
const subRealms = [];
let qiReq = BASE_QI_REQUIREMENT;
for (let m = 0; m < majorNames.length; m++) {
  for (let lvl = 1; lvl <= 10; lvl++) {
    subRealms.push({ name: `${majorNames[m]} ${lvl}`, qiRequired: Math.round(qiReq) });
    qiReq *= QI_SCALE;
  }
}

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

// === Core Functions ===
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
  document.getElementById("physique").textContent = player.physique?.name || "None";
  document.getElementById("health").textContent = player.stats.health;
  document.getElementById("strength").textContent = player.stats.strength;
  document.getElementById("qi").textContent = player.stats.qi;
  document.getElementById("speed").textContent = player.stats.speed;
  document.getElementById("lifespan").textContent = player.lifespan;
  document.getElementById("gold").textContent = player.gold;
  document.getElementById("spirit-stones").textContent = player.spiritStones;
  const pct = Math.min(100, (player.qi / player.qiRequired) * 100);
  document.getElementById("xp-bar").style.width = pct + "%";
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
  nameEl.textContent = `${book.name} (Lv ${book.proficiencyLevel})`;
  detailEl.textContent = `+${((book.baseQiBoost || 0) + (book.proficiencyLevel * book.qiPerLevel)) * 100}% Qi`;
  const required = 100 + (book.proficiencyLevel - 1) * 150;
  const progress = Math.min(100, (book.proficiencyProgress / required) * 100);
  bar.style.width = `${progress}%`;
}

// === Game Logic ===
function toggleCultivation() {
  const btn = document.getElementById("cultivate-btn");
  if (!player.cultivating) {
    player.cultivating = true;
    btn.textContent = "Stop Cultivating";
    cultivationInterval = setInterval(() => {
      let qiGain = player.stats.qi;
      const book = player.equippedBook;
      if (book && player.physique.element === book.element) {
        const qiBoost = book.baseQiBoost + (book.proficiencyLevel * book.qiPerLevel);
        qiGain *= (1 + qiBoost);
        book.proficiencyProgress += 0.05;
        const required = 100 + (book.proficiencyLevel - 1) * 150;
        if (book.proficiencyProgress >= required) {
          book.proficiencyProgress = 0;
          book.proficiencyLevel += 1;
        }
      }
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
function breakthrough() {
  if (player.qi < player.qiRequired) {
    const modal = document.getElementById("notice-modal");
    modal.querySelector(".modal-message").textContent = `Need ${player.qiRequired} Qi, but only have ${player.qi}.`;
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
    player.statMultiplier *= (newMajor > prevMajor) ? MAJOR_REALM_STAT_BOOST : MINOR_REALM_STAT_BOOST;
    player.lifespan += (newMajor > prevMajor ? 8 : 3) * (tier + 1);
    calculateStats();
    updateUI();
    savePlayerData();
  }
}
function rerollLife() {
  const name = chineseNames[Math.floor(Math.random() * chineseNames.length)];
  const talent = Math.floor(Math.random() * 100) + 1;
  const physique = getRandomPhysique();
  document.getElementById("modal-name").textContent = name;
  document.getElementById("modal-talent").textContent = talent;
  document.getElementById("modal-physique").textContent = physique.name;
  rerollPreview = { name, talent, physique };
  document.getElementById("init-modal").classList.remove("hidden");
}
function closeNoticeModal() {
  const modal = document.getElementById("notice-modal");
  modal.classList.add("hidden");
  modal.dataset.type = "";
}

// === Inventory Logic with Use Button ===
function showItemInfo(item) {
  document.getElementById("item-name").textContent = item.name;
  document.getElementById("item-description").textContent =
    `Type: ${item.type} | Element: ${item.element || "None"} | Rarity: ${item.rarity}`;
  const equipBtn = document.getElementById("equip-button");
  const useBtn = document.getElementById("use-button");
  const canEquip = item.type === "book" && item.element === player.physique?.element;
  equipBtn.style.display = canEquip ? "inline-block" : "none";
  equipBtn.onclick = () => {
    player.equippedBook = item;
    updateEquippedBookUI();
    savePlayerData();
    updateUI();
  };
  useBtn.onclick = () => {
    const qty = parseInt(document.getElementById("item-count").value, 10) || 1;
    let used = 0;
    for (let i = player.inventory.length - 1; i >= 0 && used < qty; i--) {
      const it = player.inventory[i];
      if (it.name === item.name && it.rarity === item.rarity && it.type === item.type) {
        player.inventory.splice(i, 1);
        used++;
      }
    }
    savePlayerData();
    updateUI();
    filterInventory(activeCategory);
  };
}

// === Boot ===
window.onload = () => {
  const saved = localStorage.getItem("cultivationGameSave");
  if (saved) player = JSON.parse(saved);
  if (!player.name || !player.physique) {
    player.name = chineseNames[Math.floor(Math.random() * chineseNames.length)];
    player.talent = Math.floor(Math.random() * 100) + 1;
    player.physique = getRandomPhysique();
  }
  calculateStats();
  updateUI();
  startAging();
  savePlayerData();

  document.getElementById("modal-confirm-btn").addEventListener("click", () => {
    if (!rerollPreview) return;
    Object.assign(player, {
      ...player,
      name: rerollPreview.name,
      talent: rerollPreview.talent,
      physique: rerollPreview.physique,
      age: 13,
      subRealmIndex: 0,
      qi: 0,
      qiRequired: BASE_QI_REQUIREMENT,
      lifespan: BASE_LIFESPAN,
      statMultiplier: 1,
      gold: 0,
      spiritStones: 0,
      inventory: [],
      cultivating: false
    });
    calculateStats();
    updateUI();
    savePlayerData();
    startAging();
    document.getElementById("init-modal").classList.add("hidden");
    const modal = document.getElementById("notice-modal");
    modal.querySelector(".modal-message").textContent = `🌅 Reborn as ${player.name} with ${player.talent} talent and physique "${player.physique.name}".`;
    modal.classList.remove("hidden");
  });
};
