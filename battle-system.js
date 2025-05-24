let currentBattleInterval;
let currentEnemy;
let playerCurrentHP;
let currentEnemyHP;
let currentEnemyMax;

// Start battle
function startBattle() {
  const log = document.getElementById("battle-log");
  log.innerHTML = "";

  currentEnemy = getRandomEnemyFromList();
  appendLog(`<strong>⚔️ ${currentEnemy.name} (${currentEnemy.rarity}) appears!</strong>`);

  const imageBox = document.getElementById("enemy-image");
  imageBox.innerHTML = `
    <img 
      src="https://raw.githubusercontent.com/Blink-ReyJohn/Game/main/assets/enemies/${slug(currentEnemy.name)}.png"
      alt="${currentEnemy.name}"
      class="enemy-pic"
      onerror="this.onerror=null;this.src='https://upload.wikimedia.org/wikipedia/commons/5/55/Question_Mark.svg';"
    />
  `;

  // Ensure stats are valid
  if (!player.stats || !player.stats.health || !player.stats.strength) {
    calculateStats();
  }

  playerCurrentHP = player.stats.health;
  currentEnemyHP = currentEnemy.health;
  currentEnemyMax = currentEnemy.health;

  updateHPBars(playerCurrentHP, currentEnemyHP, player.stats.health, currentEnemyMax);

  const speedFactor = 1 - (player.subRealmIndex * 0.005);
  const intervalSpeed = Math.max(300, 1000 * speedFactor);

  currentBattleInterval = setInterval(() => {
    // Player Turn
    const crit = Math.random() < 0.2;
    const damage = crit ? Math.floor(player.stats.strength * 1.5) : player.stats.strength;
    currentEnemyHP -= damage;
    appendLog(`<span class='battle-hit'>You dealt ${damage} damage${crit ? " (CRIT!)" : ""}</span>`);
    showFloatingText(`-${damage}`, true);

    if (currentEnemyHP <= 0) {
      clearInterval(currentBattleInterval);
      appendLog(`<strong class='battle-drop'>🎉 You defeated the ${currentEnemy.name}!</strong>`);

      const mod = rarityModifiers[currentEnemy.rarity];
      const gold = Math.floor(Math.random() * 20 * mod.xp);
      const stones = Math.floor(Math.random() * 5 * mod.xp);
      player.gold += gold;
      player.spiritStones += stones;
      appendLog(`💰 Gained ${gold} gold and ${stones} spirit stones.`);

      if (Math.random() < mod.dropChance) {
        const loot = inventoryItems[Math.floor(Math.random() * inventoryItems.length)];
        player.inventory.push(loot);
        appendLog(`📦 Looted: <em>${loot.name}</em>`);
      }

      updateHPBars(0, 0, player.stats.health, currentEnemyMax);
      updateUI();
      savePlayerData();
      return;
    }

    // Enemy Turn
    const enemyDamage = currentEnemy.strength;
    playerCurrentHP -= enemyDamage;
    appendLog(`<span class='battle-hit'>${currentEnemy.name} hits you for ${enemyDamage}!</span>`);
    showFloatingText(`-${enemyDamage}`, false);

    if (playerCurrentHP <= 0) {
      clearInterval(currentBattleInterval);
      appendLog(`<span class='battle-hit'>💀 You were defeated by the ${currentEnemy.name}...</span>`);
    }

    updateHPBars(playerCurrentHP, currentEnemyHP, player.stats.health, currentEnemyMax);
  }, intervalSpeed);
}


// Update HP bars
function updateHPBars(pHP, eHP, pMax, eMax) {
  document.getElementById("player-hp-bar").style.width = `${Math.max(0, (pHP / pMax) * 100)}%`;
  document.getElementById("enemy-hp-bar").style.width = `${Math.max(0, (eHP / eMax) * 100)}%`;
}

// Floating damage text
function showFloatingText(text, isEnemy = true) {
  const el = document.createElement("div");
  el.textContent = text;
  el.className = "floating-damage";
  el.style.left = isEnemy ? "60%" : "20%";
  el.style.top = "120px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// Heal mid-battle
function healInBattle() {
  const healAmount = Math.floor(player.stats.health * 0.3);
  playerCurrentHP = Math.min(player.stats.health, playerCurrentHP + healAmount);
  appendLog(`<span class='battle-heal'>🧪 You healed for ${healAmount} HP!</span>`);
  updateHPBars(playerCurrentHP, currentEnemyHP, player.stats.health, currentEnemyMax);
}

// Run from battle
function runFromBattle() {
  appendLog("<span class='battle-run'>🏃‍♂️ You ran away safely!</span>");
  clearInterval(currentBattleInterval);
  document.getElementById("battle-panel").classList.add("hidden");
  document.getElementById("center-content").classList.remove("hidden");
}

// Enemy rarity scaling
const rarityModifiers = {
  Common: { xp: 1, dropChance: 0.2 },
  Rare: { xp: 2, dropChance: 0.4 },
  Epic: { xp: 3, dropChance: 0.6 },
  Legendary: { xp: 5, dropChance: 0.8 }
};

// Enemy list
const battleEnemies = [
  { name: "Feral Tiger", rarity: "Common", baseStats: { health: 80, strength: 10, speed: 12 } },
  { name: "Stone-Scaled Serpent", rarity: "Common", baseStats: { health: 100, strength: 8, speed: 10 } },
  { name: "Howling Wind Wolf", rarity: "Rare", baseStats: { health: 120, strength: 15, speed: 18 } },
  { name: "Ironback Boar", rarity: "Common", baseStats: { health: 130, strength: 14, speed: 8 } },
  { name: "Thunderclaw Eagle", rarity: "Rare", baseStats: { health: 110, strength: 16, speed: 20 } },
  { name: "Flametail Fox", rarity: "Rare", baseStats: { health: 105, strength: 14, speed: 22 } },
  { name: "Azure Mist Toad", rarity: "Common", baseStats: { health: 150, strength: 10, speed: 6 } },
  { name: "Blackspine Panther", rarity: "Epic", baseStats: { health: 160, strength: 22, speed: 25 } },
  { name: "Crimson Bone Vulture", rarity: "Epic", baseStats: { health: 170, strength: 24, speed: 20 } },
  { name: "Voidscale Dragonling", rarity: "Legendary", baseStats: { health: 200, strength: 30, speed: 28 } }
];

// Enemy generator
function getRandomEnemyFromList() {
  const base = battleEnemies[Math.floor(Math.random() * battleEnemies.length)];
  const variance = 0.2;
  const scale = 1 + (Math.random() * variance * 2 - variance);
  return {
    name: base.name,
    rarity: base.rarity,
    health: Math.round(base.baseStats.health * scale),
    strength: Math.round(base.baseStats.strength * scale),
    speed: Math.round(base.baseStats.speed * scale)
  };
}

// Slugify name for image filenames
function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Log appender
function appendLog(html) {
  const log = document.getElementById("battle-log");
  const line = document.createElement("p");
  line.innerHTML = html;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}
