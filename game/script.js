import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];

console.log(rightGuessString);

function initBoard() {
  let board = document.getElementById("game-board");
  board.innerHTML = "";

  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < 5; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }

    board.appendChild(row);
  }
}

function resetGame() {
  document.getElementById('restart-button').blur() // remove focus
  guessesRemaining = NUMBER_OF_GUESSES;
  currentGuess = [];
  nextLetter = 0;
  rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
  initBoard();
  resetKeyboard();
  removeVictoryMessage();
}

function resetKeyboard() {
  const keys = document.getElementsByClassName("keyboard-button");
  for (const key of keys) {
    key.style.backgroundColor = "";
  }
}

function removeVictoryMessage() {
  const victoryMessage = document.getElementById("victory-message");
  if (victoryMessage) {
    victoryMessage.remove();
  }
}

initBoard();

document.addEventListener("keyup", (e) => {
  if (guessesRemaining === 0) {
    return;
  }

  let pressedKey = String(e.key);
  if (pressedKey === "Backspace" && nextLetter !== 0) {
    deleteLetter();
    return;
  }

  if (pressedKey === "Enter") {
    checkGuess();
    return;
  }

  let found = pressedKey.match(/[a-z]/gi);
  if (!found || found.length > 1) {
    return;
  } else {
    insertLetter(pressedKey);
  }
});

function insertLetter(pressedKey) {
  if (nextLetter === 5) {
    return;
  }
  pressedKey = pressedKey.toLowerCase();

  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let box = row.children[nextLetter];
  animateCSS(box, "pulse");
  box.textContent = pressedKey;
  box.classList.add("filled-box");
  currentGuess.push(pressedKey);
  nextLetter += 1;


}

function deleteLetter() {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let box = row.children[nextLetter - 1];
  box.textContent = "";
  box.classList.remove("filled-box");
  currentGuess.pop();
  nextLetter -= 1;
}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = elem.style.backgroundColor;
      if (oldColor === "var(--green)") {
        return;
      }

      if (oldColor === "var(--yellow)" && color !== "var(--green)") {
        return;
      }

      elem.style.backgroundColor = color;
      break;
    }
  }
}

// Dict API
function checkWordValidity(word) {
  return fetch("https://api.api-ninjas.com/v1/dictionary?word=" + word, {
    headers: {
      "X-Api-Key": "yd6ElLtR6oE2QUrhS5pt6w==IZfTQ4nYiCx1Cfjz",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => data.valid)
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error,
      );
    });
}

async function checkGuess() {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let guessString = "";
  let rightGuess = Array.from(rightGuessString);

  for (const val of currentGuess) {
    guessString += val;
  }

  if (guessString.length != 5) {
    showPopupMessage("Not enough letters!", "error");
    return;
  }

  let isValid = await checkWordValidity(guessString);
  if (!isValid) {
    showPopupMessage("INVALID WORD", "error");
    return;
  }

  for (let i = 0; i < 5; i++) {
    let letterColor = "";
    let box = row.children[i];
    let letter = currentGuess[i];

    let letterPosition = rightGuess.indexOf(currentGuess[i]);
    if (letterPosition === -1) {
      letterColor = "var(--grey)";
      box.classList.add("shake");
    } else {
      if (currentGuess[i] === rightGuess[i]) {
        letterColor = "var(--green)";
        box.classList.add("bounce");
      } else {
        letterColor = "var(--yellow)";
        box.classList.add("shake");
      }

      rightGuess[letterPosition] = "#";
    }

    let delay = 250 * i;
    setTimeout(() => {
      animateCSS(box, "flipInX");
      box.style.backgroundColor = letterColor;
      shadeKeyBoard(letter, letterColor);

      setTimeout(() => {
        box.classList.remove("shake");
        box.classList.remove("bounce");
      }, 1000);
    }, delay);
  }

  if (guessString === rightGuessString) {
    guessesRemaining = 0;
    showVictoryMessage();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
    });
    return;
  } else {
    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 0) {
      showPopupMessage(`The right word was: "${rightGuessString}"`, "info");
    }
  }
}

function showVictoryMessage() {
  const victoryMessage = document.createElement("div");
  victoryMessage.id = "victory-message";
  victoryMessage.textContent = "Congratulations! \n You win!";
  document.body.appendChild(victoryMessage);

  animateCSS(victoryMessage, "bounceIn");
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target;

  if (!target.classList.contains("keyboard-button")) {
    return;
  }
  let key = target.textContent;

  if (key === "Del") {
    key = "Backspace";
  }

  document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));

  target.blur(); // remove focus from clicked button
});

const animateCSS = (element, animation, prefix = "animate__") =>
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = element;
    node.style.setProperty("--animate-duration", "0.3s");

    node.classList.add(`${prefix}animated`, animationName);

    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });

const restartButton = document.createElement("button");
restartButton.id = "restart-button";
restartButton.addEventListener("click", resetGame);
document.body.appendChild(restartButton);

// Popup message
function showPopupMessage(message, type) {
  const popup = document.createElement('div');
  popup.className = `popup-message ${type}`;
  popup.textContent = message;
  document.body.appendChild(popup);

   // Start the fade-out transition after 5 seconds
   setTimeout(() => {
    popup.style.opacity = 0;
    // Remove the popup after the transition is complete
    setTimeout(() => {
      popup.remove();
    }, 2000);
  }, 1000);
}
//pop-up window how to play

const popupContainer = document.getElementById('popupContainer');
const popupContent = document.getElementById('popupContent');
popupContainer.addEventListener('mouseover', function () {
  popupContent.style.display = 'block';
});
popupContainer.addEventListener('mouseout', function () {
  popupContent.style.display = 'none';
});


document.getElementById('theme-toggle').addEventListener('change', function() {
  document.documentElement.classList.toggle('dark-mode');
});


