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
let blizzardMgr = new BlizzardManager();
let cameraY = 0;
let gameState = 'charselect'; // charselect → levelselect → introCutscene → playing → cutscene
let levelCompleted = false;
let deathCause = '';
let deathType = '';
let nextBearHeight = 100;
let nextYetiHeight = 200;
let bearWarning = 0;
let enemyWarningText = '';
let selectedCharacter = null;
let savedMaxHeight = 0;
let deathCutscene = null;
let victoryCutscene = null;
let introCutscene = null;

// Örn-system
let eagles = [];
let playerIdleFrames = 0;
let lastPlayerX = 0;
let lastPlayerY = 0;
const IDLE_THRESHOLD = 120; // 2 sekunder vid 60fps

// Koppla input
setupInput(canvas, () => gameState, () => deathCutscene && deathCutscene.canRestart, restartGame);

// Menyval via klick/touch
function handleMenuClick(canvasX, canvasY) {
    if (gameState === 'charselect') {
        const chosen = getSelectedCharacter(canvasX, canvasY);
        if (chosen === 'shop') {
            gameState = 'shop';
        } else if (chosen) {
            selectedCharacter = chosen;
            gameState = 'levelselect';
        }
    } else if (gameState === 'levelselect') {
        const lvl = getSelectedLevel(canvasX, canvasY);
        if (lvl !== null) {
            levelProgress.selectLevel(lvl);
            startGame(selectedCharacter);
        }
    } else if (gameState === 'shop') {
        const result = getShopClick(canvasX, canvasY);
        if (result === 'back') {
            gameState = 'charselect';
        }
    }
}

canvas.addEventListener('click', (e) => {
    if (gameState !== 'charselect' && gameState !== 'levelselect' && gameState !== 'shop') return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    handleMenuClick(cx, cy);
});

canvas.addEventListener('touchend', (e) => {
    if (gameState === 'charselect' || gameState === 'levelselect' || gameState === 'shop') {
        const touch = e.changedTouches[0];
        if (!touch) return;
        const rect = canvas.getBoundingClientRect();
        const cx = (touch.clientX - rect.left) * (canvas.width / rect.width);
        const cy = (touch.clientY - rect.top) * (canvas.height / rect.height);
        handleMenuClick(cx, cy);
    } else if (gameState === 'victoryCutscene' && victoryCutscene && victoryCutscene.canContinue) {
        gameState = 'levelselect';
    } else if (gameState === 'introCutscene' && introCutscene && introCutscene.canSkip) {
        gameState = 'playing';
    } else if (gameState === 'cutscene' && deathCutscene && deathCutscene.canRestart) {
        restartGame();
    }
});

window.addEventListener('keydown', (e) => {
    if (gameState === 'charselect') {
        const charKeys = { '1': 'alfred', '2': 'astrid', '3': 'pappa', '4': 'jeff', '5': 'alvis', '6': 'bob', '7': 'mamma', '8': 'alice' };
        if (charKeys[e.key]) {
            selectedCharacter = charKeys[e.key];
            gameState = 'levelselect';
        }
    } else if (gameState === 'levelselect') {
        if (e.key === 'Escape') gameState = 'charselect';
    } else if (gameState === 'shop') {
        if (e.key === 'Escape') gameState = 'charselect';
    }
});

function startGame(characterId) {
    selectedCharacter = characterId;
    level = new Level();
    player = new Player(380, level.groundY - 32, characterId);
    player.maxHeight = savedMaxHeight;
    bears = [];
    eagles = [];
    rockfall.reset();
    powerups.reset();
    blizzardMgr.reset();
    nextBearHeight = 100;
    nextYetiHeight = 200;
    bearWarning = 0;
    playerIdleFrames = 0;
    lastPlayerX = 0;
    lastPlayerY = 0;
    cameraY = 0;
    levelCompleted = false;

    // Visa intro-cutscene innan spelet börjar
    const mountain = levelProgress.getCurrentMountain();
    introCutscene = new IntroCutscene(mountain, player.colors);
    gameState = 'introCutscene';
}

function restartGame() {
    if (!selectedCharacter) {
        gameState = 'charselect';
        return;
    }
    savedMaxHeight = player ? player.maxHeight : 0;
    deathType = '';
    deathCause = '';
    deathCutscene = null;
    // Hoppa över intro vid restart — gå direkt till spelet
    level = new Level();
    player = new Player(380, level.groundY - 32, selectedCharacter);
    player.maxHeight = savedMaxHeight;
    bears = [];
    eagles = [];
    rockfall.reset();
    powerups.reset();
    blizzardMgr.reset();
    nextBearHeight = 100;
    nextYetiHeight = 200;
    bearWarning = 0;
    playerIdleFrames = 0;
    lastPlayerX = 0;
    lastPlayerY = 0;
    cameraY = 0;
    levelCompleted = false;
    gameState = 'playing';
}

