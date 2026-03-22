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

// Björn-spawning
let nextBearHeight = 100; // Första björnen vid 100m
let bearWarning = 0;

// Touch-detektering
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// Touch-knappar (↑ = ArrowUp för att kunna klättra)
const touchButtons = {
    left:  { x: 20,  y: 480, w: 80, h: 80, key: 'ArrowLeft',  label: '←', pressed: false },
    right: { x: 120, y: 480, w: 80, h: 80, key: 'ArrowRight', label: '→', pressed: false },
    jump:  { x: 680, y: 480, w: 100, h: 100, key: 'ArrowUp',  label: '↑', pressed: false },
};

// Tangentbord
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Touch-hantering
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
        const btn = touchButtons[name];
        btn.pressed = false;
        keys[btn.key] = false;
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

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateTouchButtons(e.touches);
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    updateTouchButtons(e.touches);
}, { passive: false });

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    updateTouchButtons(e.touches);
}, { passive: false });

// Starta om
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

// Bergvägg-textur (förrenderad)
const wallCanvas = document.createElement('canvas');
wallCanvas.width = 800;
wallCanvas.height = 200;
const wallCtx = wallCanvas.getContext('2d');

(function generateWallTexture() {
    wallCtx.fillStyle = '#484848';
    wallCtx.fillRect(0, 0, 800, 200);

    for (let row = 0; row < 8; row++) {
        const rowOffset = (row % 2) * 40;
        for (let col = -1; col < 11; col++) {
            const bx = col * 80 + rowOffset;
            const by = row * 25;
            const bw = 74 + Math.random() * 6;
            const bh = 22 + Math.random() * 3;
            const shade = 55 + Math.random() * 25;
            wallCtx.fillStyle = `rgb(${shade}, ${shade - 3}, ${shade - 5})`;
            wallCtx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);

            wallCtx.fillStyle = 'rgba(255,255,255,0.04)';
            wallCtx.fillRect(bx + 2, by + 1, bw - 4, 1);
            wallCtx.fillStyle = 'rgba(0,0,0,0.08)';
            wallCtx.fillRect(bx + 2, by + bh - 2, bw - 4, 1);
        }
    }

    wallCtx.strokeStyle = 'rgba(0,0,0,0.15)';
    wallCtx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
        wallCtx.beginPath();
        const sx = Math.random() * 800;
        const sy = Math.random() * 200;
        wallCtx.moveTo(sx, sy);
        wallCtx.lineTo(sx + (Math.random() - 0.5) * 30, sy + 10 + Math.random() * 25);
        wallCtx.stroke();
    }
})();

// Rita bakgrund
function drawBackground() {
    const offsetY = (-cameraY * 0.8) % 200;
    for (let y = -200 + offsetY; y < canvas.height + 200; y += 200) {
        ctx.drawImage(wallCanvas, 0, y);
    }

    // Mörka kanter
    const leftGrad = ctx.createLinearGradient(0, 0, 50, 0);
    leftGrad.addColorStop(0, 'rgba(0,0,0,0.35)');
    leftGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, 50, canvas.height);

    const rightGrad = ctx.createLinearGradient(800, 0, 750, 0);
    rightGrad.addColorStop(0, 'rgba(0,0,0,0.35)');
    rightGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(750, 0, 50, canvas.height);
}

// Spike-kollision
function checkSpikeCollision() {
    if (player.climbing) return;

    for (const spike of level.spikes) {
        if (player.x + player.width > spike.x + 3 &&
            player.x < spike.x + spike.width - 3 &&
            player.y + player.height > spike.y + 5) {
            player.hitSpikes = true;
            return;
        }
    }
}

// Björn-spawning
function updateBears() {
    const height = player.getHeight();

    // Spawna ny björn var 100:e meter
    if (height >= nextBearHeight && gameState === 'playing') {
        // Hitta bron spelaren är nära
        let bridgeY = level.groundY;
        for (const p of level.platforms) {
            if (p.type !== 'ground' && Math.abs(p.y - (player.y + player.height)) < 20) {
                bridgeY = p.y;
                break;
            }
        }

        // Spawna på andra sidan bron
        const bearX = player.x < 400 ? 720 : 20;
        bears.push(new Bear(bearX, bridgeY));
        nextBearHeight += 100;
        bearWarning = 120;
    }

    // Uppdatera björnar
    for (const bear of bears) {
        bear.update(player.x + player.width / 2);
    }

    // Rensa björnar som är långt bort
    bears = bears.filter(b => b.active && Math.abs(b.bridgeY - player.y) < 1000);
}

// Rita UI
function drawUI() {
    const height = player.getHeight();

    // Höjdpanel
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

    // Starthjälp
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
        ctx.fillText('Hitta stegen och klättra uppåt!', canvas.width / 2, canvas.height - 78);
    }

    // Björnvarning
    if (bearWarning > 0) {
        bearWarning--;
        const alpha = Math.min(1, bearWarning / 30);
        const shake = Math.sin(bearWarning * 0.5) * 3;

        ctx.fillStyle = `rgba(180, 30, 30, ${alpha * 0.6})`;
        roundRect(ctx, canvas.width / 2 - 100, canvas.height / 2 - 40 + shake, 200, 50, 10);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.font = 'bold 32px monospace';
        ctx.fillText('BJÖRN!', canvas.width / 2, canvas.height / 2 - 8 + shake);
    }

    // Touch-knappar
    if (isTouchDevice) {
        drawTouchControls();
    }
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

// Dödsanimation
function drawDeathScreen() {
    const alpha = Math.min(0.7, stateTimer / 60);
    ctx.fillStyle = `rgba(80, 0, 0, ${alpha})`;
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
            ctx.fillText(
                isTouchDevice ? 'Tryck för att försöka igen' : 'Tryck mellanslag för att försöka igen',
                canvas.width / 2, canvas.height / 2 + 50
            );
        }
    }
}

// Huvudloop
function gameLoop() {
    if (gameState === 'playing') {
        player.update(keys, level.platforms, level.ladders);
        level.update(player.y);
        updateBears();
        checkSpikeCollision();

        // Kolla dödsorsaker
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

        // Under marken
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

    // Kamera
    const targetCameraY = player.y - canvas.height * 0.45;
    cameraY += (targetCameraY - cameraY) * 0.08;

    // Rita allt
    drawBackground();
    level.draw(ctx, cameraY, canvas.height);

    // Rita björnar
    for (const bear of bears) {
        bear.draw(ctx, cameraY);
    }

    player.draw(ctx, cameraY);
    drawUI();

    if (gameState === 'dead') drawDeathScreen();

    requestAnimationFrame(gameLoop);
}

// Starta!
gameLoop();
