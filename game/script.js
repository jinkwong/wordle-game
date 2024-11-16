import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
const WORD_LENGTH = 5;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
console.log(rightGuessString);

function initBoard() {
  let board = document.getElementById("game-board");
  board.innerHTML = ""; // 清空遊戲板

  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < WORD_LENGTH; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }

    board.appendChild(row);
  }
}

function resetGame() {
  guessesRemaining = NUMBER_OF_GUESSES;
  currentGuess = [];
  nextLetter = 0;
  rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
  initBoard();
  resetKeyboard();
}

function resetKeyboard() {
  const keys = document.getElementsByClassName("keyboard-button");
  for (const key of keys) {
    key.style.backgroundColor = "";
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
  if (nextLetter === WORD_LENGTH) {
    return;
  }
  pressedKey = pressedKey.toLowerCase();

  let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
  let box = row.children[nextLetter];
  animateCSS(box, "pulse");
  box.textContent = pressedKey;
  box.classList.add("filled-box");
  currentGuess.push(pressedKey);
  nextLetter += 1;
}

function deleteLetter() {
  let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
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
      if (oldColor === 'var(--green)') {
        return;
      }

      if (oldColor === 'var(--yellow)' && color !== 'var(--green)') {
        return;
      }

      elem.style.backgroundColor = color;
      break;
    }
  }
}

function checkWordValidity(word) {
  return fetch('https://api.api-ninjas.com/v1/dictionary?word=' + word, {
    headers: {
      'X-Api-Key': 'yd6ElLtR6oE2QUrhS5pt6w==IZfTQ4nYiCx1Cfjz'
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => data.valid)
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
      return false;
    });
}

async function checkGuess() {
  let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
  let guessString = '';
  let rightGuess = Array.from(rightGuessString);

  for (const val of currentGuess) {
    guessString += val;
  }

  if (guessString.length != WORD_LENGTH) {
    toastr.error("Not enough letters!");
    return;
  }

  let isValid = await checkWordValidity(guessString);
  if (!isValid) {
    toastr.error("Invalid Word!");
    return;
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    let letterColor = '';
    let box = row.children[i];
    let letter = currentGuess[i];

    let letterPosition = rightGuess.indexOf(currentGuess[i]);
    if (letterPosition === -1) {
      letterColor = 'var(--grey)';
    } else {
      if (currentGuess[i] === rightGuess[i]) {
        letterColor = 'var(--green)';
      } else {
        letterColor = 'var(--yellow)';
      }

      rightGuess[letterPosition] = "#";
    }

    let delay = 250 * i;
    setTimeout(() => {
      animateCSS(box, 'flipInX');
      box.style.backgroundColor = letterColor;
      shadeKeyBoard(letter, letterColor);
    }, delay);
  }

  if (guessString === rightGuessString) {
    toastr.success("You guessed right! Game over!");
    guessesRemaining = 0;
    return;
  } else {
    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 0) {
      toastr.error("You've run out of guesses! Game over!");
      toastr.info(`The right word was: "${rightGuessString}"`);
    }
  }
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

  document.dispatchEvent(new KeyboardEvent("keyup", { 'key': key }));
});

const animateCSS = (element, animation, prefix = 'animate__') =>
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = element;
    node.style.setProperty('--animate-duration', '0.3s');

    node.classList.add(`${prefix}animated`, animationName);

    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, { once: true });
  });

const restartButton = document.getElementById("restart-button");
restartButton.addEventListener("click", resetGame);

//pop-up windo

    const popupContainer =
        document.getElementById('popupContainer');
    const popupContent =
        document.getElementById('popupContent');
    popupContainer.addEventListener
        ('mouseover', function () {
            popupContent.style.display = 'block';
        });
    popupContainer.addEventListener
        ('mouseout', function () {
            popupContent.style.display = 'none';
        });

