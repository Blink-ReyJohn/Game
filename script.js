// script.js

// --- Pools & Definitions ---
const chineseNames = [
  "Li Wei","Zhang Min","Wang Fang","Liu Yang","Chen Jie","Yang Li","Zhao Hui","Wu Qiang","Sun Mei","Zhou Lei",
  "Xu Lin","Hu Jing","Guo Feng","He Yan","Gao Jun","Lin Tao","Ma Rui","Zheng Hao","Cai Ying","Deng Fei",
  "Peng Bo","Lu Na","Tang Wei","Yin Yue","Xie Ming","Pan Li","Du Juan","Ren Xiang","Jiang Ping","Yao Chen"
];

const physiquePool = [
  { name:"Ordinary Vessel", rarity:"Gray", weight:30, stats:{health:0.9, strength:0.9, qi:0.9, speed:0.9} },
  { name:"Frail Heart", rarity:"Gray", weight:30, stats:{health:0.8, strength:0.8, qi:1.0, speed:1.0} },
  { name:"Stable Core", rarity:"Green", weight:10, stats:{health:1.0, strength:1.0, qi:1.0, speed:1.0} },
  { name:"Quick Meridian", rarity:"Green", weight:10, stats:{health:0.9, strength:0.9, qi:1.1, speed:1.2} },
  { name:"Iron Muscle", rarity:"Green", weight:10, stats:{health:1.2, strength:1.2, qi:0.9, speed:0.9} },
  { name:"Flowing River", rarity:"Green", weight:5,  stats:{health:1.0, strength:1.0, qi:1.2, speed:1.1} },
  { name:"Earthroot Body", rarity:"Green", weight:5,  stats:{health:1.3, strength:1.1, qi:0.8, speed:0.8} },
  { name:"Thunder Vessel", rarity:"Blue", weight:7,  stats:{health:1.0, strength:1.3, qi:1.2, speed:1.1} },
  { name:"Frost Jade", rarity:"Blue", weight:7,  stats:{health:1.1, strength:0.9, qi:1.4, speed:1.0} },
  { name:"Crimson Flame", rarity:"Blue", weight:6,  stats:{health:1.2, strength:1.2, qi:1.1, speed:1.1} },
  { name:"Celestial Spirit", rarity:"Purple", weight:2, stats:{health:1.3, strength:1.4, qi:1.5, speed:1.2} },
  { name:"Voidwalker", rarity:"Purple", weight:2, stats:{health:1.1, strength:1.1, qi:1.6, speed:1.5} },
  { name:"Starlit Vessel",rarity:"Purple", weight:1, stats:{health:1.4, strength:1.3, qi:1.3, speed:1.3} },
  { name:"Heavenly Dao Body",rarity:"Gold",   weight:0.5,stats:{health:1.6, strength:1.6, qi:1.7, speed:1.6} },
  { name:"Primordial Chaos Vessel",rarity:"Gold", weight:0.5,stats:{health:1.7, strength:1.7, qi:1.9, speed:1.7} }
];

const realms = [
  { name:"Qi Gathering",      levels:10, lifespan:10 },
  { name:"Foundation Building",levels:10,lifespan:20 },
  { name:"Core Formation",    levels:10, lifespan:30 },
  { name:"Golden Core",       levels:10, lifespan:50 },
  { name:"Soul Formation",    levels:10, lifespan:70 },
  { name:"Nascent Soul",      levels:10, lifespan:100 },
  { name:"Nihility",          levels:10, lifespan:150 },
  { name:"Ascension",         levels:10, lifespan:200 },
  { name:"Half Immortal",     levels:10, lifespan:300 },
  { name:"Earth Immortal",    levels:1,  lifespan:500 }
];

// --- Player State ---
let player = {
  name:"", age:13,
  talent:0,
  physique:null,
  stats:{ health:0, strength:0, qi:0, speed:0 },
  realmIndex:0, realmLevel:1,
  qi:0, qiRequired:100,
  cultivating:false,
  lifespan:realms[0].lifespan
};

