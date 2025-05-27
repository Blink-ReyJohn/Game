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
const majorNames = ["Qi Gathering","Foundation Building","Core Formation","Golden Core","Soul Formation","Nascent Soul","Nihility","Ascension","Half Immortal","Earth Immortal"];
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
  name: "",
  age: 13,
  talent: 0,
  physique: null,
  stats: { health: 0, strength: 0, qi: 0, speed: 0 },
  subRealmIndex: 0,
  qi: 0,
  qiRequired: BASE_QI_REQUIREMENT,
  lifespan: BASE_LIFESPAN,
  equippedBook: null,
  statMultiplier: 1,
  cultivating: false,
  gold: 0,
  spiritStones: 0,
  inventory: []
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

function calculateStats() {
  const base = player.talent;
  const mod = player.physique?.stats || { health: 1, strength: 1, qi: 1, speed: 1 };
  player.stats.health   = Math.round(base * mod.health   * player.statMultiplier);
  player.stats.strength = Math.round(base * mod.strength * player.statMultiplier);
  player.stats.qi       = Math.round(base * mod.qi       * player.statMultiplier);
  player.stats.speed    = Math.round(base * mod.speed    * player.statMultiplier);
}

function updateUI() {
  document.getElementById("player-name").textContent = player.name || "Unnamed";
  document.getElementById("age").textContent = player.age;

  const talentEl = document.getElementById("talent");
  talentEl.textContent = player.talent;
  talentEl.className = "tooltip";
  talentEl.setAttribute("data-tooltip", "Affects all base stats");

  const realm = subRealms[player.subRealmIndex];
  const realmEl = document.getElementById("realm");
  realmEl.textContent = realm.name;
  realmEl.className = "tooltip";
  realmEl.setAttribute("data-tooltip", `Qi Required: ${realm.qiRequired}`);

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

  const xpBar = document.getElementById("xp-bar");
  const pct = Math.min(100, (player.qi / player.qiRequired) * 100);
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
  modal.dataset.type = "death";
  modal.classList.remove("hidden");
  document.getElementById("cultivate-btn").disabled = true;
}

// --- Modal Control ---
function closeNoticeModal() {
  const modal = document.getElementById("notice-modal");
  modal.classList.add("hidden");
  if (modal.dataset.type === "death") {
    localStorage.removeItem("cultivationGameSave");
    location.reload();
  } else {
    modal.dataset.type = "";
  }
}

// --- Book & Drops Helpers ---
function getRandomRarity() {
  const roll = Math.random() * 100;
  if (roll <= 1)      return "Legendary";
  else if (roll <= 30) return "Rare";
  else                 return "Common";
}

