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
let powerups = new PowerupManager();
let cameraY = 0;
let gameState = 'charselect'; // Börjar med karaktärsval
let deathCause = '';
let nextBearHeight = 100;
let nextYetiHeight = 200;
let bearWarning = 0;
let enemyWarningText = 'BJÖRN!';
let selectedCharacter = null;
let savedMaxHeight = 0;
let deathCutscene = null;

// Örn-system
let eagles = [];
let playerIdleFrames = 0;
let lastPlayerX = 0;
let lastPlayerY = 0;
const IDLE_THRESHOLD = 120; // 2 sekunder vid 60fps

// Koppla input
setupInput(canvas, () => gameState, () => deathCutscene && deathCutscene.canRestart, restartGame);

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
    if (e.key === '3') startGame('pappa');
    if (e.key === '4') startGame('jeff');
    if (e.key === '5') startGame('alvis');
    if (e.key === '6') startGame('bob');
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
    eagles = [];
    rockfall.reset();
    powerups.reset();
    nextBearHeight = 100;
    nextYetiHeight = 200;
    bearWarning = 0;
    playerIdleFrames = 0;
    lastPlayerX = 0;
    lastPlayerY = 0;
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

// Örn-system: spawnar om spelaren står stilla
function updateEagles() {
    const px = player.x;
    const py = player.y;

    // Kolla om spelaren rör sig (mer än 2px per frame)
    const moved = Math.abs(px - lastPlayerX) > 2 || Math.abs(py - lastPlayerY) > 2;
    lastPlayerX = px;
    lastPlayerY = py;

    if (moved || player.climbing) {
        playerIdleFrames = 0;
    } else {
        playerIdleFrames++;
    }

    // Spawna örn efter 2 sekunders stillastående
    if (playerIdleFrames === IDLE_THRESHOLD) {
        eagles.push(new Eagle(px + player.width / 2, py + player.height / 2));
        bearWarning = 80;
        enemyWarningText = 'ÖRN!';
    }

    // Spawna ny örn var 90:e frame om fortfarande stilla
    if (playerIdleFrames > IDLE_THRESHOLD && (playerIdleFrames - IDLE_THRESHOLD) % 90 === 0) {
        eagles.push(new Eagle(px + player.width / 2, py + player.height / 2));
    }

    // Uppdatera alla örnar
    for (const eagle of eagles) {
        eagle.update(px + player.width / 2, py + player.height / 2);
    }

    // Rensa inaktiva örnar
    eagles = eagles.filter(e => e.active);
}