function goToCharacterSelect() {
    savedMaxHeight = player ? player.maxHeight : 0;
    gameState = 'levelselect';
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
        enemyWarningText = t('warn_yeti');
    } else {
        enemy = new Bear(enemyX, spawnPlatform.y);
        bearWarning = 120;
        enemyWarningText = t('warn_bear');
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
        enemyWarningText = t('warn_eagle');
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
    // === MENYSKÄRMAR ===
    if (gameState === 'charselect') {
        drawCharacterSelect(ctx, canvas);
        requestAnimationFrame(gameLoop);
        return;
    }
    if (gameState === 'levelselect') {
        drawLevelSelect(ctx, canvas);
        requestAnimationFrame(gameLoop);
        return;
    }
    if (gameState === 'shop') {
        drawShop(ctx, canvas);
        requestAnimationFrame(gameLoop);
        return;
    }

    // === INTRO-CUTSCENE ===
    if (gameState === 'introCutscene') {
        if (introCutscene) {
            introCutscene.update();
            introCutscene.draw(ctx, canvas);
            if (introCutscene.done) {
                gameState = 'playing';
            }
            if (introCutscene.canSkip && (keys[' '] || keys['Escape'] || keys['ArrowUp'])) {
                gameState = 'playing';
            }
        }
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
        blizzardMgr.update(player);

        // Kolla om spelaren nått bergets topp
        if (!levelCompleted && player.getHeight() >= levelProgress.getTargetHeight()) {
            levelCompleted = true;
            const mountain = levelProgress.getCurrentMountain();
            levelProgress.completeCurrentLevel();
            gameState = 'victoryCutscene';
            victoryCutscene = new VictoryCutscene(mountain, player.colors);
        }

        // Lava = 30 skada (vattenhink släcker lavan permanent)
        if (player.inLava) {
            if (player.hasWaterBucket && player.lavaPlatform) {
                // Släck lavan — förvandla till sten
                player.lavaPlatform.lavaExtinguished = true;
                player.hasWaterBucket -= 1;
                player.inLava = false;
            } else {
                player.takeDamage(30);
                if (player.isDead()) {
                    deathType = 'lava';
                    deathCause = t('death_lava');
                }
            }
        }

        // Fiende-kollision (björnar/yetis)
        for (const enemy of bears) {
            if (enemy.collidesWith(player)) {
                if (player.hasBat) {
                    // Slagträ! Slå iväg fienden
                    enemy.active = false;
                    if (!player.permanentBat) player.hasBat -= 1;
                    bearWarning = 60;
                    enemyWarningText = t('warn_smack');
                } else if (enemy instanceof Yeti) {
                    player.takeDamage(player.maxHealth * 0.75);
                    if (player.isDead()) {
                        deathType = 'yeti';
                        deathCause = t('death_yeti');
                    }
                } else {
                    player.takeDamage(50 / 60);
                    if (player.isDead()) {
                        deathType = 'bear';
                        deathCause = t('death_bear');
                    }
                }
            }
        }

        // Örn-kollision
        for (const eagle of eagles) {
            if (eagle.collidesWith(player)) {
                if (player.hasBat) {
                    // Slagträ! Slå iväg örnen
                    eagle.active = false;
                    if (!player.permanentBat) player.hasBat -= 1;
                    bearWarning = 60;
                    enemyWarningText = t('warn_smack');
                } else {
                    player.takeDamage(40);
                    eagle.active = false;
                    if (player.isDead()) {
                        deathType = 'eagle';
                        deathCause = t('death_eagle');
                    }
                }
            }
        }

        // Stenras = 25 skada per träff
        if (rockfall.checkCollision(player)) {
            player.takeDamage(25);
            if (player.isDead()) {
                deathType = 'rock';
                deathCause = t('death_rock');
            }
        }

        // Föll för långt = instant death
        if (player.y > player.lastGroundY + 500 || player.y > level.groundY + 100) {
            player.takeDamage(player.maxHealth);
            deathType = 'fall';
            deathCause = t('death_fall');
        }

        // Kolla om spelaren dog
        if (player.isDead()) {
            gameState = 'cutscene';
            const earned = economy.processRun(player.maxHeight, player.coinMultiplier);

            deathCutscene = new DeathCutscene(deathType, player.colors, {
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
                if (keys[' '] || keys['ArrowUp']) restartGame();
                if (keys['Escape']) goToCharacterSelect();
            }
        }
    } else if (gameState === 'victoryCutscene') {
        if (victoryCutscene) {
            victoryCutscene.update();
            if (victoryCutscene.canContinue) {
                if (keys[' '] || keys['Escape'] || keys['ArrowUp']) {
                    gameState = 'levelselect';
                }
            }
        }
    }

    if (bearWarning > 0 && gameState === 'playing') bearWarning--;

    // Kamera
    if (gameState !== 'cutscene' && gameState !== 'victoryCutscene') {
        const targetCameraY = player.y - canvas.height * 0.45;
        cameraY += (targetCameraY - cameraY) * 0.08;
    }

    // === RITA ===
    if (gameState === 'cutscene' && deathCutscene) {
        deathCutscene.draw(ctx, canvas);
    } else if (gameState === 'victoryCutscene' && victoryCutscene) {
        victoryCutscene.draw(ctx, canvas);
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
        blizzardMgr.draw(ctx, cameraY);
        rockfall.drawWarning(ctx, canvas);
        blizzardMgr.drawWarning(ctx, canvas, player);
        powerups.drawActiveEffect(ctx, canvas, player);
        drawLevelHUD(ctx, canvas, player.getHeight());
        drawUI(ctx, canvas, player, bearWarning, gameState, enemyWarningText);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
