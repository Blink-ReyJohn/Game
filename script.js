// CONFIG
const BASE_LIFESPAN = 85;
const BASE_QI_REQUIREMENT = 100;
const QI_SCALE = 1.35;
const MAJOR_REALM_STAT_BOOST = 1.10;
const MINOR_REALM_STAT_BOOST = 1 + (MAJOR_REALM_STAT_BOOST - 1) * 0.7;
const LIFE_GAINS = [5,8,12,18,25,35,50,70,100,150];

const chineseNames = [ "Li Wei","Zhang Min","Wang Fang","Liu Yang","Chen Jie","Yang Li","Zhao Hui","Wu Qiang","Sun Mei","Zhou Lei",
  "Xu Lin","Hu Jing","Guo Feng","He Yan","Gao Jun","Lin Tao","Ma Rui","Zheng Hao","Cai Ying","Deng Fei",
  "Peng Bo","Lu Na","Tang Wei","Yin Yue","Xie Ming","Pan Li","Du Juan","Ren Xiang","Jiang Ping","Yao Chen" ];

const physiquePool = [
  { name:"Ordinary Vessel", weight:30, stats:{health:0.9, strength:0.9, qi:0.9, speed:0.9} },
  { name:"Frail Heart", weight:30, stats:{health:0.8, strength:0.8, qi:1.0, speed:1.0} },
  { name:"Stable Core", weight:10, stats:{health:1.0, strength:1.0, qi:1.0, speed:1.0} },
  { name:"Quick Meridian", weight:10, stats:{health:0.9, strength:0.9, qi:1.1, speed:1.2} },
  { name:"Iron Muscle", weight:10, stats:{health:1.2, strength:1.2, qi:0.9, speed:0.9} },
  { name:"Flowing River", weight:5, stats:{health:1.0, strength:1.0, qi:1.2, speed:1.1} },
  { name:"Earthroot Body", weight:5, stats:{health:1.3, strength:1.1, qi:0.8, speed:0.8} },
  { name:"Thunder Vessel", weight:7, stats:{health:1.0, strength:1.3, qi:1.2, speed:1.1} },
  { name:"Frost Jade", weight:7, stats:{health:1.1, strength:0.9, qi:1.4, speed:1.0} },
  { name:"Crimson Flame", weight:6, stats:{health:1.2, strength:1.2, qi:1.1, speed:1.1} },
  { name:"Celestial Spirit", weight:2, stats:{health:1.3, strength:1.4, qi:1.5, speed:1.2} },
  { name:"Voidwalker", weight:2, stats:{health:1.1, strength:1.1, qi:1.6, speed:1.5} },
  { name:"Starlit Vessel", weight:1, stats:{health:1.4, strength:1.3, qi:1.3, speed:1.3} },
  { name:"Heavenly Dao Body", weight:0.5, stats:{health:1.6, strength:1.6, qi:1.7, speed:1.6} },
  { name:"Primordial Chaos", weight:0.5, stats:{health:1.7, strength:1.7, qi:1.9, speed:1.7} }
];

const majorNames = [ "Qi Gathering","Foundation Building","Core Formation","Golden Core","Soul Formation","Nascent Soul","Nihility","Ascension","Half Immortal","Earth Immortal" ];
const subRealms = [];
let qiReq = BASE_QI_REQUIREMENT;
for (let m = 0; m < majorNames.length; m++) {
  for (let lvl = 1; lvl <= 10; lvl++) {
    subRealms.push({ name: `${majorNames[m]} ${lvl}`, qiRequired: Math.round(qiReq) });
    qiReq *= QI_SCALE;
  }
}

// PLAYER
let player = {
  name: "", age: 13, talent: 0, physique: null,
  stats: { health: 0, strength: 0, qi: 0, speed: 0 },
  subRealmIndex: 0, qi: 0,
  qiRequired: subRealms[0].qiRequired,
  lifespan: BASE_LIFESPAN,
  statMultiplier: 1, cultivating: false
};

let cultivationInterval = null;

// INIT
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

function getRandomPhysique() {
  const total = physiquePool.reduce((sum, p) => sum + p.weight, 0);
  let pick = Math.random() * total;
  for (const p of physiquePool) {
    if (pick < p.weight) return p;
    pick -= p.weight;
  }
  return physiquePool[0];
}

function calculateStats() {
  const base = player.talent;
  const mod = player.physique.stats;
  player.stats.health = Math.round(base * mod.health * player.statMultiplier);
  player.stats.strength = Math.round(base * mod.strength * player.statMultiplier);
  player.stats.qi = Math.round(base * mod.qi * player.statMultiplier);
  player.stats.speed = Math.round(base * mod.speed * player.statMultiplier);
}

function showInitModal() {
  document.getElementById("modal-name").textContent = player.name;
  document.getElementById("modal-talent").textContent = player.talent;
  document.getElementById("modal-physique").textContent = player.physique.name;
  document.getElementById("init-modal").classList.remove("hidden");
}
document.getElementById("modal-confirm-btn").addEventListener("click", () => {
  document.getElementById("init-modal").classList.add("hidden");
});

// UI
function updateUI() {
  document.getElementById("player-name").textContent = player.name;
  document.getElementById("age").textContent = player.age;
  document.getElementById("talent").textContent = player.talent;
  document.getElementById("physique").textContent = player.physique.name;
  document.getElementById("health").textContent = player.stats.health;
  document.getElementById("strength").textContent = player.stats.strength;
  document.getElementById("qi").textContent = player.stats.qi;
  document.getElementById("speed").textContent = player.stats.speed;
  const realmObj = subRealms[player.subRealmIndex];
  document.getElementById("realm").textContent = realmObj.name;
  const pct = Math.min(100, (player.qi / player.qiRequired) * 100);
  document.getElementById("xp-bar").style.width = pct + "%";
  document.getElementById("xp-bar").title = `${player.qi} / ${player.qiRequired} Qi`;
  document.getElementById("lifespan").textContent = player.lifespan;
}

// CULTIVATE
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

// BREAKTHROUGH
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

// REGIONS
function selectRegion(name) {
  alert(`You travel to ${name}. (Event logic goes here!)`);
}

// INVENTORY
function toggleInventory() {
  const map = document.getElementById("center-content");
  const inv = document.getElementById("inventory-panel");
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
  grid.innerHTML = "";
  const items = [
    { name: "Qi Pill", desc: "Restores 50 Qi.", type: "consumable" },
    { name: "Spirit Sword", desc: "A basic spiritual weapon.", type: "item" },
    { name: "Beast Hide", desc: "Material for crafting.", type: "material" }
  ];
  items.forEach(item => {
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

// INIT
window.onload = initializePlayer;