// Raketeld under spelaren vid raketstövlar
function drawRocketFlame(ctx, player, cameraY) {
    const px = player.x + player.width / 2;
    const py = player.y + player.height - cameraY;
    const time = Date.now() * 0.01;

    for (let i = 0; i < 6; i++) {
        const fx = px + (Math.random() - 0.5) * 12;
        const fy = py + 5 + Math.random() * 15;
        const size = 3 + Math.random() * 5;

        if (Math.random() > 0.3) {
            ctx.fillStyle = '#FF6600';
        } else if (Math.random() > 0.5) {
            ctx.fillStyle = '#FFAA00';
        } else {
            ctx.fillStyle = '#FFDD44';
        }
        ctx.fillRect(fx - size / 2, fy, size, size);
    }

    // Rök
    ctx.fillStyle = 'rgba(150, 150, 150, 0.3)';
    for (let i = 0; i < 3; i++) {
        const sx = px + (Math.random() - 0.5) * 8;
        const sy = py + 20 + Math.random() * 10;
        ctx.beginPath();
        ctx.arc(sx, sy, 3 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
    }
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
        updateEagles();
        rockfall.update(player.y, player.getHeight(), level.groundY);
        powerups.update(player, level);

        // Lava = 40 skada
        if (player.inLava) {
            player.takeDamage(40);
            if (player.isDead()) deathCause = 'Lava!';
        }

        // Fiende-kollision (björnar/yetis)
        for (const enemy of bears) {
            if (enemy.collidesWith(player)) {
                if (player.hasBat) {
                    // Slagträ! Slå iväg fienden
                    enemy.active = false;
                    player.hasBat = false;
                    bearWarning = 60;
                    enemyWarningText = 'SMACK!';
                } else if (enemy instanceof Yeti) {
                    player.takeDamage(player.maxHealth);
                    deathCause = 'Yetin krossade dig!';
                } else {
                    player.takeDamage(50 / 60);
                    if (player.isDead()) deathCause = 'Björnen tog dig!';
                }
            }
        }

        // Örn-kollision
        for (const eagle of eagles) {
            if (eagle.collidesWith(player)) {
                if (player.hasBat) {
                    // Slagträ! Slå iväg örnen
                    eagle.active = false;
                    player.hasBat = false;
                    bearWarning = 60;
                    enemyWarningText = 'SMACK!';
                } else {
                    player.takeDamage(40);
                    eagle.active = false;
                    if (player.isDead()) deathCause = 'Örnen tog dig!';
                }
            }
        }

        // Stenras = 25 skada per träff
        if (rockfall.checkCollision(player)) {
            player.takeDamage(25);
            if (player.isDead()) deathCause = 'Stenras!';
        }

        // Föll för långt = instant death
        if (player.y > player.lastGroundY + 500 || player.y > level.groundY + 100) {
            player.takeDamage(player.maxHealth);
            deathCause = 'Du föll!';
        }

        // Kolla om spelaren dog
        if (player.isDead()) {
            gameState = 'cutscene';
            const earned = economy.processRun(player.maxHeight, player.coinMultiplier);

            // Bestäm cutscene-typ
            let cutsceneType = 'fall';
            if (deathCause.includes('Örn')) cutsceneType = 'eagle';
            else if (deathCause.includes('Björn')) cutsceneType = 'bear';
            else if (deathCause.includes('Yeti')) cutsceneType = 'yeti';
            else if (deathCause.includes('Stenras')) cutsceneType = 'rock';
            else if (deathCause.includes('Lava')) cutsceneType = 'lava';

            deathCutscene = new DeathCutscene(cutsceneType, player.colors, {
                deathCause: deathCause,
                maxHeight: player.maxHeight,
                gotNewRecord: earned > 0,
                recordEarned: earned
            });
        }
    } else if (gameState === 'cutscene') {
        if (deathCutscene) {
            deathCutscene.update();
            if (deathCutscene.canRestart) {
                if (keys[' ']) restartGame();
                if (keys['Escape']) goToCharacterSelect();
            }
        }
    }

    if (bearWarning > 0 && gameState === 'playing') bearWarning--;

    // Kamera
    if (gameState !== 'cutscene') {
        const targetCameraY = player.y - canvas.height * 0.45;
        cameraY += (targetCameraY - cameraY) * 0.08;
    }

    // === RITA ===
    if (gameState === 'cutscene' && deathCutscene) {
        deathCutscene.draw(ctx, canvas);
    } else {
        drawBackground(ctx, canvas, cameraY);
        drawLevel(ctx, level, cameraY, canvas.height);
        powerups.draw(ctx, cameraY);
        rockfall.draw(ctx, cameraY);
        for (const enemy of bears) enemy.draw(ctx, cameraY);
        for (const eagle of eagles) eagle.draw(ctx, cameraY);

        // Raketeld under spelaren
        if (powerups.isRocketActive()) {
            drawRocketFlame(ctx, player, cameraY);
        }

        player.draw(ctx, cameraY);
        rockfall.drawWarning(ctx, canvas);
        powerups.drawActiveEffect(ctx, canvas, player);
        drawUI(ctx, canvas, player, bearWarning, gameState, enemyWarningText);
    }
    // (dödsinfo visas nu inuti cutscenen)

    requestAnimationFrame(gameLoop);
}

gameLoop();
