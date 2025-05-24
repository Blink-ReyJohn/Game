let player = {
  name: "",
  age: 21,
  talent: 0,
  physique: "Unknown",
  stats: { health: 0, strength: 0, qi: 0, speed: 0 },
  xp: 0,
  maxXP: 12.5,
  region: "None",
  cultivating: false
};

let resources = {
  spiritStones: 0,
  knowledge: 0
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

function submitName() {
  const name = document.getElementById("player-name-input").value.trim();
  if (!name) return;
  player.name = name;
  document.getElementById("modal-text").innerText = "Rolling Talent and Physique...";
  document.getElementById("player-name-input").remove();
  document.querySelector("#modal .modal-content button").innerText = "Roll";

  document.querySelector("#modal .modal-content button").onclick = rollStats;
}

function rollStats() {
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

  document.getElementById("modal").classList.add("hidden");
  document.getElementById("game-container").classList.remove("hidden");

  startAgeTimer();
  updateUI();
}

function startAgeTimer() {
  ageTimer = setInterval(() => {
    player.age++;
    document.getElementById("player-age").innerText = `Age: ${player.age}`;
  }, 30000); // 30s per year
}

function toggleCultivation() {
  player.cultivating = !player.cultivating;
  document.getElementById("cultivate-btn").innerText = player.cultivating ? "Stop Cultivating" : "Start Cultivating";

  if (player.cultivating) {
    cultivationInterval = setInterval(() => {
      player.xp += 1 + player.talent / 10;
      resources.spiritStones += 1;
      resources.knowledge += 0.5;
      updateUI();
    }, 3000); // cultivate every 3 seconds
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
  resources.spiritStones += 10;
  showModal("Breakthrough successful!");
  updateUI();
}

function showModal(message) {
  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");
  modal.innerHTML = `<div class="modal-content"><p>${message}</p><button onclick="closeModal()">OK</button></div>`;
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function selectRegion(regionName) {
  player.region = regionName;
  document.querySelector(".world-map").style.filter = "brightness(1.1)";
  showModal(`You entered the region: ${regionName}`);
}

function updateUI() {
  document.getElementById("player-name").innerText = player.name;
  document.getElementById("player-age").innerText = `Age: ${player.age}`;
  document.getElementById("talent").innerText = player.talent;
  document.getElementById("physique").innerText = player.physique;

  document.getElementById("health").innerText = player.stats.health;
  document.getElementById("strength").innerText = player.stats.strength;
  document.getElementById("qi").innerText = player.stats.qi;
  document.getElementById("speed").innerText = player.stats.speed;

  document.getElementById("spirit-stones").innerText = Math.floor(resources.spiritStones);
  document.getElementById("knowledge").innerText = Math.floor(resources.knowledge);
}

window.onload = () => {
  document.getElementById("modal").classList.remove("hidden");
};
