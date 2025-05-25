// script.js (Player setup + UI)

const BASE_LIFESPAN = 85;
const BASE_QI_REQUIREMENT = 100;
const QI_SCALE = 1.35;
const MAJOR_REALM_STAT_BOOST = 1.10;
const MINOR_REALM_STAT_BOOST = 1 + (MAJOR_REALM_STAT_BOOST - 1) * 0.7;
const LIFE_GAINS = [5,8,12,18,25,35,50,70,100,150];

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
  statMultiplier: 1, cultivating: false,
  gold: 0,
  spiritStones: 0,
  inventory: []
};

let cultivationInterval = null;
let agingInterval = null;

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

  const phys = player.physique;
  const physEl = document.getElementById("physique");
  physEl.className = `tooltip rarity-${phys.rarity}`;
  physEl.textContent = phys.name;
  physEl.setAttribute("data-tooltip", `Rarity: ${phys.rarity} | Element: ${phys.element}`);

  document.getElementById("health").textContent = player.stats.health;
  document.getElementById("strength").textContent = player.stats.strength;
  document.getElementById("qi").textContent = player.stats.qi;
  document.getElementById("speed").textContent = player.stats.speed;
  document.getElementById("realm").textContent = subRealms[player.subRealmIndex].name;
  document.getElementById("lifespan").textContent = player.lifespan;
  document.getElementById("gold").textContent = player.gold;
  document.getElementById("spirit-stones").textContent = player.spiritStones;

  const pct = Math.min(100, (player.qi / player.qiRequired) * 100);
  document.getElementById("xp-bar").style.width = pct + "%";
  document.getElementById("xp-bar").title = `${player.qi} / ${player.qiRequired} Qi`;
}

function toggleCultivation() {
  const btn = document.getElementById("cultivate-btn");
  if (!player.cultivating) {
    player.cultivating = true;
    btn.textContent = "Stop Cultivating";
    cultivationInterval = setInterval(() => {
      player.qi = Math.min(player.qiRequired, player.qi + player.stats.qi);
      updateUI();
      savePlayerData();
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

    if (newMajor > prevMajor) {
      player.statMultiplier *= MAJOR_REALM_STAT_BOOST;
      player.lifespan += LIFE_GAINS[newMajor];
    } else {
      player.statMultiplier *= MINOR_REALM_STAT_BOOST;
      player.lifespan += LIFE_GAINS[newMajor] * 0.5;
    }

  } else {
    const modal = document.getElementById("notice-modal");
    modal.querySelector(".modal-message").textContent = "You’re already at Earth Immortal X!";
    modal.classList.remove("hidden");
    return;
  }

  calculateStats();
  updateUI();
  savePlayerData();
}

function startAging() {
  if (agingInterval) clearInterval(agingInterval);

  agingInterval = setInterval(() => {
    player.age++;
    if (player.age > player.lifespan) {
      clearInterval(agingInterval);
      clearInterval(cultivationInterval);
      showGameOver();
      return;
    }
    updateUI();
    savePlayerData();
  }, 30000);
}

function showGameOver() {
  const modal = document.getElementById("notice-modal");
  modal.querySelector(".modal-message").textContent = "☠️ You passed away from old age. Game Over.";
  modal.classList.remove("hidden");
  document.getElementById("cultivate-btn").disabled = true;
}

function rerollLife() {
  const confirmReroll = confirm("This will reset your entire life — name, talent, physique, stats, realm, inventory, and more. Proceed?");
  if (!confirmReroll) return;

  player.name = chineseNames[Math.floor(Math.random() * chineseNames.length)];
  player.talent = Math.floor(Math.random() * 100) + 1;
  player.physique = getRandomPhysique();

  player.age = 13;
  player.subRealmIndex = 0;
  player.qiRequired = BASE_QI_REQUIREMENT;
  player.qi = 0;
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

  const cultivateBtn = document.getElementById("cultivate-btn");
  if (cultivateBtn) cultivateBtn.textContent = "Start Cultivating";

  const modal = document.getElementById("notice-modal");
  modal.querySelector(".modal-message").textContent =
    `🌅 You were reborn as ${player.name} with ${player.talent} talent and the physique "${player.physique.name}".`;
  modal.classList.remove("hidden");
}

window.onload = () => {
  setInterval(savePlayerData, 10 * 60 * 1000);
  loadPlayerData();
  startAging();
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
