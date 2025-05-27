const cultivationBookPool = [
  // 🔥 FIRE
  {
    name: "Flame Sutra", element: "Fire", rarity: "Common",
    baseQiBoost: 0.20, baseDmgBoost: 0.10, qiPerLevel: 0.005, dmgPerLevel: 0.005,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Blazing Heart Codex", element: "Fire", rarity: "Rare",
    baseQiBoost: 0.40, baseDmgBoost: 0.20, qiPerLevel: 0.01, dmgPerLevel: 0.01,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "True Phoenix Scripture", element: "Fire", rarity: "Legendary",
    baseQiBoost: 0.80, baseDmgBoost: 0.40, qiPerLevel: 0.02, dmgPerLevel: 0.02,
    proficiencyLevel: 1, proficiencyProgress: 0
  },

  // 💧 WATER
  {
    name: "Flowing River Manual", element: "Water", rarity: "Common",
    baseQiBoost: 0.20, baseDmgBoost: 0.10, qiPerLevel: 0.005, dmgPerLevel: 0.005,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Oceanic Pulse Codex", element: "Water", rarity: "Rare",
    baseQiBoost: 0.40, baseDmgBoost: 0.20, qiPerLevel: 0.01, dmgPerLevel: 0.01,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Abyssal Dragon Scripture", element: "Water", rarity: "Legendary",
    baseQiBoost: 0.80, baseDmgBoost: 0.40, qiPerLevel: 0.02, dmgPerLevel: 0.02,
    proficiencyLevel: 1, proficiencyProgress: 0
  },

  // 🌪️ WIND
  {
    name: "Windstep Technique", element: "Wind", rarity: "Common",
    baseQiBoost: 0.20, baseDmgBoost: 0.10, qiPerLevel: 0.005, dmgPerLevel: 0.005,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Sky Piercer Codex", element: "Wind", rarity: "Rare",
    baseQiBoost: 0.40, baseDmgBoost: 0.20, qiPerLevel: 0.01, dmgPerLevel: 0.01,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Heavenly Cyclone Scripture", element: "Wind", rarity: "Legendary",
    baseQiBoost: 0.80, baseDmgBoost: 0.40, qiPerLevel: 0.02, dmgPerLevel: 0.02,
    proficiencyLevel: 1, proficiencyProgress: 0
  },

  // 🪨 EARTH
  {
    name: "Stone Vein Manual", element: "Earth", rarity: "Common",
    baseQiBoost: 0.20, baseDmgBoost: 0.10, qiPerLevel: 0.005, dmgPerLevel: 0.005,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Mountain Forge Codex", element: "Earth", rarity: "Rare",
    baseQiBoost: 0.40, baseDmgBoost: 0.20, qiPerLevel: 0.01, dmgPerLevel: 0.01,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Imperial Terra Scripture", element: "Earth", rarity: "Legendary",
    baseQiBoost: 0.80, baseDmgBoost: 0.40, qiPerLevel: 0.02, dmgPerLevel: 0.02,
    proficiencyLevel: 1, proficiencyProgress: 0
  },

  // 🌳 WOOD
  {
    name: "Verdant Leaf Technique", element: "Wood", rarity: "Common",
    baseQiBoost: 0.20, baseDmgBoost: 0.10, qiPerLevel: 0.005, dmgPerLevel: 0.005,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Emerald Vine Codex", element: "Wood", rarity: "Rare",
    baseQiBoost: 0.40, baseDmgBoost: 0.20, qiPerLevel: 0.01, dmgPerLevel: 0.01,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Ancient Tree Scripture", element: "Wood", rarity: "Legendary",
    baseQiBoost: 0.80, baseDmgBoost: 0.40, qiPerLevel: 0.02, dmgPerLevel: 0.02,
    proficiencyLevel: 1, proficiencyProgress: 0
  },

  // 🌑 DARK
  {
    name: "Shaded Path Manual", element: "Dark", rarity: "Common",
    baseQiBoost: 0.20, baseDmgBoost: 0.10, qiPerLevel: 0.005, dmgPerLevel: 0.005,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Nether Veil Codex", element: "Dark", rarity: "Rare",
    baseQiBoost: 0.40, baseDmgBoost: 0.20, qiPerLevel: 0.01, dmgPerLevel: 0.01,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Shadow Immortal Scripture", element: "Dark", rarity: "Legendary",
    baseQiBoost: 0.80, baseDmgBoost: 0.40, qiPerLevel: 0.02, dmgPerLevel: 0.02,
    proficiencyLevel: 1, proficiencyProgress: 0
  },

  // 🌞 LIGHT
  {
    name: "Radiant Flow Manual", element: "Light", rarity: "Common",
    baseQiBoost: 0.20, baseDmgBoost: 0.10, qiPerLevel: 0.005, dmgPerLevel: 0.005,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Sunburst Codex", element: "Light", rarity: "Rare",
    baseQiBoost: 0.40, baseDmgBoost: 0.20, qiPerLevel: 0.01, dmgPerLevel: 0.01,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Celestial Radiance Scripture", element: "Light", rarity: "Legendary",
    baseQiBoost: 0.80, baseDmgBoost: 0.40, qiPerLevel: 0.02, dmgPerLevel: 0.02,
    proficiencyLevel: 1, proficiencyProgress: 0
  },

  // 🐉 BEAST
  {
    name: "Beastbone Technique", element: "Beast", rarity: "Common",
    baseQiBoost: 0.20, baseDmgBoost: 0.10, qiPerLevel: 0.005, dmgPerLevel: 0.005,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Savage Path Codex", element: "Beast", rarity: "Rare",
    baseQiBoost: 0.40, baseDmgBoost: 0.20, qiPerLevel: 0.01, dmgPerLevel: 0.01,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Divine Beast Scripture", element: "Beast", rarity: "Legendary",
    baseQiBoost: 0.80, baseDmgBoost: 0.40, qiPerLevel: 0.02, dmgPerLevel: 0.02,
    proficiencyLevel: 1, proficiencyProgress: 0
  },

  // ☯️ CHAOS
  {
    name: "Chaotic Meridian Manual", element: "Chaos", rarity: "Common",
    baseQiBoost: 0.20, baseDmgBoost: 0.10, qiPerLevel: 0.005, dmgPerLevel: 0.005,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Eternal Void Codex", element: "Chaos", rarity: "Rare",
    baseQiBoost: 0.40, baseDmgBoost: 0.20, qiPerLevel: 0.01, dmgPerLevel: 0.01,
    proficiencyLevel: 1, proficiencyProgress: 0
  },
  {
    name: "Primordial Chaos Scripture", element: "Chaos", rarity: "Legendary",
    baseQiBoost: 0.80, baseDmgBoost: 0.40, qiPerLevel: 0.02, dmgPerLevel: 0.02,
    proficiencyLevel: 1, proficiencyProgress: 0
  }
];
