// script.js

// ── Configuration Constants ──
const BASE_LIFESPAN           = 85;      // starting human lifespan
const BASE_QI_REQUIREMENT     = 100;     // Qi needed for the very first sub-realm
const QI_SCALE                = 1.35;    // per-sub-realm Qi scaling factor
const MAJOR_REALM_STAT_BOOST  = 1.10;    // +10% stat boost at major realm
const MINOR_REALM_STAT_BOOST  = 1 + (MAJOR_REALM_STAT_BOOST - 1) * 0.7; // ~1.07 = 70% of major boost
const LIFE_GAINS              = [5,8,12,18,25,35,50,70,100,150]; // lifespan gain per major realm

// ── Name & Physique Pools ──
const chineseNames = [
  "Li Wei","Zhang Min","Wang Fang","Liu Yang","Chen Jie","Yang Li","Zhao Hui","Wu Qiang","Sun Mei","Zhou Lei",
  "Xu Lin","Hu Jing","Guo Feng","He Yan","Gao Jun","Lin Tao","Ma Rui","Zheng Hao","Cai Ying","Deng Fei",
  "Peng Bo","Lu Na","Tang Wei","Yin Yue","Xie Ming","Pan Li","Du Juan","Ren Xiang","Jiang Ping","Yao Chen"
];

const physiquePool = [
  { name:"Ordinary Vessel",   rarity:"Gray",  weight:30, stats:{health:0.9, strength:0.9, qi:0.9, speed:0.9} },
  { name:"Frail Heart",        rarity:"Gray",  weight:30, stats:{health:0.8, strength:0.8, qi:1.0, speed:1.0} },
  { name:"Stable Core",        rarity:"Green", weight:10, stats:{health:1.0, strength:1.0, qi:1.0, speed:1.0} },
  { name:"Quick Meridian",     rarity:"Green", weight:10, stats:{health:0.9, strength:0.9, qi:1.1, speed:1.2} },
  { name:"Iron Muscle",        rarity:"Green", weight:10, stats:{health:1.2, strength:1.2, qi:0.9, speed:0.9} },
  { name:"Flowing River",      rarity:"Green", weight:5,  stats:{health:1.0, strength:1.0, qi:1.2, speed:1.1} },
  { name:"Earthroot Body",     rarity:"Green", weight:5,  stats:{health:1.3, strength:1.1, qi:0.8, speed:0.8} },
  { name:"Thunder Vessel",     rarity:"Blue",  weight:7,  stats:{health:1.0, strength:1.3, qi:1.2, speed:1.1} },
  { name:"Frost Jade",         rarity:"Blue",  weight:7,  stats:{health:1.1, strength:0.9, qi:1.4, speed:1.0} },
  { name:"Crimson Flame",      rarity:"Blue",  weight:6,  stats:{health:1.2, strength:1.2, qi:1.1, speed:1.1} },
  { name:"Celestial Spirit",   rarity:"Purple",weight:2,  stats:{health:1.3, strength:1.4, qi:1.5, speed:1.2} },
  { name:"Voidwalker",         rarity:"Purple",weight:2,  stats:{health:1.1, strength:1.1, qi:1.6, speed:1.5} },
  { name:"Starlit Vessel",     rarity:"Purple",weight:1,  stats:{health:1.4, strength:1.3, qi:1.3, speed:1.3} },
  { name:"Heavenly Dao Body",  rarity:"Gold",  weight:0.5,stats:{health:1.6, strength:1.6, qi:1.7, speed:1.6} },
  { name:"Primordial Chaos",   rarity:"Gold",  weight:0.5,stats:{health:1.7, strength:1.7, qi:1.9, speed:1.7} }
];

// ── Build the 100 Sub-Realms Array ──
const majorNames = [
  "Qi Gathering", "Foundation Building", "Core Formation",
  "Golden Core", "Soul Formation", "Nascent Soul",
  "Nihility", "Ascension", "Half Immortal", "Earth Immortal"
];

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

// ── Player State ──
let player = {
  name: "",
  age: 13,
  talent: 0,
  physique: null,
  stats: { health: 0, strength: 0, qi: 0, speed: 0 },
  subRealmIndex: 0,
  qi: 0,
  qiRequired: subRealms[0].qiRequired,
  lifespan: BASE_LIFESPAN,
  statMultiplier: 1,
  cultivating: false
};

let cultivationInterval = null;

// ── Initialization ──
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

// ── Stat Calculation ──
function calculateStats() {
  const baseHealth = player.talent * player.physique.stats.health;
  const baseStrength = player.talent * player.physique.stats.strength;
  const baseQi = player.talent * player.physique.stats.qi;
  const baseSpeed = player.talent * player.physique.stats.speed;
  player.stats.health = Math.round(baseHealth \* player.statMultiplier);
  player.stats.strength = Math.round(baseStrength \* player.statMultiplier);
  player.stats.qi = Math.round(baseQi \* player.statMultiplier);
  player.stats.speed = Math.round(baseSpeed \* player.statMultiplier);
}

// ── UI Update ──
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
  const pct = Math.min(100, (player.qi / player.qiRequired) \* 100);
  const xpBar = document.getElementById("xp-bar");
  xpBar.style.width = pct + "%";
  xpBar.title = `${player.qi} / ${player.qiRequired} Qi`;
  document.getElementById("lifespan").textContent = player.lifespan;
}

// ── Show Initialization Modal ──
function showInitModal() {
  document.getElementById("modal-name").textContent = player.name;
  document.getElementById("modal-talent").textContent = player.talent;
  document.getElementById("modal-physique").textContent = player.physique.name;
}

// ── Confirm Initialization ──
document
  .getElementById("modal-confirm-btn")
  .addEventListener("click", () => {
    document.getElementById("init-modal").classList.add("hidden");
  });

// ── Cultivation Toggle ──
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

// ── Breakthrough Progression ──
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
      // Major realm boost
      player.statMultiplier *= MAJOR_REALM_STAT_BOOST;
      player.lifespan += LIFE_GAINS[newMajor];
    } else {
      // Minor realm boost
      player.statMultiplier *= MINOR_REALM_STAT_BOOST;
      player.lifespan += LIFE_GAINS[newMajor] * 0.5;
    }
  } else {
    return alert("You’re already at Earth Immortal X!");
  }
  calculateStats();
  updateUI();
}

// ── Region Selection Stub ──
function selectRegion(name) {
  alert(`You travel to ${name}. (Event logic goes here!)`);
}

// ── On Page Load ──
window.onload = initializePlayer;
