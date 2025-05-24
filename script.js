// Player data
const player = {
  name: '',
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

// List of 30 Chinese names
const chineseNames = [
  "Li Wei", "Wang Fang", "Zhang Min", "Liu Yang", "Chen Jie",
  "Yang Jun", "Zhao Lei", "Huang Mei", "Zhou Ping", "Wu Qiang",
  "Xu Hui", "Sun Lin", "Ma Chao", "Zhu Li", "Hu Dong",
  "Guo Ying", "He Tao", "Gao Fei", "Lin Na", "Luo Bin",
  "Zheng Hao", "Liang Yu", "Song Yan", "Xie Ning", "Han Rui",
  "Tang Shan", "Feng Lan", "Yu Chen", "Dong Xi", "Xiao Qing"
];

// Initialize game
window.onload = () => {
  assignRandomName();
  rollAttributes();
  updateUI();
  startGame();
};

// Assign a random Chinese name
function assignRandomName() {
  const randomIndex = Math.floor(Math.random() * chineseNames.length);
  player.name = chineseNames[randomIndex];
  document.getElementById("player-name").innerText = player.name;
}

// Roll talent and physique
function rollAttributes() {
  player.talent = Math.floor(Math.random() * 100) + 1;
  const physiques = ["Heavenly", "Earthly", "Mortal", "Demonic", "Divine"];
  player.physique = physiques[Math.floor(Math.random() * physiques.length)];
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
      updateQiBar();
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
  updateQiBar();
}

// Update Qi bar
function updateQiBar() {
  const qiPercentage = (player.qi / player.maxQi) * 100;
  const qiBar = document.getElementById("xp-bar");
  qiBar.style.width = `${qiPercentage}%`;
  qiBar.innerText = `${Math.floor(qiPercentage)}%`;
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
