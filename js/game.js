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
let rockfall = new RockfallManager();
let cameraY = 0;
let gameState = 'playing';
let stateTimer = 0;
let deathCause = '';
let nextBearHeight = 100;
let nextYetiHeight = 200; // Första yeti vid 200m
let bearWarning = 0;
let enemyWarningText = 'BJÖRN!';

// Koppla input
setupInput(canvas, () => gameState, () => stateTimer, restartGame);

function restartGame() {
    const savedMax = player.maxHeight;
    level = new Level();
    player = new Player(380, level.groundY - 32);
    player.maxHeight = savedMax;
    bears = [];
    rockfall.reset();
    nextBearHeight = 100;
    nextYetiHeight = 200;
    bearWarning = 0;
    cameraY = 0;
    gameState = 'playing';
    stateTimer = 0;
}

// Fiende-spawning (björnar och yetis)
function updateEnemies() {
    const height = player.getHeight();

    // Björn var 100:e meter
    if (height >= nextBearHeight && gameState === 'playing') {
        spawnEnemy('bear');
        nextBearHeight += 100;
    }

    // Yeti var 200:e meter (börjar vid 200m)
    if (height >= nextYetiHeight && gameState === 'playing') {
        spawnEnemy('yeti');
        nextYetiHeight += 200;
    }

    // Uppdatera alla fiender
    for (const enemy of bears) {
        enemy.update(player.x + player.width / 2);
        if (enemy.platformX !== undefined) {
            enemy.x = Math.max(enemy.platformX, Math.min(enemy.x, enemy.platformX + enemy.platformWidth - enemy.width));
        }
    }

    bears = bears.filter(b => b.active && Math.abs(b.bridgeY - player.y) < 1000);
}

function spawnEnemy(type) {
    let spawnPlatform = null;
    for (const p of level.platforms) {
        if (Math.abs(p.y - (player.y + player.height)) < 20) {
            spawnPlatform = p;
            break;
        }
    }
    if (!spawnPlatform) return;

    const enemyX = player.x < spawnPlatform.x + spawnPlatform.width / 2 ?
        spawnPlatform.x + spawnPlatform.width - 60 :
        spawnPlatform.x + 10;

    let enemy;
    if (type === 'yeti') {
        enemy = new Yeti(enemyX, spawnPlatform.y);
        bearWarning = 150;
        enemyWarningText = 'YETI!';
    } else {
        enemy = new Bear(enemyX, spawnPlatform.y);
        bearWarning = 120;
        enemyWarningText = 'BJÖRN!';
    }
    enemy.platformX = spawnPlatform.x;
    enemy.platformWidth = spawnPlatform.width;
    bears.push(enemy);
}

// Huvudloop
function gameLoop() {
    // === UPPDATERA ===
    if (gameState === 'playing') {
        player.update(keys, level.platforms, level.ladders);
        level.update(player.y);
        updateEnemies();
        rockfall.update(player.y, player.getHeight(), level.groundY);

        // Spikar
        if (player.hitSpikes) {
            gameState = 'dead';
            deathCause = 'Spikar!';
            stateTimer = 0;
        }

        // Fiende-kollision
        for (const enemy of bears) {
            if (enemy.collidesWith(player)) {
                gameState = 'dead';
                deathCause = enemy instanceof Yeti ? 'Yetin krossade dig!' : 'Björnen tog dig!';
                stateTimer = 0;
                break;
            }
        }

        // Stenras-kollision
        if (rockfall.checkCollision(player)) {
            gameState = 'dead';
            deathCause = 'Stenras!';
            stateTimer = 0;
        }

        // Föll för långt
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
    rockfall.draw(ctx, cameraY);
    for (const enemy of bears) enemy.draw(ctx, cameraY);
    player.draw(ctx, cameraY);
    rockfall.drawWarning(ctx, canvas);
    drawUI(ctx, canvas, player, bearWarning, gameState, enemyWarningText);
    if (gameState === 'dead') drawDeathScreen(ctx, canvas, stateTimer, deathCause, player);

    requestAnimationFrame(gameLoop);
}

gameLoop();
