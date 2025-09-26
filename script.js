// -------------------------
// Bato-Bato Pick - script
// Audio-safe version with debug + shake animation + first-to-5 mode
// -------------------------

class RockPaperScissors {
  constructor(username) {
    this.username = username;
    this.score = { user: 0, cpu: 0 };
  }

  generateCPUResponse() {
    const options = ['Bato', 'Papel', 'Gunting'];
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }

  determineWinner(userSelection, cpuSelection) {
    if (userSelection === cpuSelection) {
      resultText_p.innerHTML = `User: ${userSelection} | CPU: ${cpuSelection} → Tabla!`;
      return 'draw';
    } else if (
      (userSelection === 'Bato' && cpuSelection === 'Gunting') ||
      (userSelection === 'Gunting' && cpuSelection === 'Papel') ||
      (userSelection === 'Papel' && cpuSelection === 'Bato')
    ) {
      resultText_p.innerHTML = `User: ${userSelection} | CPU: ${cpuSelection} → You Win!`;
      return 'user';
    } else {
      resultText_p.innerHTML = `User: ${userSelection} | CPU: ${cpuSelection} → CPU Wins!`;
      return 'cpu';
    }
  }

  play(userSelection) {
    const cpuSelection = this.generateCPUResponse();
    console.log("CPU Selection:", cpuSelection);
    const winner = this.determineWinner(userSelection, cpuSelection);

    if (winner === 'user') this.score.user++;
    if (winner === 'cpu') this.score.cpu++;

    return winner;
  }
}

// DOM & Game setup 
const game = new RockPaperScissors('User1');
const userScore_span = document.getElementById("user_score");
const computerScore_span = document.getElementById("computer_score");
const resultText_p = document.getElementById("result_text");
const reset_btn = document.querySelector("#reset");
const rock_div = document.getElementById("rock");
const paper_div = document.getElementById("paper");
const scissor_div = document.getElementById("scissor");

// Audio setup (preload + safe play)
const clickSound = new Audio('sounds/click.mp3');
clickSound.preload = 'auto';
const winSound = new Audio('sounds/win.mp3');
winSound.preload = 'auto';
const loseSound = new Audio('sounds/lose.mp3');
loseSound.preload = 'auto';

// optional: adjust volumes
clickSound.volume = 0.8;
winSound.volume = 0.9;
loseSound.volume = 0.9;

function safePlay(audio) {
  if (!audio) return;
  try {
    audio.currentTime = 0; // rewind so it can be replayed immediately
    const p = audio.play();
    if (p !== undefined) {
      p.catch(err => {
        console.warn("Audio play failed (ignored):", err);
      });
    }
  } catch (err) {
    console.warn("safePlay error:", err);
  }
}

// Game Over flag 
let gameOver = false;
let maxScore = 5;

const gameLevelSelect = document.getElementById("game_level");
if (gameLevelSelect) {
  gameLevelSelect.addEventListener("change", () => {
    maxScore = parseInt(gameLevelSelect.value, 10);
    reset_function(); // reset game when level changes
  });
}

// Reset function 
reset_btn.addEventListener("click", reset_function, false);
function reset_function() {
  game.score.user = 0;
  game.score.cpu = 0;
  userScore_span.innerHTML = game.score.user;
  computerScore_span.innerHTML = game.score.cpu;
  resultText_p.innerHTML = "To begin choose Bato, Papel or Gunting";
  resultText_p.style.textShadow = "none"; // reset glow
  gameOver = false; // reset Game Over state
}

