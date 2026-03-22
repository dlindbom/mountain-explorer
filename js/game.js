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
let player = null;
let bears = [];
let rockfall = new RockfallManager();
let cameraY = 0;
let gameState = 'charselect'; // Börjar med karaktärsval
let stateTimer = 0;
let deathCause = '';
let nextBearHeight = 100;
let nextYetiHeight = 200;
let bearWarning = 0;
let enemyWarningText = 'BJÖRN!';
let selectedCharacter = null;
let savedMaxHeight = 0;

// Koppla input
setupInput(canvas, () => gameState, () => stateTimer, restartGame);

// Karaktärsval via klick/touch
canvas.addEventListener('click', handleCharacterClick);
canvas.addEventListener('touchend', (e) => {
    if (gameState !== 'charselect') return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (touch.clientY - rect.top) * (canvas.height / rect.height);
    const chosen = getSelectedCharacter(cx, cy);
    if (chosen) startGame(chosen);
});

// Karaktärsval via tangentbord
window.addEventListener('keydown', (e) => {
    if (gameState !== 'charselect') return;
    if (e.key === '1') startGame('alfred');
    if (e.key === '2') startGame('astrid');
});

function handleCharacterClick(e) {
    if (gameState !== 'charselect') return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    const chosen = getSelectedCharacter(cx, cy);
    if (chosen) startGame(chosen);
}

function startGame(characterId) {
    selectedCharacter = characterId;
    level = new Level();
    player = new Player(380, level.groundY - 32, characterId);
    player.maxHeight = savedMaxHeight;
    bears = [];
    rockfall.reset();
    nextBearHeight = 100;
    nextYetiHeight = 200;
    bearWarning = 0;
    cameraY = 0;
    gameState = 'playing';
    stateTimer = 0;
}

function restartGame() {
    if (!selectedCharacter) {
        gameState = 'charselect';
        return;
    }
    savedMaxHeight = player ? player.maxHeight : 0;
    startGame(selectedCharacter);
}

function goToCharacterSelect() {
    savedMaxHeight = player ? player.maxHeight : 0;
    gameState = 'charselect';
    selectedCharacter = null;
}

// Fiende-spawning
function updateEnemies() {
    const height = player.getHeight();

    if (height >= nextBearHeight && gameState === 'playing') {
        spawnEnemy('bear');
        nextBearHeight += 100;
    }

    if (height >= nextYetiHeight && gameState === 'playing') {
        spawnEnemy('yeti');
        nextYetiHeight += 200;
    }

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
    // === KARAKTÄRSVAL ===
    if (gameState === 'charselect') {
        drawCharacterSelect(ctx, canvas);
        requestAnimationFrame(gameLoop);
        return;
    }

    // === UPPDATERA ===
    if (gameState === 'playing') {
        player.update(keys, level.platforms, level.ladders);
        level.update(player.y);
        updateEnemies();
        rockfall.update(player.y, player.getHeight(), level.groundY);

        if (player.hitSpikes) {
            gameState = 'dead';
            deathCause = 'Spikar!';
            stateTimer = 0;
        }

        for (const enemy of bears) {
            if (enemy.collidesWith(player)) {
                gameState = 'dead';
                deathCause = enemy instanceof Yeti ? 'Yetin krossade dig!' : 'Björnen tog dig!';
                stateTimer = 0;
                break;
            }
        }

        if (rockfall.checkCollision(player)) {
            gameState = 'dead';
            deathCause = 'Stenras!';
            stateTimer = 0;
        }

        if (player.y > player.lastGroundY + 500 || player.y > level.groundY + 100) {
            gameState = 'dead';
            deathCause = 'Du föll!';
            stateTimer = 0;
        }
    } else if (gameState === 'dead') {
        stateTimer++;
        if (bearWarning > 0) bearWarning--;
        if (stateTimer > 90) {
            if (keys[' ']) restartGame();
            if (keys['Escape']) goToCharacterSelect();
        }
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
