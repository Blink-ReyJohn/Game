let player = {
  name: "",
  age: 21,
  talent: 0,
  physique: "Unknown",
  stats: { health: 0, strength: 0, qi: 0, speed: 0 },
  xp: 0,
  maxXP: 12.5,
  cultivating: false,
  realm: "Mortal I"
};

let resources = {
  gold: 0,
  knowledge: 0,
  contribution: 0,
  spiritStones: 0,
  immortalStones: 0,
  lifeEssence: 0
};

const physiqueTypes = ["Fragile", "Normal", "Refined", "Heavenly Body"];
const physiqueBoosts = {
  Fragile: 0.8,
  Normal: 1,
  Refined: 1.2,
  "Heavenly Body": 1.5
};

let ageTimer = null;
let cultivationInterval = null;

// MODAL NAME ENTRY
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

// ROLL TALENT AND PHYSIQUE WITH ANIMATION
function rollStats() {
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modal-text");
  const button = document.querySelector("#modal .modal-content button");
  button.style.display = "none";

  let rollCount = 0;
  const interval = setInterval(() => {
    const tempTalent = Math.floor(Math.random() * 10) + 1;
    const tempPhysique = physiqueTypes[Math.floor(Math.random() * physiqueTypes.length)];
    modalText.innerHTML = `<strong>Rolling...</strong><br>Talent: ${tempTalent} | Physique: ${tempPhysique}`;
    rollCount++;
    if (rollCount >= 20) {
      clearInterval(interval);

      // Finalize values
      player.talent = Math.floor(Math.random() * 10) + 1;

      const roll = Math.random();
      if (roll < 0.2) player.physique = "Fragile";
      else if (roll < 0.6) player.physique = "Normal";
      else if (roll < 0.9) player.physique = "Refined";
      else player.physique = "Heavenly Body";

      const boost = physiqueBoosts[player.physique];
      player.stats.health = Math.floor(100 + player.talent * 2 * boost);
      player.stats.strength = Math.floor(90 + player.talent * 1.5 * boost);
      player.stats.qi = Math.floor(90 + player.talent * 2 * boost);
      player.stats.speed = Math.floor(90 + player.talent * 1.5 * boost);

      modalText.innerHTML = `<strong>Fate Decided!</strong><br>Talent: ${player.talent} | Physique: ${player.physique}`;
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

// AUTO AGE TIMER
function startAgeTimer() {
  ageTimer = setInterval(() => {
    player.age++;
    document.getElementById("age").innerText = `${player.age}`;
  }, 30000);
}

// TOGGLE CULTIVATION
function toggleCultivation() {
  player.cultivating = !player.cultivating;
  document.getElementById("cultivate-btn").innerText = player.cultivating ? "Stop Cultivating" : "Start Cultivating";

  if (player.cultivating) {
    cultivationInterval = setInterval(() => {
      player.xp += 1 + player.talent / 10;
      resources.spiritStones += 1;
      resources.knowledge += 0.5;
      updateUI();
    }, 3000);
  } else {
    clearInterval(cultivationInterval);
  }
}

// BREAKTHROUGH
function breakthrough() {
  if (player.xp < player.maxXP) {
    showModal("Not enough experience to breakthrough.");
    return;
  }

  player.xp = 0;
  player.maxXP *= 1.4;
  resources.spiritStones += 10;
  player.realm = getNewRealm();
  document.getElementById("realm").innerText = player.realm;
  showModal("Breakthrough successful!");
  updateUI();
}

function getNewRealm() {
  const realms = [
    "Mortal I", "Mortal II", "Mortal III", "Qi Gathering I",
    "Qi Gathering II", "Foundation Establishment", "Core Formation",
    "Nascent Soul", "Soul Transformation", "Immortal Ascension"
  ];
  const currentIndex = realms.indexOf(player.realm);
  return realms[currentIndex + 1] || player.realm;
}

// SELECT REGION
function selectRegion(regionName) {
  showModal(`You entered the region: ${regionName}`);
  document.querySelector(".world-map").style.filter = "brightness(1.1)";
}

// UI & MODAL HELPERS
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
  document.getElementById("physique").innerText = player.physique;

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
}

window.onload = () => {
  document.getElementById("modal").classList.remove("hidden");
};
