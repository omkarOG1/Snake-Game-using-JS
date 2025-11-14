// Selecting important HTML elements
let board = document.querySelector(".board");
let startBtn = document.querySelector(".start-btn");
let restartBtn = document.querySelector(".btn-restart");
let modal = document.querySelector(".modal");
let startGameModal = document.querySelector(".start-game");
let gameOverModal = document.querySelector(".game-over");
let scoreElemet = document.querySelector("#score");
let highScoreElement = document.querySelector("#high-score");
let timeElemet = document.querySelector("#time");

// Getting saved high score from localStorage (if none → 0)
let highScore = (localStorage.getItem("highScore")) || 0;
let score = 0;
let time = `00-00`; // Initial time format (minutes-seconds)
highScoreElement.innerText = highScore; // show high score in UI

// Block dimensions and grid setup
let blockHeight = 50;
let blockWidth = 50;
let cols = null;
let rows = null;
let blocks = {}; // to store every grid cell (div block)
let intervalId = null; // for snake movement loop
let timeintervalId = null; // for time counter loop
let snake = [{ x: 1, y: 3 }]; // initial snake body (array of coordinates)
let direction = "right"; // initial direction
let food = null; // will store random food position

// ---------------- GRID GENERATION LOGIC ----------------
let genrateGrid = function () {
  board.innerHTML = ""; // clear old grid before generating new one

  // calculate number of rows and columns based on screen size
  cols = Math.floor(board.clientWidth / blockWidth);
  rows = Math.floor(board.clientHeight / blockHeight);

  // create grid structure using CSS grid template
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  // randomly place food at start
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };

  // loop through rows and columns to create div blocks
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let block = document.createElement("div");
      block.classList.add("block");
      board.appendChild(block);
      // store every block with key like "2-3"
      blocks[`${row}-${col}`] = block;
    }
  }
};
genrateGrid(); // create grid initially

// ---------------- RENDER FUNCTION ----------------
// This runs every 300ms to move snake and update visuals
let render = () => {
  let head = null;

  // Move snake head based on direction
  if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }

  // ---------- WALL COLLISION ----------
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    // stop game and show game-over modal
    clearInterval(intervalId);
    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";
    return;
  }

  // ---------- FOOD CONSUMPTION ----------
  if (head.x == food.x && head.y == food.y) {
    // remove old food
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    // generate new random food position
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    // show new food on board
    blocks[`${food.x}-${food.y}`].classList.add("food");
    // add new block to snake (grow)
    snake.unshift(head);

    // increase score
    score += 10;
    scoreElemet.innerText = score;

    // check and update high score
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
    }
  }

  // remove previous snake fill before new render
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });

  // add new head to front
  snake.unshift(head);
  // remove last tail block to move forward
  snake.pop();

  // fill snake blocks again
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.add("fill");
  });

  // ensure food is visible
  blocks[`${food.x}-${food.y}`].classList.add("food");
};

// ---------------- START GAME BUTTON ----------------
startBtn.addEventListener("click", () => {
  modal.style.display = "none"; // hide start modal

  // main snake movement interval (every 300ms)
  intervalId = setInterval(() => {
    render();
  }, 300);

  // -------------- TIMER LOGIC --------------
  // updates every second
  timeintervalId = setInterval(() => {
    // split "min-sec" string into numbers
    let [min, sec] = time.split("-").map(Number);

    // increase seconds every time
    if (sec === 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }

    // update time string and UI
    time = `${min}-${sec}`;
    timeElemet.innerText = time;
  }, 1000);
});

// ---------------- RESTART GAME LOGIC ----------------
let gameRestart = () => {
  clearInterval(intervalId); // stop snake movement
  score = 0; // reset score
  time = `00-00`; // reset timer
  scoreElemet.innerText = score; // update score on UI
  highScoreElement.innerText = highScore; // keep high score
  timeElemet,innerText = time; // (⚠️ small typo: should be timeElemet.innerText)
  
  // remove food and snake from board
  blocks[`${food.x}-${food.y}`].classList.remove("food");
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });

  // reset modal and game data
  modal.style.display = "none";
  snake = [{ x: 1, y: 3 }];
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
  direction = "down";

  // restart snake movement loop
  intervalId = setInterval(() => {
    render();
  }, 300);
};
restartBtn.addEventListener("click", gameRestart);

// ---------------- KEYBOARD CONTROLS ----------------
addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    direction = "up";
  } else if (e.key === "ArrowDown") {
    direction = "down";
  } else if (e.key === "ArrowLeft") {
    direction = "left";
  } else if (e.key === "ArrowRight") {
    direction = "right";
  }
});

// ---------------- WINDOW RESIZE EVENT ----------------
// re-generate grid dynamically if window size changes
window.addEventListener("resize", () => {
  genrateGrid();
  render();
});
