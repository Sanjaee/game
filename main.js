const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1030;
canvas.height = 650;

const player1 = createPlayer(50, 0, "char.png", true);
const player2 = createPlayer(canvas.width - 50 - 40, 0, "char.png", false);

const gravity = 1;
const groundHeight = canvas.height - 64;

const platforms = [
  { x: 150, y: groundHeight - 100, width: 100, height: 10 },
  { x: 400, y: groundHeight - 150, width: 120, height: 10 },
  { x: 600, y: groundHeight - 200, width: 150, height: 10 },
];

const backgroundImage = new Image();
backgroundImage.src = "pix.jpg";

const groundImage = new Image();
groundImage.src = "batu.jpg";

const keys = {};

document.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
}

function createPlayer(x, y, imageSrc, isPlayer1) {
  const player = {
    x: x,
    y: y,
    width: 40,
    height: 60,
    xSpeed: 5,
    ySpeed: 0,
    jumping: false,
    image: new Image(),
    facingRight: isPlayer1,
    isPlayer1: isPlayer1,
    health: 100,
  };

  player.image.src = imageSrc;
  return player;
}

function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawGround() {
  for (let x = 0; x < canvas.width; x += groundImage.width) {
    ctx.drawImage(groundImage, x, groundHeight);
  }
}

function drawHealthBar(player, x, y, width, height) {
  const healthPercentage = player.health;
  const healthWidth = (healthPercentage / 100) * width;

  ctx.fillStyle = "red";
  ctx.fillRect(x, y, healthWidth, height);
  ctx.strokeStyle = "white";
  ctx.strokeRect(x, y, width, height);
}

function drawGameTime(gameTime) {
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(formatTime(gameTime), canvas.width / 2, 30);
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(number) {
  return number.toString().padStart(2, "0");
}

let startTime = performance.now();
function gameLoop(timestamp) {
  const elapsedTime = timestamp - startTime;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawGround();
  updatePlayer(player1, keys["ArrowLeft"], keys["ArrowRight"], keys["ArrowUp"]);
  updatePlayer(player2, keys["a"], keys["d"], keys["w"]);
  drawPlayer(player1);
  drawPlayer(player2);

  drawHealthBar(player1, 10, 10, 200, 20);
  drawHealthBar(player2, canvas.width - 210, 10, 200, 20);
  drawGameTime(180000 - elapsedTime);

  ctx.fillStyle = "brown";
  for (const platform of platforms) {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    if (checkCollision(player1, platform) && player1.ySpeed > 0) {
      player1.y = platform.y - player1.height;
      player1.ySpeed = 0;
      player1.jumping = false;
    }
    if (checkCollision(player2, platform) && player2.ySpeed > 0) {
      player2.y = platform.y - player2.height;
      player2.ySpeed = 0;
      player2.jumping = false;
    }
  }

  if (checkCollision(player1, player2)) {
    player1.health -= 1;
    player2.health -= 1;
  }

  requestAnimationFrame(gameLoop);
}

function updatePlayer(player, moveLeft, moveRight, jump) {
  player.ySpeed += gravity;
  player.y += player.ySpeed;

  if (moveLeft) {
    player.x -= player.xSpeed;
    player.facingRight = false;
  }

  if (moveRight) {
    player.x += player.xSpeed;
    player.facingRight = true;
  }

  if (player.x < 0) {
    player.x = 0;
  } else if (player.x > canvas.width - player.width) {
    player.x = canvas.width - player.width;
  }

  if (player.y > groundHeight - player.height) {
    player.y = groundHeight - player.height;
    player.ySpeed = 0;
    player.jumping = false;
  }

  if (jump && !player.jumping) {
    player.ySpeed = -25;
    player.jumping = true;
  }
}

function drawPlayer(player) {
  if (player.facingRight) {
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
  } else {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(player.image, -player.x - player.width, player.y, player.width, player.height);
    ctx.restore();
  }

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  const playerName = player.isPlayer1 ? "Player 1" : "Player 2";
  ctx.fillText(playerName, player.x, player.y - 10);
}

backgroundImage.onload = function () {
  player1.spawnStartTime = performance.now();
  player2.spawnStartTime = performance.now();
  gameLoop();
};
