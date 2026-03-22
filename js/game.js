// Mountain Explorer - Huvudloop och spelkoordinator
// Byggt av Daniel och hans son

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

function resizeCanvas() {
    const ratio = canvas.width / canvas.height;
    const windowRatio = window.innerWidth / window.innerHeight;
    if (windowRatio < ratio) {
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = (window.innerWidth / ratio) + 'px';
    } else {
        canvas.style.height = window.innerHeight + 'px';
        canvas.style.width = (window.innerHeight * ratio) + 'px';
    }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Spelstate
let level = new Level();
let player = new Player(380, level.groundY - 32);
let bears = [];
let cameraY = 0;
let gameState = 'playing';
let stateTimer = 0;
let deathCause = '';
let nextBearHeight = 100;
let bearWarning = 0;

// Koppla input
setupInput(canvas, () => gameState, () => stateTimer, restartGame);

function restartGame() {
    const savedMax = player.maxHeight;
    level = new Level();
    player = new Player(380, level.groundY - 32);
    player.maxHeight = savedMax;
    bears = [];
    nextBearHeight = 100;
    bearWarning = 0;
    cameraY = 0;
    gameState = 'playing';
    stateTimer = 0;
}

// Björn-spawning och uppdatering
function updateBears() {
    const height = player.getHeight();

    if (height >= nextBearHeight && gameState === 'playing') {
        let spawnPlatform = null;
        for (const p of level.platforms) {
            if (Math.abs(p.y - (player.y + player.height)) < 20) {
                spawnPlatform = p;
                break;
            }
        }
        if (spawnPlatform) {
            const bearX = player.x < spawnPlatform.x + spawnPlatform.width / 2 ?
                spawnPlatform.x + spawnPlatform.width - 50 :
                spawnPlatform.x + 10;
            const bear = new Bear(bearX, spawnPlatform.y);
            bear.platformX = spawnPlatform.x;
            bear.platformWidth = spawnPlatform.width;
            bears.push(bear);
            bearWarning = 120;
        }
        nextBearHeight += 100;
    }

    for (const bear of bears) {
        bear.update(player.x + player.width / 2);
        if (bear.platformX !== undefined) {
            bear.x = Math.max(bear.platformX, Math.min(bear.x, bear.platformX + bear.platformWidth - bear.width));
        }
    }

    bears = bears.filter(b => b.active && Math.abs(b.bridgeY - player.y) < 1000);
}

// Huvudloop
function gameLoop() {
    // === UPPDATERA ===
    if (gameState === 'playing') {
        player.update(keys, level.platforms, level.ladders);
        level.update(player.y);
        updateBears();

        if (player.hitSpikes) {
            gameState = 'dead';
            deathCause = 'Spikar!';
            stateTimer = 0;
        }

        for (const bear of bears) {
            if (bear.collidesWith(player)) {
                gameState = 'dead';
                deathCause = 'Björnen tog dig!';
                stateTimer = 0;
                break;
            }
        }

        if (player.y > player.lastGroundY + 500 || player.y > level.groundY + 100) {
            gameState = 'dead';
            deathCause = 'Du föll!';
            stateTimer = 0;
        }
    } else {
        stateTimer++;
        if (bearWarning > 0) bearWarning--;
        if (gameState === 'dead' && stateTimer > 90 && keys[' ']) restartGame();
    }

    if (bearWarning > 0 && gameState === 'playing') bearWarning--;

    // Kamera
    const targetCameraY = player.y - canvas.height * 0.45;
    cameraY += (targetCameraY - cameraY) * 0.08;

    // === RITA ===
    drawBackground(ctx, canvas, cameraY);
    drawLevel(ctx, level, cameraY, canvas.height);
    for (const bear of bears) bear.draw(ctx, cameraY);
    player.draw(ctx, cameraY);
    drawUI(ctx, canvas, player, bearWarning, gameState);
    if (gameState === 'dead') drawDeathScreen(ctx, canvas, stateTimer, deathCause, player);

    requestAnimationFrame(gameLoop);
}

gameLoop();
