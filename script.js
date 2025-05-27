// cultivation-game script.js

// --- Constants ---
const BASE_LIFESPAN = 85;
const BASE_QI_REQUIREMENT = 100;
const QI_SCALE = 1.35;
const MAJOR_REALM_STAT_BOOST = 1.10;
const MINOR_REALM_STAT_BOOST = 1 + (MAJOR_REALM_STAT_BOOST - 1) * 0.7;

let rerollPreview = null;
let activeCategory = null;

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

const majorNames = ["Qi Gathering", "Foundation Building", "Core Formation", "Golden Core", "Soul Formation", "Nascent Soul", "Nihility", "Ascension", "Half Immortal", "Earth Immortal"];
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

let cultivationInterval = null;
let agingInterval = null;
let autoBreakEnabled = false;

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

function closeNoticeModal() {
  const modal = document.getElementById("notice-modal");
  modal.classList.add("hidden");
  modal.dataset.type = "";
}

function breakthrough() {
  if (player.qi < player.qiRequired) {
    const modal = document.getElementById("notice-modal");
    modal.querySelector(".modal-message").textContent = `Need ${player.qiRequired} Qi, but you have ${player.qi}.`;
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

    if (newMajor > prevMajor) {
      player.statMultiplier *= MAJOR_REALM_STAT_BOOST;
      player.lifespan += 8 * (tier + 1);
    } else {
      player.statMultiplier *= MINOR_REALM_STAT_BOOST;
      player.lifespan += 3 * (tier + 1);
    }

    calculateStats();
    updateUI();
    savePlayerData();
  }
}

function filterInventory(type) {
  const grid = document.getElementById("inventory-grid");
  const wrapper = document.getElementById("inventory-scroll-wrapper");
  const tabs = document.getElementById("inventory-tabs").children;

  if (activeCategory === type) {
    grid.innerHTML = "";
    wrapper.classList.add("hidden");
    for (const tab of tabs) tab.style.display = "inline-block";
    activeCategory = null;
    return;
  }

  for (const tab of tabs) {
    tab.style.display = tab.id.includes(type) ? "inline-block" : "none";
  }

  activeCategory = type;
  wrapper.classList.remove("hidden");
  grid.innerHTML = "";

  const headerMap = {
    equipment: "Equipment",
    book: "Book",
    consumable: "Consumable"
  };

  const sorted = [...player.inventory].sort((a, b) => {
    const rarityOrder = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythical"];
    const rarityA = rarityOrder.indexOf(a.rarity || "Common");
    const rarityB = rarityOrder.indexOf(b.rarity || "Common");
    if (rarityA !== rarityB) return rarityB - rarityA;
    return (a.name || "").localeCompare(b.name || "");
  });

  const group = type === "all" ? ["equipment", "book", "consumable"] : [type];

  group.forEach(t => {
    const header = document.createElement("h3");
    header.textContent = headerMap[t];
    grid.appendChild(header);
    renderItems(sorted.filter(i => i.type === t), grid);
  });
}

function renderItems(items, container) {
  const grouped = {};
  for (const item of items) {
    const key = `${item.name}-${item.rarity}`;
    if (!grouped[key]) grouped[key] = { ...item, quantity: 1 };
    else grouped[key].quantity++;
  }
  for (const key in grouped) {
    const item = grouped[key];
    const cell = document.createElement("div");
    cell.className = "inventory-item";
    if (item.rarity) cell.classList.add(item.rarity.toLowerCase());
    cell.innerHTML = `
      <div class="item-info">
        <span class="item-name">${item.name}</span>
        ${item.quantity > 1 ? `<span class="item-qty">x${item.quantity}</span>` : ""}
      </div>
    `;
    cell.title = `${item.name}\nRarity: ${item.rarity}\nElement: ${item.element || "None"}${item.proficiencyLevel ? `\nLevel: ${item.proficiencyLevel}` : ""}`;
    cell.onclick = () => showItemInfo(item);
    container.appendChild(cell);
  }
}

window.onload = () => {
  loadPlayerData();
  startAging();

  document.getElementById("modal-confirm-btn").addEventListener("click", () => {
    if (!rerollPreview) return;
    const { name, talent, physique } = rerollPreview;
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
    player.cultivating = false;
    calculateStats();
    updateUI();
    savePlayerData();
    startAging();
    rerollPreview = null;
    document.getElementById("init-modal").classList.add("hidden");
    const modal = document.getElementById("notice-modal");
    modal.querySelector(".modal-message").textContent = `🌅 Reborn as ${player.name} with ${player.talent} talent and the physique \"${player.physique.name}\".`;
    modal.classList.remove("hidden");
  });
};
