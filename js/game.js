// Mountain Explorer - Huvudspelloop
// Byggt av Daniel och hans son

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Anpassa canvas till skärmen
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
const keys = {};
let gameState = 'playing';
let stateTimer = 0;
let deathCause = '';
let nextBearHeight = 100;
let bearWarning = 0;

const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

const touchButtons = {
    left:  { x: 20,  y: 480, w: 80, h: 80, key: 'ArrowLeft',  label: '←', pressed: false },
    right: { x: 120, y: 480, w: 80, h: 80, key: 'ArrowRight', label: '→', pressed: false },
    jump:  { x: 680, y: 480, w: 100, h: 100, key: 'ArrowUp',  label: '↑', pressed: false },
};

// Input
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

function touchToCanvas(touch) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function hitButton(pos, btn) {
    return pos.x >= btn.x && pos.x <= btn.x + btn.w &&
           pos.y >= btn.y && pos.y <= btn.y + btn.h;
}

function updateTouchButtons(touches) {
    for (const name in touchButtons) {
        touchButtons[name].pressed = false;
        keys[touchButtons[name].key] = false;
    }
    for (let i = 0; i < touches.length; i++) {
        const pos = touchToCanvas(touches[i]);
        for (const name in touchButtons) {
            const btn = touchButtons[name];
            if (hitButton(pos, btn)) {
                btn.pressed = true;
                keys[btn.key] = true;
            }
        }
    }
}

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    updateTouchButtons(e.touches);
    if (gameState === 'dead' && stateTimer > 90) restartGame();
}, { passive: false });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); updateTouchButtons(e.touches); }, { passive: false });
canvas.addEventListener('touchend', (e) => { e.preventDefault(); updateTouchButtons(e.touches); }, { passive: false });
canvas.addEventListener('touchcancel', (e) => { e.preventDefault(); updateTouchButtons(e.touches); }, { passive: false });

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

// === BERGS-BAKGRUND ===

function drawBackground() {
    // Himmel
    const altitude = Math.max(0, -cameraY);
    const progress = Math.min(1, altitude / 6000);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (progress > 0.7) {
        skyGrad.addColorStop(0, '#0F1B33');
        skyGrad.addColorStop(1, '#1B3A5C');
    } else if (progress > 0.4) {
        skyGrad.addColorStop(0, '#2E5090');
        skyGrad.addColorStop(1, '#6B9AC4');
    } else {
        skyGrad.addColorStop(0, '#5BA3D9');
        skyGrad.addColorStop(1, '#A8D8EA');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stjärnor på hög höjd
    if (progress > 0.6) {
        const a = (progress - 0.6) / 0.4 * 0.8;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        for (let i = 0; i < 25; i++) {
            ctx.fillRect((i * 137 + 50) % 780 + 10, (i * 97 + 30) % 580 + 10, (i % 3) + 1, (i % 3) + 1);
        }
    }

    // Avlägsna berg (parallax)
    ctx.fillStyle = 'rgba(80, 95, 110, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(80, 250 - cameraY * 0.02);
    ctx.lineTo(200, 350 - cameraY * 0.02);
    ctx.lineTo(350, 150 - cameraY * 0.02);
    ctx.lineTo(500, 300 - cameraY * 0.02);
    ctx.lineTo(700, 120 - cameraY * 0.02);
    ctx.lineTo(800, 220 - cameraY * 0.02);
    ctx.lineTo(800, canvas.height);
    ctx.fill();

    // Vänster bergsida (klippvägg)
    drawCliffFace('left');

    // Höger bergsida (klippvägg)
    drawCliffFace('right');
}

function drawCliffFace(side) {
    const isLeft = side === 'left';

    ctx.fillStyle = isLeft ? '#3D3832' : '#3A3530';
    ctx.beginPath();

    if (isLeft) {
        ctx.moveTo(0, 0);
        ctx.lineTo(0, canvas.height);
        // Ojämn innerkant
        for (let y = canvas.height; y >= -10; y -= 20) {
            const worldY = y + cameraY;
            const x = 100 + Math.sin(worldY * 0.007) * 35 + Math.sin(worldY * 0.023) * 12;
            ctx.lineTo(x, y);
        }
    } else {
        ctx.moveTo(800, 0);
        ctx.lineTo(800, canvas.height);
        for (let y = canvas.height; y >= -10; y -= 20) {
            const worldY = y + cameraY;
            const x = 700 - Math.sin(worldY * 0.007 + 2) * 35 - Math.sin(worldY * 0.023 + 1) * 12;
            ctx.lineTo(x, y);
        }
    }
    ctx.fill();

    // Stentextur (subtila linjer)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 30) {
        const worldY = y + cameraY;
        const offset = Math.sin(worldY * 0.01) * 10;
        ctx.beginPath();
        if (isLeft) {
            ctx.moveTo(0, y);
            ctx.lineTo(60 + offset, y);
        } else {
            ctx.moveTo(800, y);
            ctx.lineTo(740 + offset, y);
        }
        ctx.stroke();
    }

    // Mörk kant mot klyftan
    const edgeGrad = isLeft ?
        ctx.createLinearGradient(80, 0, 140, 0) :
        ctx.createLinearGradient(720, 0, 660, 0);
    edgeGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
    edgeGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = edgeGrad;
    if (isLeft) {
        ctx.fillRect(80, 0, 60, canvas.height);
    } else {
        ctx.fillRect(660, 0, 60, canvas.height);
    }
}

