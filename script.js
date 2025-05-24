let xp = 0;
let maxXP = 12.5;
let stage = 1;
let realm = "Mortal I";
let reinforceLevel = 0;
let age = 21;
let lifespan = 85;
let talent = 7;
let region = "None";

let stats = {
  health: 103,
  strength: 95,
  qi: 98,
  speed: 105,
};

let resources = {
  gold: 0,
  knowledge: 0,
  contribution: 0,
  spiritStones: 0,
  immortalStones: 0,
  lifeEssence: 0,
};

// --- REGION MODIFIERS ---
const regionEffects = {
  "Volcanic Peak": { qi: 5 },
  "Forest of Great Beasts": { speed: 5 },
  "Clashing Elements": { strength: 5 },
  "Island of Heavenly Trials": { health: 10 },
  "City": { knowledge: 3 },
  "Land of Immortals": { all: 2 },
};

// --- LOAD SAVE ---
function loadGame() {
  const save = localStorage.getItem("cultivationSave");
  if (save) {
    Object.assign(this, JSON.parse(save));
  }
  applyRegionEffects();
  updateUI();
}

// --- SAVE GAME ---
function saveGame() {
  const saveData = {
    xp, maxXP, stage, realm, reinforceLevel, age, lifespan, talent, stats, resources, region
  };
  localStorage.setItem("cultivationSave", JSON.stringify(saveData));
}

function applyRegionEffects() {
  if (!region || !regionEffects[region]) return;
  const boost = regionEffects[region];
  if (boost.all) {
    stats.health += boost.all;
    stats.qi += boost.all;
    stats.strength += boost.all;
    stats.speed += boost.all;
  } else {
    for (let stat in boost) {
      stats[stat] += boost[stat];
    }
  }
}

function selectRegion(regionName) {
  region = regionName;
  logEvent(`Entered region: ${regionName}`);
  applyRegionEffects();
  document.querySelector(".world-map").style.filter = regionBackground(regionName);
  updateUI();
  saveGame();
}

function regionBackground(name) {
  switch (name) {
    case "Volcanic Peak": return "hue-rotate(30deg)";
    case "Forest of Great Beasts": return "brightness(0.9) saturate(1.2)";
    case "Island of Heavenly Trials": return "contrast(1.1)";
    case "Land of Immortals": return "grayscale(0.3)";
    default: return "none";
  }
}

function startCultivating() {
  if (age >= lifespan) {
    alert("You have died. Reincarnate to try again.");
    return;
  }

  const xpGain = 1.5 + (talent / 10);
  xp += xpGain;
  age++;
  resources.spiritStones += 2;
  resources.knowledge += 1;
  logEvent(`Cultivated and gained ${xpGain.toFixed(1)} XP.`);
  if (xp >= maxXP) logEvent("Ready to breakthrough!");

  updateUI();
  saveGame();
}

function reinforce() {
  reinforceLevel++;
  stats.health += 2;
  stats.qi += 3;
  stats.strength += 2;
  stats.speed += 1;
  logEvent(`Reinforced body to +${reinforceLevel}`);
  updateUI();
  saveGame();
}

function breakthrough() {
  if (xp < maxXP) {
    alert("Not enough XP.");
    return;
  }

  const chance = calculateSuccessChance();
  const roll = Math.random() * 100;

  if (roll <= chance) {
    xp = 0;
    stage++;
    maxXP *= 1.4;
    realm = getNewRealm(stage);
    logEvent(`Breakthrough! You are now at ${realm}`);
    resources.spiritStones += 10;
  } else {
    xp -= maxXP * 0.25;
    logEvent("Breakthrough failed.");
  }

  updateUI();
  saveGame();
}

function calculateSuccessChance() {
  let base = 70 + talent * 3;
  if (xp >= maxXP * 1.2) base += 5;
  return Math.min(base, 99.9);
}

function getNewRealm(stage) {
  const realms = [
    "Mortal I", "Mortal II", "Mortal III",
    "Qi Gathering I", "Qi Gathering II",
    "Foundation Establishment", "Core Formation",
    "Nascent Soul", "Soul Transformation",
    "Immortal Ascension"
  ];
  return realms[stage - 1] || "Celestial Path";
}

function logEvent(msg) {
  console.log(`[LOG]: ${msg}`);
}

function updateUI() {
  document.getElementById("xp-bar").style.width = (xp / maxXP) * 100 + "%";
  document.getElementById("age").innerText = age;
  document.getElementById("success").innerText = calculateSuccessChance() + "%";

  document.getElementById("health").innerText = stats.health;
  document.getElementById("strength").innerText = stats.strength;
  document.getElementById("qi").innerText = stats.qi;
  document.getElementById("speed").innerText = stats.speed;

  document.getElementById("gold").innerText = resources.gold;
  document.getElementById("knowledge").innerText = resources.knowledge;
  document.getElementById("contribution").innerText = resources.contribution;
  document.getElementById("spirit-stones").innerText = resources.spiritStones;
  document.getElementById("immortal-stones").innerText = resources.immortalStones;
  document.getElementById("life-essence").innerText = resources.lifeEssence;
}

// --- INITIALIZE GAME ---
window.onload = loadGame;
