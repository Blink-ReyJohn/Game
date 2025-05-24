let player = {
  name: "",
  age: 21,
  talent: 0,
  physique: "Unknown",
  physiqueRarity: "",
  physiqueBoost: {},
  stats: { health: 0, strength: 0, qi: 0, speed: 0 },
  xp: 0,
  maxXP: 12.5,
  cultivating: false,
  realm: "Mortal I",
  realmStage: 0,
  lifespan: 85
};

let resources = {
  gold: 0,
  knowledge: 0,
  contribution: 0,
  spiritStones: 0,
  immortalStones: 0,
  lifeEssence: 0
};

// -- Physique Pool with Rarity & Stats --
const physiquePool = [
  // GRAY - 60%
  { name: "Ordinary Vessel", rarity: "Gray", weight: 30, stats: { health: 0.9, strength: 0.9, qi: 0.9, speed: 0.9 } },
  { name: "Frail Heart", rarity: "Gray", weight: 30, stats: { health: 0.8, strength: 0.8, qi: 1.0, speed: 1.0 } },

  // GREEN - 40%
  { name: "Stable Core", rarity: "Green", weight: 10, stats: { health: 1.0, strength: 1.0, qi: 1.0, speed: 1.0 } },
  { name: "Quick Meridian", rarity: "Green", weight: 10, stats: { health: 0.9, strength: 0.9, qi: 1.1, speed: 1.2 } },
  { name: "Iron Muscle", rarity: "Green", weight: 10, stats: { health: 1.2, strength: 1.2, qi: 0.9, speed: 0.9 } },
  { name: "Flowing River", rarity: "Green", weight: 5, stats: { health: 1.0, strength: 1.0, qi: 1.2, speed: 1.1 } },
  { name: "Earthroot Body", rarity: "Green", weight: 5, stats: { health: 1.3, strength: 1.1, qi: 0.8, speed: 0.8 } },

  // BLUE - 20%
  { name: "Thunder Vessel", rarity: "Blue", weight: 7, stats: { health: 1.0, strength: 1.3, qi: 1.2, speed: 1.1 } },
  { name: "Frost Jade", rarity: "Blue", weight: 7, stats: { health: 1.1, strength: 0.9, qi: 1.4, speed: 1.0 } },
  { name: "Crimson Flame", rarity: "Blue", weight: 6, stats: { health: 1.2, strength: 1.2, qi: 1.1, speed: 1.1 } },

  // PURPLE - 5%
  { name: "Celestial Spirit", rarity: "Purple", weight: 2, stats: { health: 1.3, strength: 1.4, qi: 1.5, speed: 1.2 } },
  { name: "Voidwalker", rarity: "Purple", weight: 2, stats: { health: 1.1, strength: 1.1, qi: 1.6, speed: 1.5 } },
  { name: "Starlit Vessel", rarity: "Purple", weight: 1, stats: { health: 1.4, strength: 1.3, qi: 1.3, speed: 1.3 } },

  // GOLD - 1%
  { name: "Heavenly Dao Body", rarity: "Gold", weight: 0.5, stats: { health: 1.6, strength: 1.6, qi: 1.7, speed: 1.6 } },
  { name: "Primordial Chaos Vessel", rarity: "Gold", weight: 0.5, stats: { health: 1.7, strength: 1.7, qi: 1.9, speed: 1.7 } }
];

let ageTimer = null;
let cultivationInterval = null;

function pickPhysique() {
  const totalWeight = physiquePool.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const p of physiquePool) {
    if (roll < p.weight) return p;
    roll -= p.weight;
  }
  return physiquePool[0];
}

function submitName() {
  const name = document.getElementById("player-name-input").value.trim();
  if (!name) return;

  player.name = name;
  document.getElementById("player-name").innerText = name;

  const modalText = document.getElementById("modal-text");
  modalText.innerHTML = "Rolling Talent and Physique...";
  document.getElementById("player-name-input").remove();

  const button = document.querySelector("#modal .modal-content button");
  button.innerText = "Roll";
  button.onclick = rollStats;
}

function rollStats() {
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modal-text");
  const button = document.querySelector("#modal .modal-content button");
  button.style.display = "none";

  let rollCount = 0;
  const interval = setInterval(() => {
    const tempTalent = Math.floor(Math.random() * 10) + 1;
    const tempPhysique = physiquePool[Math.floor(Math.random() * physiquePool.length)];
    modalText.innerHTML = `<strong>Rolling...</strong><br>Talent: ${tempTalent} | Physique: ${tempPhysique.name} (${tempPhysique.rarity})`;
    rollCount++;
    if (rollCount >= 20) {
      clearInterval(interval);

      player.talent = Math.floor(Math.random() * 10) + 1;
      const chosenPhysique = pickPhysique();
      player.physique = chosenPhysique.name;
      player.physiqueRarity = chosenPhysique.rarity;
      player.physiqueBoost = chosenPhysique.stats;

      setInitialStats();

      modalText.innerHTML = `<strong>Fate Decided!</strong><br>Talent: ${player.talent} | Physique: ${player.physique} (${player.physiqueRarity})`;
      button.innerText = "Begin Journey";
      button.style.display = "inline-block";
      button.onclick = () => {
        modal.classList.add("hidden");
        startAgeTimer();
        updateUI();
      };
    }
  }, 100);
}

