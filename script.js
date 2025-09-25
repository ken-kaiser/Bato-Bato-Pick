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

// --------- DOM & Game setup ----------
const game = new RockPaperScissors('User1');
const userScore_span = document.getElementById("user_score");
const computerScore_span = document.getElementById("computer_score");
const resultText_p = document.getElementById("result_text");
const reset_btn = document.querySelector("#reset");
const rock_div = document.getElementById("rock");
const paper_div = document.getElementById("paper");
const scissor_div = document.getElementById("scissor");

// --------- Audio setup (preload + safe play) ----------
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

// --------- Game Over flag ----------
let gameOver = false;
let maxScore = 5;

const gameLevelSelect = document.getElementById("game_level");
if (gameLevelSelect) {
  gameLevelSelect.addEventListener("change", () => {
    maxScore = parseInt(gameLevelSelect.value, 10);
    reset_function(); // reset game when level changes
  });
}

// --------- Reset function ----------
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

// --------- Animation + play flow ----------
function animateChoice(choiceDiv, userSelection) {
  if (gameOver) return; // stop playing if game is over

  safePlay(clickSound);
  choiceDiv.classList.add("shake");

  setTimeout(() => {
    choiceDiv.classList.remove("shake");

    const winner = game.play(userSelection);
    userScore_span.innerHTML = game.score.user;
    computerScore_span.innerHTML = game.score.cpu;

    setTimeout(() => {
      if (winner === 'user') safePlay(winSound);
      else if (winner === 'cpu') safePlay(loseSound);
    }, 120);

    // Check for Game Over
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
  }, 600);
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
      const advice = `Arcade Tip: ${data.slip.advice}`;
      resultText_p.innerHTML += `<br><small>${advice}</small>`;
      resultText_p.style.fontSize = "0.9rem";
      resultText_p.style.lineHeight = "1.4";
    })
    .catch(err => {
      console.warn("Advice API error:", err);
    });
}
