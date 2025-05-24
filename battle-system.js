// battle-system.js

// Battle UI should be toggled via `toggleBattle()` and called from HTML

const battleEnemies = [
  { name: "Feral Tiger", rarity: "Common", baseStats: { health: 80, strength: 18, speed: 12 } },
  { name: "Stone-Scaled Serpent", rarity: "Common", baseStats: { health: 100, strength: 15, speed: 10 } },
  { name: "Howling Wind Wolf", rarity: "Uncommon", baseStats: { health: 70, strength: 20, speed: 18 } },
  { name: "Ironback Boar", rarity: "Uncommon", baseStats: { health: 120, strength: 25, speed: 8 } },
  { name: "Thunderclaw Eagle", rarity: "Uncommon", baseStats: { health: 85, strength: 22, speed: 25 } },
  { name: "Flametail Fox", rarity: "Rare", baseStats: { health: 90, strength: 20, speed: 22 } },
  { name: "Azure Mist Toad", rarity: "Rare", baseStats: { health: 140, strength: 18, speed: 6 } },
  { name: "Blackspine Panther", rarity: "Rare", baseStats: { health: 110, strength: 27, speed: 24 } },
  { name: "Crimson Bone Vulture", rarity: "Epic", baseStats: { health: 95, strength: 30, speed: 20 } },
  { name: "Voidscale Dragonling", rarity: "Epic", baseStats: { health: 150, strength: 35, speed: 28 } }
];

const rarityModifiers = {
  Common: { xp: 1.0, dropChance: 0.25 },
  Uncommon: { xp: 1.5, dropChance: 0.5 },
  Rare: { xp: 2.0, dropChance: 0.75 },
  Epic: { xp: 3.0, dropChance: 1.0 }
};

function toggleBattle() {
  document.getElementById("center-content").classList.add("hidden");
  document.getElementById("inventory-panel").classList.add("hidden");
  document.getElementById("battle-panel").classList.remove("hidden");
}

function startBattle() {
  const log = document.getElementById("battle-log");
  log.innerHTML = "";

  const enemy = getRandomEnemyFromList();
  appendLog(`<strong>⚔️ ${enemy.name} (${enemy.rarity}) appears!</strong>`);

  const imageBox = document.getElementById("enemy-image");
  imageBox.innerHTML = `<img src='assets/enemies/${slug(enemy.name)}.png' alt='${enemy.name}' class='enemy-pic'/>`;

  let playerHP = player.stats.health;
  let enemyHP = enemy.health;

  const interval = setInterval(() => {
    if (Math.random() < player.stats.speed / 100) {
      enemyHP -= player.stats.strength;
      appendLog(`<span class='battle-hit'>You dealt ${player.stats.strength} damage!</span>`);
    }

    if (enemyHP <= 0) {
      clearInterval(interval);
      appendLog(`<strong class='battle-drop'>🎉 You defeated the ${enemy.name}!</strong>`);

      const mod = rarityModifiers[enemy.rarity];
      const gold = Math.floor(Math.random() * 20 * mod.xp);
      const stones = Math.floor(Math.random() * 5 * mod.xp);
      appendLog(`💰 Gained ${gold} gold and ${stones} spirit stones.`);

      if (Math.random() < mod.dropChance) {
        const loot = inventoryItems[Math.floor(Math.random() * inventoryItems.length)];
        appendLog(`📦 Looted: <em>${loot.name}</em>`);
        // You can push this to player.inventory = [] if using one
      }
      return;
    }

    if (Math.random() < enemy.speed / 100) {
      playerHP -= enemy.strength;
      appendLog(`<span class='battle-hit'>${enemy.name} hits you for ${enemy.strength} damage!</span>`);
    }

    if (playerHP <= 0) {
      clearInterval(interval);
      appendLog(`<span class='battle-hit'>💀 You were defeated by the ${enemy.name}...</span>`);
    }
  }, 1000);
}

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

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function appendLog(html) {
  const log = document.getElementById("battle-log");
  const line = document.createElement("p");
  line.innerHTML = html;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}