function getRandomBookByRarity(rarity) {
  const filtered = cultivationBookPool.filter(b => b.rarity === rarity);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function handleBookDrop() {
  if (typeof cultivationBookPool === "undefined") {
    console.warn("⛔ cultivationBookPool not loaded. Check script source.");
    return;
  }
  const rarity = getRandomRarity();
  const book = getRandomBookByRarity(rarity);
  if (!book) return;

  player.inventory.push({ ...book, type: "book" });
  const log = document.getElementById("battle-log");
  const dropMsg = document.createElement("p");
  dropMsg.classList.add("battle-drop");
  dropMsg.textContent = `📖 Dropped: ${book.name} (${book.rarity})`;
  log.appendChild(dropMsg);
  log.scrollTop = log.scrollHeight;
}

// --- Game Logic ---
function toggleCultivation() {
  const btn = document.getElementById("cultivate-btn");
  if (!player.cultivating) {
    player.cultivating = true;
    btn.textContent = "Stop Cultivating";
    cultivationInterval = setInterval(() => {
      let qiGain = player.stats.qi;
      if (player.equippedBook && player.physique.element === player.equippedBook.element) {
        const book = player.equippedBook;
        const qiBoost = book.baseQiBoost + (book.proficiencyLevel * book.qiPerLevel);
        qiGain *= (1 + qiBoost);

        book.proficiencyProgress += 0.05;
        const required = 100 + (book.proficiencyLevel - 1) * 150;
        if (book.proficiencyProgress >= required) {
          book.proficiencyProgress = 0;
          book.proficiencyLevel++;
        }
      }
      player.qi = Math.min(player.qiRequired, player.qi + qiGain);
      updateUI();
      savePlayerData();
      if (autoBreakEnabled && player.qi >= player.qiRequired) {
        breakthrough();
      }
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

// --- Breakthrough (FIXED) ---
function breakthrough() {
  if (player.qi < player.qiRequired) {
    const modal = document.getElementById("notice-modal");
    modal.querySelector(".modal-message").textContent =
      `Need ${player.qiRequired} Qi, but you have ${player.qi}.`;
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
    const tier    = newMajor;
    if (newMajor > prevMajor) {
      player.statMultiplier *= MAJOR_REALM_STAT_BOOST;
      player.lifespan      += 8 * (tier + 1);
    } else {
      player.statMultiplier *= MINOR_REALM_STAT BOOST;
      player.lifespan      += 3 * (tier + 1);
    }
    calculateStats();
    updateUI();
    savePlayerData();
  }
}

// --- Reroll Life (FIXED) ---
function rerollLife() {
  const previewName      = chineseNames[Math.floor(Math.random() * chineseNames.length)];
  const previewTalent    = Math.floor(Math.random() * 100) + 1;
  const previewPhysique  = getRandomPhysique();

  document.getElementById("modal-name").textContent      = previewName;
  document.getElementById("modal-talent").textContent    = previewTalent;
  document.getElementById("modal-physique").textContent  = previewPhysique.name;

  rerollPreview = { name: previewName, talent: previewTalent, physique: previewPhysique };
  document.getElementById("init-modal").classList.remove("hidden");
}

// --- Reroll Confirm ---
document.getElementById("modal-confirm-btn").addEventListener("click", () => {
  if (!rerollPreview) return;

  const { name, talent, physique } = rerollPreview;
  player.name          = name;
  player.talent        = talent;
  player.physique      = physique;
  player.age           = 13;
  player.subRealmIndex = 0;
  player.qi            = 0;
  player.qiRequired    = BASE_QI_REQUIREMENT;
  player.lifespan      = BASE_LIFESPAN;
  player.statMultiplier= 1;
  player.gold          = 0;
  player.spiritStones  = 0;
  player.inventory     = [];
  player.cultivating   = false;

  calculateStats();
  updateUI();
  savePlayerData();
  startAging();

  rerollPreview = null;
  document.getElementById("init-modal").classList.add("hidden");

  const modal = document.getElementById("notice-modal");
  modal.querySelector(".modal-message").textContent =
    `Reborn as ${player.name} with ${player.talent} talent and the physique "${player.physique.name}".`;
  modal.classList.remove("hidden");
});

// --- UI Control ---
function hideAllPanels() {
  document.getElementById("center-content")?.classList.add("hidden");
  document.getElementById("inventory-panel")?.classList.add("hidden");
  document.getElementById("battle-panel")?.classList.add("hidden");
}

function toggleInventory() {
  const panel = document.getElementById("inventory-panel");
  const isHidden = panel.classList.contains("hidden");
  hideAllPanels();
  if (isHidden) {
    panel.classList.remove("hidden");
    loadInventory();
  } else {
    document.getElementById("center-content").classList.remove("hidden");
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

  const headerMap = { equipment: "Equipment", book: "Book", consumable: "Consumable" };
  const sorted = [...player.inventory].sort((a, b) => {
    const order = ["Common","Uncommon","Rare","Epic","Legendary","Mythical"];
    const ra = order.indexOf(a.rarity||"Common"), rb = order.indexOf(b.rarity||"Common");
    if (ra !== rb) return rb - ra;
    return (a.name||"").localeCompare(b.name||"");
  });

  const group = type==="all" ? ["equipment","book","consumable"] : [type];
  group.forEach(t => {
    const header = document.createElement("h3");
    header.textContent = headerMap[t];
    grid.appendChild(header);
    renderItems(sorted.filter(i => i.type===t), grid);
  });
}

function renderItems(items, container) {
  const grouped = {};
  for (const item of items) {
    const key = `${item.name}-${item.rarity}`;
    grouped[key] = grouped[key] ? { ...grouped[key], quantity: grouped[key].quantity+1 } : { ...item, quantity: 1 };
  }
  for (const key in grouped) {
    const item = grouped[key];
    const cell = document.createElement("div");
    cell.className = `inventory-item ${item.rarity?.toLowerCase()||""}`;
    cell.innerHTML = `
      <div class="item-info">
        <span class="item-name">${item.name}</span>
        ${item.quantity>1?`<span class="item-qty">x${item.quantity}</span>`:""}
      </div>
    `;
    cell.title = `${item.name}\nRarity: ${item.rarity}\nElement: ${item.element||"None"}${item.proficiencyLevel?`\nLevel: ${item.proficiencyLevel}`:""}`;
    cell.onclick = () => showItemInfo(item);
    container.appendChild(cell);
  }
}

function toggleBattle() {
  const panel = document.getElementById("battle-panel");
  const isHidden = panel.classList.contains("hidden");
  hideAllPanels();
  if (isHidden) panel.classList.remove("hidden");
  else document.getElementById("center-content").classList.remove("hidden");
}

function loadInventory() {
  const grid = document.getElementById("inventory-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const sorted = [...player.inventory].sort((a, b) => {
    const order = ["Common","Uncommon","Rare","Epic","Legendary","Mythical"];
    const ra = order.indexOf(a.rarity||"Common"), rb = order.indexOf(b.rarity||"Common");
    if (ra !== rb) return rb - ra;
    return (a.name||"").localeCompare(b.name||"");
  });

  ["equipment","book","consumable"].forEach(type => {
    const header = document.createElement("h3");
    header.textContent = type.charAt(0).toUpperCase()+type.slice(1);
    grid.appendChild(header);

    const itemsOfType = sorted.filter(i => i.type===type);
    const grouped = {};
    for (const item of itemsOfType) {
      const key = `${item.name}-${item.rarity}`;
      grouped[key] = grouped[key] ? { ...grouped[key], quantity: grouped[key].quantity+1 } : { ...item, quantity: 1 };
    }
    for (const key in grouped) {
      const item = grouped[key];
      const cell = document.createElement("div");
      cell.className = `inventory-item ${item.rarity?.toLowerCase()||""}`;
      cell.innerHTML = `
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          ${item.quantity>1?`<span class="item-qty">x${item.quantity}</span>`:""}
        </div>
      `;
      cell.title = `${item.name}\nRarity: ${item.rarity}\nElement: ${item.element||"None"}${item.proficiencyLevel?`\nLevel: ${item.proficiencyLevel}`:""}`;
      cell.onclick = () => showItemInfo(item);
      grid.appendChild(cell);
    }
  });
}

function showItemInfo(item) {
  document.getElementById("item-name").textContent = item.name;
  document.getElementById("item-description").textContent =
    `Type: ${item.type||"Unknown"} | Element: ${item.element||"None"} | Rarity: ${item.rarity}`;
  const equipBtn = document.getElementById("equip-button");
  const canEquip = item.type==="book" && item.element===player.physique?.element;
  equipBtn.style.display = canEquip? "inline-block":"none";
  equipBtn.onclick = () => {
    try {
      player.equippedBook = item;
      updateEquippedBookUI();
      savePlayerData();
      updateUI();
    } catch (e) {
      alert("Failed to equip item.");
      console.error(e);
    }
  };
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
    detailEl.textContent = `+${((book.baseQiBoost||0)+(book.proficiencyLevel*(book.qiPerLevel||0)))*100}% Qi | +${((book.baseDmgBoost||0)+(book.proficiencyLevel*(book.dmgPerLevel||0)))*100}% DMG`;
    const required = 100 + (book.proficiencyLevel-1)*150;
    const progress = Math.min(100, (book.proficiencyProgress/required)*100);
    bar.style.width = `${progress}%`;
  } catch (err) {
    console.error("Error rendering book UI:", err);
  }
}

// --- Data Load & Init ---
function loadPlayerData() {
  const saved = localStorage.getItem("cultivationGameSave");
  if (saved) {
    player = JSON.parse(saved);
    player.inventory = player.inventory||[];
    player.qiRequired = subRealms[player.subRealmIndex]?.qiRequired||BASE_QI_REQUIREMENT;

    const major = Math.floor(player.subRealmIndex/10);
    const minor = player.subRealmIndex%10;
    player.statMultiplier = 1;
    player.lifespan = BASE_LIFESPAN;
    for (let i=0;i<major;i++){
      player.statMultiplier*=MAJOR_REALM_STAT_BOOST;
      player.lifespan+=8*(i+1);
    }
    for (let i=0;i<minor;i++){
      player.statMultiplier*=MINOR_REALM_STAT_BOOST;
      player.lifespan+=3*(major+1);
    }
    calculateStats();
    updateEquippedBookUI();
  }
}

function initializePlayer() {
  player.name     = chineseNames[Math.floor(Math.random()*chineseNames.length)];
  player.talent   = Math.floor(Math.random()*100)+1;
  player.physique = getRandomPhysique();
  calculateStats();
  updateUI();
  savePlayerData();
}

// --- Boot ---
window.onload = () => {
  loadPlayerData();
  startAging();

  if (!player.name || !player.physique) {
    initializePlayer();
    document.getElementById("init-modal").classList.remove("hidden");
  } else {
    updateUI();
  }

  document.getElementById("modal-confirm-btn").addEventListener("click", () => {
    document.getElementById("init-modal").classList.add("hidden");
    savePlayerData();
  });

  setInterval(savePlayerData, 600000); // every 10 min
};
