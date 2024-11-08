const height = 6;
const width = 5;
let row = 0;
let col = 0;
let gameOver = false;
const resetBtn = document.getElementById("resetBtn");
let colorBlindMode = false;

// Färgblindläge-knapp
document
  .getElementById("colorBlindBtn")
  .addEventListener("click", toggleColorBlindMode);

function toggleColorBlindMode() {
  colorBlindMode = !colorBlindMode;

  const body = document.body;

  // Aktivera eller inaktivera färgblindläge genom att lägga till/ta bort en CSS-klass
  if (colorBlindMode) {
    body.classList.add("colorblind");
  } else {
    body.classList.remove("colorblind");
  }

  // Uppdatera knappen för att visa aktuellt läge
  const buttonText = colorBlindMode ? "Vanligt läge" : "Färgblindläge";
  document.getElementById("colorBlindBtn").innerText = buttonText;
}

///Hämtar ord från Json filen
async function loadWords() {
  try {
    const response = await fetch("wordle.json");
    if (!response.ok) {
      throw new Error("Could not fetch JSON file");
    }
    const data = await response.json();
    words = data.words;

    targetWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
    return targetWord;
  } catch (error) {
    console.error("Error fetching:", error);
  }
}

// Funktion för att starta spelet
function startGame() {
  createBoard();
  createKeyboard();
  document.addEventListener("keyup", handleInput);
}

// Skapar spelbrädan
function createBoard() {
  const board = document.getElementById("board");
  for (let i = 0; i < height * width; i++) {
    const tile = document.createElement("span");
    tile.classList.add("tile");
    tile.id = `tile-${Math.floor(i / width)}-${i % width}`;
    board.appendChild(tile);
  }
}

// Skapar tangentbordet
function createKeyboard() {
  const keys = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["Enter", "z", "x", "c", "v", "b", "n", "m", "⌫"],
  ];

  const keyboard = document.getElementById("keyboard");
  keys.forEach((row) => {
    const keyboardRow = document.createElement("div");
    keyboardRow.classList.add("keyboard-row");

    row.forEach((key) => {
      const keyTile = document.createElement("div");
      keyTile.classList.add("key-tile");
      keyTile.innerText = key;
      keyTile.id = `key-${key}`;

      if (key === "Enter") {
        keyTile.classList.add("enter-key-tile");
      }

      keyTile.addEventListener("click", () => handleKeyClick(key));
      keyboardRow.appendChild(keyTile);
    });

    keyboard.appendChild(keyboardRow);
  });
}

// Hanterar tangentbordsklick
function handleKeyClick(key) {
  if (key === "Enter") {
    handleGuess();
  } else if (key === "⌫") {
    deleteLetter();
  } else writeLetter(key);
}

// Hanterar tangentbordsinmatning
function handleInput(e) {
  if (gameOver) return;

  if (e.key === "Enter") {
    handleGuess();
  } else if (e.key === "Backspace") {
    deleteLetter();
  } else if (/^[a-z]$/i.test(e.key)) {
    writeLetter(e.key);
  }
}

// Skriver in en bokstav på spelbrädan
function writeLetter(letter) {
  if (col < width) {
    const tile = document.getElementById(`tile-${row}-${col}`);
    tile.innerText = letter.toUpperCase();
    col++;
  }
}

// Raderar en bokstav från spelbrädan
function deleteLetter() {
  if (col > 0) {
    col--;
    const tile = document.getElementById(`tile-${row}-${col}`);
    tile.innerText = "";
  }
}

// Hanterar en gissning och uppdaterar färgerna på brädan och tangentbordet
function handleGuess() {
  if (col < width) return;

  const guess = [];
  for (let i = 0; i < width; i++) {
    guess.push(document.getElementById(`tile-${row}-${i}`).innerText);
  }

  let correctCount = 0;
  const letterCount = {};

  // Räkna förekomster av varje bokstav i målordet
  for (const letter of targetWord) {
    letterCount[letter] = (letterCount[letter] || 0) + 1;
  }

  // Första genomgång för att markera de korrekta bokstäverna
  for (let i = 0; i < width; i++) {
    const tile = document.getElementById(`tile-${row}-${i}`);
    const letter = guess[i];

    if (targetWord[i] === letter) {
      tile.classList.add("correct");
      letterCount[letter]--;
      correctCount++;
    }
  }

  // Andra genomgången för att markera om bokstäver är felplacerade eller saknade
  for (let i = 0; i < width; i++) {
    const tile = document.getElementById(`tile-${row}-${i}`);
    const letter = guess[i];

    if (!tile.classList.contains("correct")) {
      if (targetWord.includes(letter) && letterCount[letter] > 0) {
        tile.classList.add("present");
        letterCount[letter]--;
      } else {
        tile.classList.add("absent");
      }
    }
  }

  // Uppdaterar tangentbordet baserat på plattornas slutliga färger
  for (let i = 0; i < width; i++) {
    const letter = guess[i];
    const keyElement = document.getElementById(`key-${letter.toLowerCase()}`);
    const tile = document.getElementById(`tile-${row}-${i}`);

    // Markerar som "correct" om plattan är korrekt
    if (tile.classList.contains("correct")) {
      keyElement.classList.remove("present", "absent");
      keyElement.classList.add("correct");
    } else if (tile.classList.contains("present")) {
      //Markerar som "present" om tangenten inte redan är "correct"
      if (!keyElement.classList.contains("correct")) {
        keyElement.classList.remove("absent");
        keyElement.classList.add("present");
      }
    } else {
      //Markerar som "absent" om tangen inte redan är "correct" eller "present"
      if (
        !keyElement.classList.contains("correct") &&
        !keyElement.classList.contains("present")
      ) {
        keyElement.classList.add("absent");
      }
    }
  }

  // Kontrollerar om spelet är slut
  if (correctCount === width) {
    gameOver = true;
    document.getElementById("answer").innerText =
      "Grattis! Du gissade rätt ord!";
  } else if (row === height - 1) {
    gameOver = true;
    document.getElementById(
      "answer"
    ).innerText = `Spelet över! Rätt ord var: ${targetWord}`;
  } else {
    row++;
    col = 0;
  }
}

//Återställer spelet
function resetGame() {
  row = 0;
  col = 0;
  gameOver = false;
  document.getElementById("answer").innerText = "";

  const board = document.getElementById("board");
  board.textContent = "";

  const keyboard = document.getElementById("keyboard");
  keyboard.textContent = "";

  loadWords().then((newTargetWord) => {
    targetWord = newTargetWord;
    console.log("The secret word is:", targetWord);

    createBoard();
    createKeyboard();

    document.addEventListener("keyup", handleInput);
  });
}

resetBtn.addEventListener("click", resetGame);

(async () => {
  let targetWord = await loadWords();
  console.log("The secret word is:", targetWord);
})();

// Starta spelet
startGame();