// === BJÖRNAR ===

function updateBears() {
    const height = player.getHeight();

    if (height >= nextBearHeight && gameState === 'playing') {
        // Hitta plattformen spelaren är på
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
        // Begränsa björn till sin plattform
        if (bear.platformX !== undefined) {
            bear.x = Math.max(bear.platformX, Math.min(bear.x, bear.platformX + bear.platformWidth - bear.width));
        }
    }

    bears = bears.filter(b => b.active && Math.abs(b.bridgeY - player.y) < 1000);
}

// === UI ===

function drawUI() {
    const height = player.getHeight();

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(ctx, canvas.width / 2 - 90, 8, 180, 44, 8);
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⛰ ${height} m`, canvas.width / 2, 36);

    if (player.maxHeight > height) {
        ctx.font = '11px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(`Bäst: ${player.maxHeight} m`, canvas.width / 2, 50);
    }

    if (height === 0 && player.vy === 0 && gameState === 'playing') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        roundRect(ctx, canvas.width / 2 - 200, canvas.height - 120, 400, 55, 8);
        ctx.fill();
        ctx.font = '13px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        if (isTouchDevice) {
            ctx.fillText('← → Röra sig   ↑ Hoppa & Klättra', canvas.width / 2, canvas.height - 98);
        } else {
            ctx.fillText('← → Röra sig   ↑ Hoppa/Klättra   Mellanslag = Hoppa', canvas.width / 2, canvas.height - 98);
        }
        ctx.fillText('Hoppa på klippavsatserna och klättra stegarna!', canvas.width / 2, canvas.height - 78);
    }

    if (bearWarning > 0) {
        bearWarning--;
        const alpha = Math.min(1, bearWarning / 30);
        const shake = Math.sin(bearWarning * 0.5) * 3;
        ctx.fillStyle = `rgba(180,30,30,${alpha * 0.6})`;
        roundRect(ctx, canvas.width / 2 - 100, canvas.height / 2 - 40 + shake, 200, 50, 10);
        ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.font = 'bold 32px monospace';
        ctx.fillText('BJÖRN!', canvas.width / 2, canvas.height / 2 - 8 + shake);
    }

    if (isTouchDevice) drawTouchControls();
}

function drawTouchControls() {
    for (const name in touchButtons) {
        const btn = touchButtons[name];
        ctx.fillStyle = btn.pressed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)';
        roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 16);
        ctx.stroke();
        ctx.fillStyle = btn.pressed ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)';
        ctx.font = name === 'jump' ? 'bold 36px monospace' : 'bold 30px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
    ctx.textBaseline = 'alphabetic';
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawDeathScreen() {
    const alpha = Math.min(0.7, stateTimer / 60);
    ctx.fillStyle = `rgba(80,0,0,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (stateTimer > 20) {
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(deathCause, canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '18px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(`Höjd: ${player.maxHeight} m`, canvas.width / 2, canvas.height / 2 + 15);
        if (stateTimer > 60) {
            ctx.font = '14px monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText(isTouchDevice ? 'Tryck för att försöka igen' : 'Tryck mellanslag', canvas.width / 2, canvas.height / 2 + 50);
        }
    }
}

// === HUVUDLOOP ===

function gameLoop() {
    if (gameState === 'playing') {
        player.update(keys, level.platforms, level.ladders);
        level.update(player.y);
        updateBears();

        // Spikar (hanteras i player.js vid landning)
        if (player.hitSpikes) {
            gameState = 'dead';
            deathCause = 'Spikar!';
            stateTimer = 0;
        }

        // Björnkollision
        for (const bear of bears) {
            if (bear.collidesWith(player)) {
                gameState = 'dead';
                deathCause = 'Björnen tog dig!';
                stateTimer = 0;
                break;
            }
        }

        // Föll för långt
        if (player.y > player.lastGroundY + 500) {
            gameState = 'dead';
            deathCause = 'Du föll!';
            stateTimer = 0;
        }

        if (player.y > level.groundY + 100) {
            gameState = 'dead';
            deathCause = 'Du föll!';
            stateTimer = 0;
        }
    } else {
        stateTimer++;
        if (gameState === 'dead' && stateTimer > 90 && keys[' ']) {
            restartGame();
        }
    }

    const targetCameraY = player.y - canvas.height * 0.45;
    cameraY += (targetCameraY - cameraY) * 0.08;

    drawBackground();
    level.draw(ctx, cameraY, canvas.height);
    for (const bear of bears) bear.draw(ctx, cameraY);
    player.draw(ctx, cameraY);
    drawUI();
    if (gameState === 'dead') drawDeathScreen();

    requestAnimationFrame(gameLoop);
}

gameLoop();