let cultivationInterval = null;

// --- Initialization ---
function initializePlayer(){
  // 1) Random name
  player.name = chineseNames[
    Math.floor(Math.random() * chineseNames.length)
  ];

  // 2) Talent roll 1–100
  player.talent = Math.floor(Math.random() * 100) + 1;

  // 3) Weighted Physique roll
  player.physique = getRandomPhysique();

  // 4) Initial Qi requirement based on realm
  player.qiRequired = 100 * player.realmLevel;

  // 5) Calculate stats from talent & physique
  calculateStats();

  // 6) Push to UI
  updateUI();
}

// Weighted‐random helper
function getRandomPhysique(){
  const total = physiquePool.reduce((sum,p) => sum + p.weight, 0);
  let pick = Math.random() * total;
  for(const p of physiquePool){
    if(pick < p.weight) return p;
    pick -= p.weight;
  }
  return physiquePool[0];
}

// Calculate stats: stat = round(talent × physique multiplier)
function calculateStats(){
  player.stats.health   = Math.round(player.talent * player.physique.stats.health);
  player.stats.strength = Math.round(player.talent * player.physique.stats.strength);
  player.stats.qi       = Math.round(player.talent * player.physique.stats.qi);
  player.stats.speed    = Math.round(player.talent * player.physique.stats.speed);
}

// Update all DOM elements
function updateUI(){
  document.getElementById('player-name').textContent = player.name;
  document.getElementById('age').textContent         = player.age;
  document.getElementById('talent').textContent      = player.talent;
  document.getElementById('physique').textContent    = player.physique.name;

  // Qi progress bar
  const pct = Math.min(100, (player.qi / player.qiRequired) * 100);
  document.getElementById('xp-bar').style.width     = pct + '%';

  // Realm + level
  const realmObj = realms[player.realmIndex];
  document.getElementById('realm').textContent      =
    `${realmObj.name} ${player.realmLevel}`;

  // Stats display
  document.getElementById('health').textContent     = player.stats.health;
  document.getElementById('strength').textContent   = player.stats.strength;
  document.getElementById('qi').textContent         = player.stats.qi;
  document.getElementById('speed').textContent      = player.stats.speed;

  // Lifespan
  document.getElementById('lifespan').textContent   = realmObj.lifespan;
}

// Show modal with rolls
function showInitModal(){
  document.getElementById('modal-name').textContent     = player.name;
  document.getElementById('modal-talent').textContent   = player.talent;
  document.getElementById('modal-physique').textContent = player.physique.name;
}

// Confirm button hides modal
document.getElementById('modal-confirm-btn')
  .addEventListener('click', () => {
    document.getElementById('init-modal').classList.add('hidden');
  });

// Cultivation toggle: +Qi every second
function toggleCultivation(){
  const btn = document.getElementById('cultivate-btn');
  if(!player.cultivating){
    player.cultivating = true;
    btn.textContent   = 'Stop Cultivating';
    cultivationInterval = setInterval(() => {
      player.qi = Math.min(player.qiRequired, player.qi + player.stats.qi);
      updateUI();
    }, 1000);
  } else {
    player.cultivating = false;
    btn.textContent    = 'Start Cultivating';
    clearInterval(cultivationInterval);
  }
}

// Breakthrough logic
function breakthrough(){
  if(player.qi < player.qiRequired){
    alert('Not enough Qi to breakthrough!');
    return;
  }
  player.qi -= player.qiRequired;
  player.realmLevel++;
  if(player.realmLevel > realms[player.realmIndex].levels){
    player.realmIndex++;
    player.realmLevel = 1;
  }
  player.qiRequired = 100 * player.realmLevel;
  calculateStats();
  updateUI();
}

// Region stub
function selectRegion(name){
  alert(`You travel to ${name}. (Event logic goes here!)`);
}

// On load, roll & show modal
window.onload = function(){
  initializePlayer();
  showInitModal();
};
