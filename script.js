let xp = 0;
let maxXP = 12.5;
let stage = 1;
let realm = "Mortal I";
let reinforceLevel = 0;
let age = 21;
let lifespan = 85;
let talent = 7;

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

function startCultivating() {
  if (age >= lifespan) {
    alert("You have passed away before achieving immortality. Reincarnate?");
    return;
  }

  const xpGain = 1.5 + (talent / 10);
  xp += xpGain;
  age++;

  resources.spiritStones += 2;
  resources.knowledge += 1;
  logEvent(`Cultivated and gained ${xpGain.toFixed(1)} XP.`);

  if (xp >= maxXP) {
    logEvent("You are ready for a Breakthrough!");
  }

  updateUI();
}

function reinforce() {
  reinforceLevel++;
  stats.health += 2;
  stats.qi += 3;
  stats.strength += 2;
  stats.speed += 1;
  logEvent(`Body reinforced to +${reinforceLevel}`);
  updateUI();
}

function breakthrough() {
  if (xp < maxXP) {
    alert("Not enough XP for breakthrough.");
    return;
  }

  const successChance = calculateSuccessChance();
  const roll = Math.random() * 100;

  if (roll <= successChance) {
    xp = 0;
    stage++;
    maxXP *= 1.4;
    realm = getNewRealm(stage);
    logEvent(`Breakthrough successful! You are now at ${realm}`);
    resources.spiritStones += 10;
  } else {
    logEvent("Breakthrough failed. You must cultivate more!");
    xp -= maxXP * 0.25;
  }

  updateUI();
}

function calculateSuccessChance() {
  let base = 70;
  base += talent * 3;
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

updateUI();
