// Player data
const player = {
  firstName: '',
  surname: '',
  name: 'Unnamed',
  age: 13,
  realmStage: 0,
  qi: 0,
  maxQi: 100,
  stats: {
    strength: 10,
    agility: 10,
    intelligence: 10,
    health: 100,
    speed: 10
  },
  qiRegenMultiplier: 1,
  talent: 0,
  physique: 'Unknown',
  lifespan: 85,
  cultivating: false
};

// Realm stages
const majorRealms = [
  "Qi Gathering",
  "Foundation Building",
  "Core Formation",
  "Golden Core",
  "Soul Formation",
  "Nascent Soul",
  "Nihility",
  "Ascension",
  "Half Immortal",
  "Earth Immortal"
];

const realmStages = [];
majorRealms.forEach(realm => {
  for (let i = 1; i <= 10; i++) {
    realmStages.push(`${realm} ${i}`);
  }
});

// Surnames
const surnames = [
  { name: "Li", meaning: "Strength and resilience" },
  { name: "Zhao", meaning: "Brightness and nobility" },
  { name: "Xuan", meaning: "Mystery and elegance" },
  { name: "Feng", meaning: "Wind and freedom" },
  { name: "Yun", meaning: "Clouds and grace" },
  { name: "Wang", meaning: "Royal lineage" },
  { name: "Long", meaning: "Dragon lineage" },
  { name: "Qin", meaning: "Harmony and power" },
  { name: "Shen", meaning: "Divinity and spirit" },
  { name: "Chen", meaning: "Morning and clarity" }
];

// Initialize surname dropdown
window.onload = () => {
  const dropdown = document.getElementById("surname-dropdown");
  surnames.forEach(s => {
    const option = document.createElement("option");
    option.value = s.name;
    option.textContent = s.name;
    dropdown.appendChild(option);
  });

  document.getElementById("modal").classList.remove("hidden");
};

// Update surname meaning
function updateSurnameMeaning() {
  const selected = document.getElementById("surname-dropdown").value;
  const match = surnames.find(s => s.name === selected);
  document.getElementById("surname-meaning").textContent = match ? match.meaning : "";
}

// Submit name
function submitName() {
  const first = document.getElementById("player-firstname-input").value.trim();
  const last = document.getElementById("surname-dropdown").value;
  if (!first || !last) return;

  player.firstName = first;
  player.surname = last;
  player.name = `${last} ${first}`;
  document.getElementById("player-name").innerText = player.name;

  const modalText = document.getElementById("modal-text");
  modalText.innerHTML = "Rolling Talent and Physique...";
  document.getElementById("player-firstname-input").remove();
  document.getElementById("surname-dropdown").remove();
  document.getElementById("surname-meaning").remove();

  const button = document.querySelector("#modal .modal-content button");
  button.innerText = "Roll";
  button.onclick = () => {
    rollAttributes();
    document.getElementById("modal").classList.add("hidden");
    startGame();
  };
}

// Roll talent and physique
function rollAttributes() {
  player.talent = Math.floor(Math.random() * 100) + 1;
  const physiques = ["Heavenly", "Earthly", "Mortal", "Demonic", "Divine"];
  player.physique = physiques[Math.floor(Math.random() * physiques.length)];
  updateUI();
}

// Start game
function startGame() {
  updateUI();
  setInterval(() => {
    player.age += 1;
    document.getElementById("age").innerText = player.age;
  }, 30000); // Age increases every 30 seconds

  setInterval(() => {
    if (player.cultivating) {
      const regen = 1 * player.qiRegenMultiplier;
      player.qi = Math.min(player.qi + regen, player.maxQi);
      updateUI();
    }
  }, 500); // Qi regenerates every 0.5 seconds
}

// Update UI
function updateUI() {
  document.getElementById("player-name").innerText = player.name;
  document.getElementById("age").innerText = player.age;
  document.getElementById("talent").innerText = player.talent;
  document.getElementById("physique").innerText = player.physique;
  document.getElementById("realm").innerText = realmStages[player.realmStage];
  document.getElementById("health").innerText = player.stats.health;
  document.getElementById("strength").innerText = player.stats.strength;
  document.getElementById("qi").innerText = Math.floor(player.qi);
  document.getElementById("speed").innerText = player.stats.speed;
  document.getElementById("lifespan").innerText = player.lifespan;
}

// Toggle cultivation
function toggleCultivation() {
  player.cultivating = !player.cultivating;
  document.getElementById("cultivate-btn").innerText = player.cultivating ? "Stop Cultivating" : "Start Cultivating";
}

// Breakthrough
function breakthrough() {
  const currentStage = player.realmStage;
  const realmName = realmStages[currentStage];

  if (realmName.includes("Core Formation 10") || realmName.includes("Half Immortal 10")) {
    triggerThunderTribulation(() => {
      advanceRealm();
    });
  } else {
    advanceRealm();
  }
}

// Advance realm
function advanceRealm() {
  player.realmStage += 1;
  player.qi = 0;
  player.maxQi += 100;
  applyGoldenCoreBoost();
  updateUI();
}

// Thunder Tribulation
function triggerThunderTribulation(onSuccess) {
  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <p><strong>🌩️ Thunder Tribulation!</strong><br>
      Resist the divine lightning for 5 seconds to ascend.</p>
    </div>`;
  modal.classList.remove("hidden");

  setTimeout(() => {
    modal.innerHTML = `<div class="modal-content"><p>You survived the Thunder Tribulation!</p><button onclick="closeModal()">OK</button></div>`;
    onSuccess();
  }, 5000);
}

// Close modal
function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// Golden Core Boost
function getGoldenCoreBoost(level) {
  return {
    qi: 1 + level * 0.05,
    stats: 1 + level * 0.04
  };
}

function applyGoldenCoreBoost() {
  const realm = realmStages[player.realmStage];
  if (realm.includes("Golden Core")) {
    const level = parseInt(realm.split(" ").pop()) || 1;
    const boost = getGoldenCoreBoost(level);

    // Apply stat multipliers
    for (let key in player.stats) {
      player.stats[key] = Math.floor(player.stats[key] * boost.stats);
    }

    // Store Qi regen multiplier
    player.qiRegenMultiplier = boost.qi;
  }
}