function setInitialStats() {
  const boost = player.physiqueBoost;
  const baseTalentFactor = 1 + player.talent / 10;

  player.stats.health = Math.floor(80 * baseTalentFactor * boost.health);
  player.stats.strength = Math.floor(70 * baseTalentFactor * boost.strength);
  player.stats.qi = Math.floor(75 * baseTalentFactor * boost.qi);
  player.stats.speed = Math.floor(70 * baseTalentFactor * boost.speed);
}

function startAgeTimer() {
  ageTimer = setInterval(() => {
    player.age++;
    document.getElementById("age").innerText = `${player.age}`;
  }, 30000);
}

function toggleCultivation() {
  player.cultivating = !player.cultivating;
  document.getElementById("cultivate-btn").innerText = player.cultivating ? "Stop Cultivating" : "Start Cultivating";

  if (player.cultivating) {
    cultivationInterval = setInterval(() => {
      const xpGain = 1 + player.talent / 10;
      player.xp += xpGain;
      if (player.xp > player.maxXP) player.xp = player.maxXP;

      resources.spiritStones += 1;
      resources.knowledge += 0.5;

      updateUI();
    }, 3000);
  } else {
    clearInterval(cultivationInterval);
  }
}

function breakthrough() {
  if (player.xp < player.maxXP) {
    showModal("Not enough experience to breakthrough.");
    return;
  }

  player.xp = 0;
  player.maxXP *= 1.4;

  const newRealm = getNewRealm();
  if (newRealm) {
    player.realm = newRealm;
    player.realmStage++;
    player.lifespan += 5;
    increaseStatsOnBreakthrough();

    document.getElementById("realm").innerText = player.realm;
    showModal(`Breakthrough successful! You reached <strong>${player.realm}</strong> and grew stronger!`);
  } else {
    showModal("You have reached the peak realm.");
  }

  resources.spiritStones += 10;
  updateUI();
}

function increaseStatsOnBreakthrough() {
  const boost = player.physiqueBoost;
  const growthFactor = 0.6 + player.talent / 20;

  player.stats.health = Math.floor(player.stats.health + 10 * growthFactor * boost.health);
  player.stats.strength = Math.floor(player.stats.strength + 8 * growthFactor * boost.strength);
  player.stats.qi = Math.floor(player.stats.qi + 9 * growthFactor * boost.qi);
  player.stats.speed = Math.floor(player.stats.speed + 7 * growthFactor * boost.speed);
}

function getNewRealm() {
  const realms = [
    "Mortal I", "Mortal II", "Mortal III", "Qi Gathering I",
    "Qi Gathering II", "Foundation Establishment", "Core Formation",
    "Nascent Soul", "Soul Transformation", "Immortal Ascension"
  ];

  if (player.realmStage < realms.length - 1) {
    return realms[player.realmStage + 1];
  } else {
    return null;
  }
}

function selectRegion(regionName) {
  showModal(`You entered the region: ${regionName}`);
  document.querySelector(".world-map").style.filter = "brightness(1.1)";
}

function showModal(message) {
  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");
  modal.innerHTML = `<div class="modal-content"><p>${message}</p><button onclick="closeModal()">OK</button></div>`;
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function updateUI() {
  document.getElementById("player-name").innerText = player.name;
  document.getElementById("age").innerText = `${player.age}`;
  document.getElementById("talent").innerText = player.talent;
  document.getElementById("physique").innerText = `${player.physique} (${player.physiqueRarity})`;

  document.getElementById("health").innerText = player.stats.health;
  document.getElementById("strength").innerText = player.stats.strength;
  document.getElementById("qi").innerText = player.stats.qi;
  document.getElementById("speed").innerText = player.stats.speed;

  document.getElementById("xp-bar").style.width = (player.xp / player.maxXP * 100) + "%";

  document.getElementById("gold").innerText = Math.floor(resources.gold);
  document.getElementById("knowledge").innerText = Math.floor(resources.knowledge);
  document.getElementById("contribution").innerText = Math.floor(resources.contribution);
  document.getElementById("spirit-stones").innerText = Math.floor(resources.spiritStones);
  document.getElementById("immortal-stones").innerText = Math.floor(resources.immortalStones);
  document.getElementById("life-essence").innerText = Math.floor(resources.lifeEssence);

  const lifespanDisplay = document.querySelector(".panel.left p:nth-of-type(6)");
  if (lifespanDisplay) lifespanDisplay.innerText = `Expected Lifespan: ${player.lifespan} years`;
}

window.onload = () => {
  document.getElementById("modal").classList.remove("hidden");
};
