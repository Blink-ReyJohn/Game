let xp = 0;
const maxXP = 12.5;
let age = 21;

function updateUI() {
  document.getElementById("xp-bar").style.width = (xp / maxXP) * 100 + "%";
  document.getElementById("age").innerText = age;
}

function startCultivating() {
  if (xp < maxXP) {
    xp += 1.5;
    age += 1;
    updateUI();
  } else {
    alert("You are ready to Breakthrough!");
  }
}

function reinforce() {
  alert("Reinforce activated. (Future Feature)");
}

function breakthrough() {
  if (xp >= maxXP) {
    xp = 0;
    alert("Breakthrough successful! Advancing stage...");
    // Add more logic here
  } else {
    alert("Not enough XP to breakthrough.");
  }
}

updateUI();
