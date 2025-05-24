// script.js (Full Version with Working Modal)

// CONFIG
const BASE_LIFESPAN = 85;
const BASE_QI_REQUIREMENT = 100;
const QI_SCALE = 1.35;
const MAJOR_REALM_STAT_BOOST = 1.10;
const MINOR_REALM_STAT_BOOST = 1 + (MAJOR_REALM_STAT_BOOST - 1) * 0.7;
const LIFE_GAINS = [5,8,12,18,25,35,50,70,100,150];

const chineseNames = ["Li Wei", "Zhao Hui", "Chen Jie", "Zhou Lei", "Lin Tao"];
const physiquePool = [
  { name: "Ordinary Vessel", stats: { health: 1, strength: 1, qi: 1, speed: 1 }, weight: 1 },
  { name: "Iron Muscle", stats: { health: 1.2, strength: 1.2, qi: 0.9, speed: 0.9 }, weight: 1 }
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
  statMultiplier: 1, cultivating: false
};

let cultivationInterval = null;

function getRandomPhysique() {
  return physiquePool[Math.floor(Math.random() * physiquePool.length)];
}

function calculateStats() {
  const base = player.talent;
  const mod = player.physique.stats;
  player.stats.health = Math.round(base * mod.health * player.statMultiplier);
  player.stats.strength = Math.round(base * mod.strength * player.statMultiplier);
  player.stats.qi = Math.round(base * mod.qi * player.statMultiplier);
  player.stats.speed = Math.round(base * mod.speed * player.statMultiplier);
}

function updateUI() {
  document.getElementById("player-name").textContent = player.name;
  document.getElementById("age").textContent = player.age;
  document.getElementById("talent").textContent = player.talent;
  document.getElementById("physique").textContent = player.physique.name;
  document.getElementById("health").textContent = player.stats.health;
  document.getElementById("strength").textContent = player.stats.strength;
  document.getElementById("qi").textContent = player.stats.qi;
  document.getElementById("speed").textContent = player.stats.speed;
  document.getElementById("realm").textContent = subRealms[player.subRealmIndex].name;
  const pct = Math.min(100, (player.qi / player.qiRequired) * 100);
  document.getElementById("xp-bar").style.width = pct + "%";
  document.getElementById("xp-bar").title = `${player.qi} / ${player.qiRequired} Qi`;
  document.getElementById("lifespan").textContent = player.lifespan;
}

function toggleCultivation() {
  const btn = document.getElementById("cultivate-btn");
  if (!player.cultivating) {
    player.cultivating = true;
    btn.textContent = "Stop Cultivating";
    cultivationInterval = setInterval(() => {
      player.qi = Math.min(player.qiRequired, player.qi + player.stats.qi);
      updateUI();
    }, 1000);
  } else {
    player.cultivating = false;
    btn.textContent = "Start Cultivating";
    clearInterval(cultivationInterval);
  }
}

function breakthrough() {
  if (player.qi < player.qiRequired) {
    return alert(`Need ${player.qiRequired} Qi, but have ${player.qi}.`);
  }
  player.qi = 0;
  const prevMajor = Math.floor(player.subRealmIndex / 10);
  if (player.subRealmIndex < subRealms.length - 1) {
    player.subRealmIndex++;
    player.qiRequired = subRealms[player.subRealmIndex].qiRequired;
    const newMajor = Math.floor(player.subRealmIndex / 10);
    if (newMajor > prevMajor) {
      player.statMultiplier *= MAJOR_REALM_STAT_BOOST;
      player.lifespan += LIFE_GAINS[newMajor];
    } else {
      player.statMultiplier *= MINOR_REALM_STAT_BOOST;
      player.lifespan += LIFE_GAINS[newMajor] * 0.5;
    }
  } else {
    return alert("You’re already at Earth Immortal X!");
  }
  calculateStats();
  updateUI();
}

function selectRegion(name) {
  alert(`You travel to ${name}. (Event logic goes here!)`);
}

function showInitModal() {
  document.getElementById("modal-name").textContent = player.name;
  document.getElementById("modal-talent").textContent = player.talent;
  document.getElementById("modal-physique").textContent = player.physique.name;
  document.getElementById("init-modal").classList.remove("hidden");
}

function initializePlayer() {
  player.name = chineseNames[Math.floor(Math.random() * chineseNames.length)];
  player.talent = Math.floor(Math.random() * 100) + 1;
  player.physique = getRandomPhysique();
  player.subRealmIndex = 0;
  player.qi = 0;
  player.qiRequired = subRealms[0].qiRequired;
  player.lifespan = BASE_LIFESPAN;
  player.statMultiplier = 1;
  calculateStats();
  showInitModal();
  updateUI();
}

function toggleInventory() {
  const map = document.getElementById("center-content");
  const inv = document.getElementById("inventory-panel");

  if (!map || !inv) return;

  if (inv.classList.contains("hidden")) {
    map.classList.add("hidden");
    inv.classList.remove("hidden");
    loadInventory();
  } else {
    map.classList.remove("hidden");
    inv.classList.add("hidden");
  }
}

function loadInventory() {
  const grid = document.getElementById("inventory-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const items = [
    { name: "Qi Pill", desc: "Restores 50 Qi.", type: "consumable" },
    { name: "Spirit Sword", desc: "A basic spiritual weapon.", type: "item" },
    { name: "Beast Hide", desc: "Material for crafting.", type: "material" }
  ];

  items.forEach((item) => {
    const cell = document.createElement("div");
    cell.textContent = item.name;
    cell.className = "inventory-item";
    cell.onclick = () => showItemInfo(item);
    grid.appendChild(cell);
  });
}

function showItemInfo(item) {
  document.getElementById("item-name").textContent = item.name;
  document.getElementById("item-description").textContent = item.desc;
  document.getElementById("use-button").style.display = item.type === "consumable" ? "inline-block" : "none";
  document.getElementById("equip-button").style.display = item.type === "item" ? "inline-block" : "none";
}

function savePlayerData() {
  const data = JSON.stringify(player);
  localStorage.setItem("cultivationGameSave", data);
}

function loadPlayerData() {
  const saved = localStorage.getItem("cultivationGameSave");
  if (saved) {
    player = JSON.parse(saved);
    calculateStats();
    updateUI();
  }
}

function resetGame() {
  const confirmReset = confirm("Are you sure you want to reset your character and start over?");
  if (confirmReset) {
    localStorage.removeItem("cultivationGameSave");
    location.reload();
  }
}


window.onload = () => {
  // Auto-save every 10 minutes
  setInterval(savePlayerData, 10 * 60 * 1000);
  loadPlayerData();

  if (!player.name) {
    initializePlayer();
    showInitModal();
  } else {
    updateUI();
  }

  document.getElementById("modal-confirm-btn").addEventListener("click", () => {
    document.getElementById("init-modal").classList.add("hidden");
    savePlayerData();
  });
};
