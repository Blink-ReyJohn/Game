// Player data
const player = {
  name: "Unnamed Cultivator",
  age: 13,
  realmStage: 0,
  qi: 0,
  maxQi: 100,
  stats: {
    strength: 10,
    agility: 10,
    intelligence: 10
  },
  qiRegenMultiplier: 1
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
    document.getElementById("modal").classList.add("hidden");
    startGame();
  };
}

// Start game
function startGame() {
  updateUI();
  setInterval(() => {
    player.age += 1;
    document.getElementById("player-age").innerText = player.age;
  }, 30000); // Age increases every 30 seconds

  setInterval(() => {
    const regen = 1 * player.qiRegenMultiplier;
    player.qi = Math.min(player.qi + regen, player.maxQi);
    updateUI();
  }, 500); // Qi regenerates every 0.5 seconds
}

// Update UI
function updateUI() {
  document.getElementById("player-age").innerText = player.age;
  document.getElementById("player-realm").innerText = realmStages[player.realmStage];
  document.getElementById("player-qi").innerText = Math.floor(player.qi);
  document.getElementById("player-max-qi").innerText = player.maxQi;
  document.getElementById("stat-strength").innerText = player.stats.strength;
  document.getElementById("stat-agility").innerText = player.stats.agility;
  document.getElementById("stat-intelligence").innerText = player.stats.intelligence;

  applyGoldenCoreBoost();
}

// Breakthrough
document.getElementById("breakthrough").addEventListener("click", () => {
  const currentStage = player.realmStage;
  const realmName = realmStages[currentStage];

  if (realmName.includes("Core Formation 10") || realmName.includes("Half Immortal 10")) {
    triggerThunderTribulation(() => {
      player.realmStage += 1;
      player.qi = 0;
      player.maxQi += 100;
      updateUI();
    });
  } else {
    player.realmStage += 1;
    player.qi = 0;
    player.maxQi += 100;
    updateUI();
  }
});

// Start cultivation
document.getElementById("start-cultivation").addEventListener("click", () => {
  // Cultivation starts automatically with Qi regeneration
  alert("Cultivation has begun!");
});

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

function applyGoldenCoreBoost
::contentReference[oaicite:1]{index=1}
 
