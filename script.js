// script.js

// --- Chinese Name Pool ---
const chineseNames = [
  "Li Wei", "Zhang Min", "Wang Fang", "Liu Yang", "Chen Jie", "Yang Li", "Zhao Hui", "Wu Qiang", "Sun Mei", "Zhou Lei",
  "Xu Lin", "Hu Jing", "Guo Feng", "He Yan", "Gao Jun", "Lin Tao", "Ma Rui", "Zheng Hao", "Cai Ying", "Deng Fei",
  "Peng Bo", "Lu Na", "Tang Wei", "Yin Yue", "Xie Ming", "Pan Li", "Du Juan", "Ren Xiang", "Jiang Ping", "Yao Chen"
];

// --- Physique Pool ---
const physiquePool = [
  { name: "Ordinary Vessel", rarity: "Gray", weight: 30, stats: { health: 0.9, strength: 0.9, qi: 0.9, speed: 0.9 } },
  { name: "Frail Heart", rarity: "Gray", weight: 30, stats: { health: 0.8, strength: 0.8, qi: 1.0, speed: 1.0 } },
  { name: "Stable Core", rarity: "Green", weight: 10, stats: { health: 1.0, strength: 1.0, qi: 1.0, speed: 1.0 } },
  { name: "Quick Meridian", rarity: "Green", weight: 10, stats: { health: 0.9, strength: 0.9, qi: 1.1, speed: 1.2 } },
  { name: "Iron Muscle", rarity: "Green", weight: 10, stats: { health: 1.2, strength: 1.2, qi: 0.9, speed: 0.9 } },
  { name: "Flowing River", rarity: "Green", weight: 5, stats: { health: 1.0, strength: 1.0, qi: 1.2, speed: 1.1 } },
  { name: "Earthroot Body", rarity: "Green", weight: 5, stats: { health: 1.3, strength: 1.1, qi: 0.8, speed: 0.8 } },
  { name: "Thunder Vessel", rarity: "Blue", weight: 7, stats: { health: 1.0, strength: 1.3, qi: 1.2, speed: 1.1 } },
  { name: "Frost Jade", rarity: "Blue", weight: 7, stats: { health: 1.1, strength: 0.9, qi: 1.4, speed: 1.0 } },
  { name: "Crimson Flame", rarity: "Blue", weight: 6, stats: { health: 1.2, strength: 1.2, qi: 1.1, speed: 1.1 } },
  { name: "Celestial Spirit", rarity: "Purple", weight: 2, stats: { health: 1.3, strength: 1.4, qi: 1.5, speed: 1.2 } },
  { name: "Voidwalker", rarity: "Purple", weight: 2, stats: { health: 1.1, strength: 1.1, qi: 1.6, speed: 1.5 } },
  { name: "Starlit Vessel", rarity: "Purple", weight: 1, stats: { health: 1.4, strength: 1.3, qi: 1.3, speed: 1.3 } },
  { name: "Heavenly Dao Body", rarity: "Gold", weight: 0.5, stats: { health: 1.6, strength: 1.6, qi: 1.7, speed: 1.6 } },
  { name: "Primordial Chaos Vessel", rarity: "Gold", weight: 0.5, stats: { health: 1.7, strength: 1.7, qi: 1.9, speed: 1.7 } }
];

// --- Realm Definitions ---
const realms = [
  { name: "Qi Gathering", levels: 10, lifespan: 10 },
  { name: "Foundation Building", levels: 10, lifespan: 20 },
  { name: "Core Formation", levels: 10, lifespan: 30 },
  { name: "Golden Core", levels: 10, lifespan: 50 },
  { name: "Soul Formation", levels: 10, lifespan: 70 },
  { name: "Nascent Soul", levels: 10, lifespan: 100 },
  { name: "Nihility", levels: 10, lifespan: 150 },
  { name: "Ascension", levels: 10, lifespan: 200 },
  { name: "Half Immortal", levels: 10, lifespan: 300 },
  { name: "Earth Immortal", levels: 1, lifespan: 500 }
];

// --- Player Object ---
let player = {
  name: "",
  age: 13,
  talent: 0,
  physique: "",
  stats: { health: 0, strength: 0, qi: 0, speed: 0 },
  realmIndex: 0,
  realmLevel: 1,
  qi: 0,
  qiRequired: 100,
  cultivating: false,
  goldenCoreTier: 0,
  lifespan: 85
};

// --- Initialization ---
function initializePlayer() {
  // Randomize name
  player.name = chineseNames[Math.floor(Math.random() * chineseNames.length)];

  // Assign talent (1-100)
  player.talent = Math.floor(Math.random() * 100) + 1;

  // Assign physique
  player.physique = getRandomPhysique();

  // Calculate initial stats
  calculateStats();

  // Update UI
  updateUI();
}

// --- Weighted Random Physique Selection ---
function getRandomPhysique() {
  const totalWeight = physiquePool.reduce((sum, p) => sum + p.weight, 0);
  let rand = Math
::contentReference[oaicite:13]{index=13}
 
