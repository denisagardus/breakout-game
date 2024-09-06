// Board properties
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

// Players properties
let playerWidth = 90;
let playerHeight = 15;
let playerVelocityX = 20; //TODO: change the speed of the paddle here

// Player object
let plyr = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 10,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
};

// Ball properties
let ballDiameter = 12;
//TODO: change the speed of the ball here
let ballVelocityX = 4; 
let ballVelocityY = 3; 

// Ball object
let ball = {
    x: boardWidth / 2 - ballDiameter / 2,
    y: boardHeight / 2 - ballDiameter / 2,
    diameter: ballDiameter,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY
};

// Blocks properties
let blockArray = [];
let blockWidth = 65;
let blockHeight = 20;
let columns = 6;
let initRows = 3; 
let rows = 3;
let maxRows = 5;
let blockCnt = 0;

// Block positioning
let blockX = 10;
let blockY = 60;

// Game variables
let score = 0;
let highScore = localStorage.getItem("highScore1") || 0;
let gameOver = false;

// Initialize the game on window load
window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    createBlocks();
    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);
    document.getElementById("highscore").innerText = "High Score: " + highScore; 
};

// Game is ongoing
function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    context.fillStyle = "#2b2d42";
    context.fillRect(0, 0, board.width, board.height);

    context.fillStyle = "#468faf";
    context.fillRect(plyr.x, plyr.y, plyr.width, plyr.height);

    context.fillStyle = "#89c2d9";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    context.beginPath();
    context.arc(ball.x + ball.diameter / 2, ball.y + ball.diameter / 2, ball.diameter / 2, 0, Math.PI * 2);
    context.fill();

    if (topCollision(ball, plyr) || bottomCollision(ball, plyr)) {
        ball.velocityY *= -1;
    } else if (leftCollision(ball, plyr) || rightCollision(ball, plyr)) {
        ball.velocityX *= -1;
    }

    if (ball.y <= 0) { 
        ball.velocityY *= -1;
    } else if (ball.x <= 0 || (ball.x + ball.diameter >= boardWidth)) {
        ball.velocityX *= -1;
    } else if (ball.y + ball.diameter >= boardHeight) {
        handleLoss();
    }

    context.fillStyle = "#4cc9f0";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break = true;
                ball.velocityY *= -1;
                score += 100;
                blockCnt -= 1;
            } else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true;
                ball.velocityX *= -1;
                score += 100;
                blockCnt -= 1;
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    if (blockCnt === 0) {
        handleWin();
        return; 
    }

    context.font = "20px sans-serif";
    context.fillStyle = "white";
    context.fillText(score, 10, 25);
}

// Handle winning 
function handleWin() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore1", highScore); 
        document.getElementById("highscore").innerText = "High Score: " + highScore; 
    }
    context.font = "24px 'Poppins', sans-serif";
    context.fillStyle = "#4caf50"; 
    const message = "You Win! Press 'Space' to Restart";
    const textWidth = context.measureText(message).width; 
    context.fillText(message, (boardWidth - textWidth) / 2, boardHeight / 2); 
    gameOver = true;
}

// Handle losing 
function handleLoss() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore1", highScore);
        document.getElementById("highscore").innerText = "High Score: " + highScore; 
    }
    context.font = "24px 'Poppins', sans-serif";
    context.fillStyle = "#ff4d6d";
    const message = "Game Over! Press 'Space' to Restart";
    const textWidth = context.measureText(message).width; 
    context.fillText(message, (boardWidth - textWidth) / 2, boardHeight / 2); 
    gameOver = true;
}

// Movement of the player paddle
function movePlayer(e) {
    if (gameOver) {
        if (e.code == "Space") {
            resetGame();
        }
        return;
    }
    if (e.code == "ArrowLeft") {
        let nextplayerX = plyr.x - plyr.velocityX;
        if (!outOfBounds(nextplayerX)) {
            plyr.x = nextplayerX;
        }
    } else if (e.code == "ArrowRight") {
        let nextplayerX = plyr.x + plyr.velocityX;
        if (!outOfBounds(nextplayerX)) {
            plyr.x = nextplayerX;
        }
    }
}

// Detect collision between two objects
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.diameter > b.x &&
        a.y < b.y + b.height &&
        a.y + a.diameter > b.y;
}

// Check for collisions 
function topCollision(ball, block) {
    return detectCollision(ball, block) && (ball.y + ball.diameter) >= block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) && (ball.x + ball.diameter) >= block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

// Create blocks for the game
function createBlocks() {
    blockArray = [];
    let totalBlockWidth = columns * (blockWidth + 10) - 10; 
    blockX = (boardWidth - totalBlockWidth) / 2;

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            let block = {
                x: blockX + c * (blockWidth + 10),
                y: blockY + r * (blockHeight + 10),
                width: blockWidth,
                height: blockHeight,
                break: false
            };
            blockArray.push(block);
        }
    }
    blockCnt = blockArray.length;
}

// Reset the game 
function resetGame() {
    gameOver = false;
    plyr = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 10,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX
    };
    ball = {
        x: boardWidth / 2 - ballDiameter / 2,
        y: boardHeight / 2 - ballDiameter / 2,
        diameter: ballDiameter,
        velocityX: ballVelocityX,
        velocityY: ballVelocityY
    };
    blockArray = [];
    rows = initRows;
    score = 0;
    createBlocks();
}

// Check if the player paddle is out of bounds
function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);
}