// Animation + play flow 
function animateChoice(choiceDiv, userSelection) {
  if (gameOver) return;

  const battleModal = document.getElementById("battleModal");
  const chantText = document.getElementById("chantText");
  const userHand = document.querySelector(".user-hand");
  const cpuHand = document.querySelector(".cpu-hand");

  // Reset to fists + animations
  userHand.style.backgroundImage = 'url("./images/rock.png")';
  cpuHand.style.backgroundImage = 'url("./images/rock.png")';
  userHand.style.animation = "fist-bump 0.5s infinite alternate";
  cpuHand.style.animation = "fist-bump 0.5s infinite alternate";

  // Show modal
  battleModal.style.display = "block";

  // Chant sequence
  const chant = ["Bato...", "Bato...", "Pick!"];
  let i = 0;

  // Show first chant immediately
  chantText.textContent = chant[i];
  i++;

  const chantInterval = setInterval(() => {
    chantText.textContent = chant[i];
    i++;
    if (i === chant.length) {
      clearInterval(chantInterval);

      // Reveal choices after short pause
      setTimeout(() => {
        const cpuSelection = game.generateCPUResponse();

        // Update hands to final choices
        if (userSelection === "Bato") userHand.style.backgroundImage = 'url("./images/rock.png")';
        if (userSelection === "Papel") userHand.style.backgroundImage = 'url("./images/paper.png")';
        if (userSelection === "Gunting") userHand.style.backgroundImage = 'url("./images/scissor.png")';

        if (cpuSelection === "Bato") cpuHand.style.backgroundImage = 'url("./images/rock.png")';
        if (cpuSelection === "Papel") cpuHand.style.backgroundImage = 'url("./images/paper.png")';
        if (cpuSelection === "Gunting") cpuHand.style.backgroundImage = 'url("./images/scissor.png")';

        // Stop animations
        userHand.style.animation = "none";
        cpuHand.style.animation = "none";

        // Close modal + continue game
        setTimeout(() => {
          battleModal.style.display = "none";

          const winner = game.determineWinner(userSelection, cpuSelection);
          if (winner === "user") game.score.user++;
          if (winner === "cpu") game.score.cpu++;

          userScore_span.innerHTML = game.score.user;
          computerScore_span.innerHTML = game.score.cpu;

          if (winner === "user") safePlay(winSound);
          else if (winner === "cpu") safePlay(loseSound);

          // Game Over check
          if (game.score.user === maxScore || game.score.cpu === maxScore) {
            gameOver = true;
            if (game.score.user === maxScore) {
              resultText_p.innerHTML = `Daog Ka! (First to ${maxScore})`;
            } else {
              resultText_p.innerHTML = `Daog ang CPU! (First to ${maxScore})`;
            }
            resultText_p.style.textShadow = "0 0 10px gold, 0 0 20px red, 0 0 40px orange";
            fetchArcadeAdvice();
          }

        }, 1000);
      }, 800);
    }
  }, 800); // Chant speed
}

// --------- Attach handlers ----------
rock_div.addEventListener('click', () => animateChoice(rock_div, 'Bato'));
paper_div.addEventListener('click', () => animateChoice(paper_div, 'Papel'));
scissor_div.addEventListener('click', () => animateChoice(scissor_div, 'Gunting'));

// --------- Background music setup ----------
document.addEventListener('DOMContentLoaded', () => {
  const bgMusic = document.getElementById('bg-music');
  const toggleMusicBtn = document.getElementById('toggle-music');

  if (!bgMusic) {
    console.warn('No #bg-music element found — music disabled');
    if (toggleMusicBtn) toggleMusicBtn.style.display = 'none';
    return;
  }

  bgMusic.volume = 0.3;

  toggleMusicBtn?.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        toggleMusicBtn.textContent = '🔊 Music On';
      }).catch(err => {
        console.warn('Play prevented or failed:', err);
      });
    } else {
      bgMusic.pause();
      toggleMusicBtn.textContent = '🔇 Music Off';
    }
  });
});

// Instructions Modal Logic
const instructionsBtn = document.getElementById("instructionsBtn");
const instructionsModal = document.getElementById("instructionsModal");
const closeModal = document.getElementById("closeModal");

instructionsBtn.addEventListener("click", () => {
  instructionsModal.style.display = "block";
});

closeModal.addEventListener("click", () => {
  instructionsModal.style.display = "none";
});

// Close modal when clicking outside content
window.addEventListener("click", (e) => {
  if (e.target === instructionsModal) {
    instructionsModal.style.display = "none";
  }
});

// Intro Modal Logic
const introModal = document.getElementById("introModal");
const closeIntro = document.getElementById("closeIntro");

// Arcade Tip Modal Logic
const tipModal = document.getElementById("tipModal");
const tipText = document.getElementById("tipText");
const closeTip = document.getElementById("closeTip");

closeTip.addEventListener("click", () => {
  tipModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === tipModal) {
    tipModal.style.display = "none";
  }
});

// Show intro modal on page load
window.addEventListener("load", () => {
  introModal.style.display = "block";
});

// Close intro modal
closeIntro.addEventListener("click", () => {
  introModal.style.display = "none";
});

// Fetch API
function fetchArcadeAdvice() {
  fetch("https://api.adviceslip.com/advice")
    .then(res => res.json())
    .then(data => {
      tipText.textContent = data.slip.advice;
      tipModal.style.display = "block";
    })
    .catch(err => {
      console.warn("Advice API error:", err);
    });
}

// Theme Switcher Logic
const themes = ["default", "neon-blue", "cyberpunk", "retro-green"]; 
let currentTheme = 0;
const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {
  
  if (themes[currentTheme] !== "default") {
    document.body.classList.remove(themes[currentTheme]);
  }
  // switch to next theme
  currentTheme = (currentTheme + 1) % themes.length;

  if (themes[currentTheme] !== "default") {
    document.body.classList.add(themes[currentTheme]);
  }

  console.log("Theme switched to:", themes[currentTheme]);
});