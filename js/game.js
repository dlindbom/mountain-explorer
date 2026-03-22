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

// Skapa spelet
let level = new Level();
let player = new Player(380, level.groundY - 32);

let cameraY = 0;
const keys = {};
let gameState = 'playing';
let stateTimer = 0;

// Kolla om enheten har touch
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// Touch-knappar
const touchButtons = {
    left:  { x: 20,  y: 480, w: 80, h: 80, key: 'ArrowLeft',  label: '←', pressed: false },
    right: { x: 120, y: 480, w: 80, h: 80, key: 'ArrowRight', label: '→', pressed: false },
    jump:  { x: 680, y: 480, w: 100, h: 100, key: ' ',         label: '↑', pressed: false },
};

// Tangentbordsinput
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Touch-hantering
function touchToCanvas(touch) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
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

    // Touch för omstart vid död
    if (gameState === 'dead' && stateTimer > 90) {
        restartGame();
    }
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

// Starta om spelet
function restartGame() {
    level = new Level();
    player = new Player(380, level.groundY - 32);
    cameraY = 0;
    gameState = 'playing';
    stateTimer = 0;
}

// Bergvägg-textur (förgenererad för prestanda)
const wallCanvas = document.createElement('canvas');
wallCanvas.width = 800;
wallCanvas.height = 200;
const wallCtx = wallCanvas.getContext('2d');

function generateWallTexture() {
    // Grundfärg
    wallCtx.fillStyle = '#4A4A4A';
    wallCtx.fillRect(0, 0, 800, 200);

    // Stenblock-mönster
    for (let row = 0; row < 8; row++) {
        const rowOffset = (row % 2) * 40;
        for (let col = -1; col < 11; col++) {
            const bx = col * 80 + rowOffset;
            const by = row * 25;
            const bw = 75 + Math.random() * 5;
            const bh = 22 + Math.random() * 3;

            // Varierande grå
            const shade = 60 + Math.random() * 25;
            wallCtx.fillStyle = `rgb(${shade}, ${shade - 3}, ${shade - 5})`;
            wallCtx.fillRect(bx + 1, by + 1, bw - 2, bh - 2);

            // Ljus kant uppe
            wallCtx.fillStyle = `rgba(255, 255, 255, 0.05)`;
            wallCtx.fillRect(bx + 2, by + 1, bw - 4, 1);

            // Mörk kant nere
            wallCtx.fillStyle = `rgba(0, 0, 0, 0.1)`;
            wallCtx.fillRect(bx + 2, by + bh - 2, bw - 4, 1);
        }
    }

    // Sprickor
    wallCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    wallCtx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        wallCtx.beginPath();
        const sx = Math.random() * 800;
        const sy = Math.random() * 200;
        wallCtx.moveTo(sx, sy);
        wallCtx.lineTo(sx + (Math.random() - 0.5) * 30, sy + 10 + Math.random() * 20);
        wallCtx.stroke();
    }
}
generateWallTexture();

// Rita bergväggen som bakgrund
function drawBackground() {
    // Tila väggtexturen
    const offsetY = (-cameraY * 0.8) % 200;
    for (let y = -200 + offsetY; y < canvas.height + 200; y += 200) {
        ctx.drawImage(wallCanvas, 0, y);
    }

    // Mörkare gradient i kanterna (djup-effekt)
    const edgeGrad = ctx.createLinearGradient(0, 0, 60, 0);
    edgeGrad.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    edgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, 60, canvas.height);

    const edgeGrad2 = ctx.createLinearGradient(800, 0, 740, 0);
    edgeGrad2.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    edgeGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = edgeGrad2;
    ctx.fillRect(740, 0, 60, canvas.height);

    // Subtil höjdbaserad färgton
    const altitude = Math.max(0, -cameraY);
    const progress = Math.min(1, altitude / 5000);

    if (progress > 0.5) {
        // Kall blåton på hög höjd
        ctx.fillStyle = `rgba(100, 130, 170, ${(progress - 0.5) * 0.15})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Rita höjdmätare
function drawUI() {
    const height = player.getHeight();
    const maxHeight = player.maxHeight;

    // Höjdpanel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    roundRect(ctx, canvas.width / 2 - 90, 8, 180, 44, 8);
    ctx.fill();

    // Höjdtext
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⛰ ${height} m`, canvas.width / 2, 36);

    // Bästa höjd
    if (maxHeight > height) {
        ctx.font = '11px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(`Bäst: ${maxHeight} m`, canvas.width / 2, 50);
    }

    // Kontrollhjälp
    if (height === 0 && player.vy === 0 && gameState === 'playing') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        roundRect(ctx, canvas.width / 2 - 180, canvas.height - 120, 360, 35, 8);
        ctx.fill();

        ctx.font = '14px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        if (isTouchDevice) {
            ctx.fillText('Använd knapparna för att röra dig och hoppa', canvas.width / 2, canvas.height - 98);
        } else {
            ctx.fillText('← → Röra sig    ↑ / Mellanslag = Hoppa', canvas.width / 2, canvas.height - 98);
        }
    }

    // Varning för spikar (visas tidigt)
    if (height > 0 && height < 15 && gameState === 'playing') {
        ctx.font = '12px monospace';
        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.fillText('Akta spikarna!', canvas.width / 2, 70);
    }

    // Touch-knappar
    if (isTouchDevice) {
        drawTouchControls();
    }
}

function drawTouchControls() {
    for (const name in touchButtons) {
        const btn = touchButtons[name];
        const isPressed = btn.pressed;

        ctx.fillStyle = isPressed ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)';
        roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 16);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 16);
        ctx.stroke();

        ctx.fillStyle = isPressed ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.6)';
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
    ctx.fillStyle = `rgba(100, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (stateTimer > 20) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';

        if (player.hitSpikes) {
            ctx.fillText('Spikar!', canvas.width / 2, canvas.height / 2 - 20);
        } else {
            ctx.fillText('Du föll!', canvas.width / 2, canvas.height / 2 - 20);
        }

        ctx.font = '18px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(`Höjd: ${player.maxHeight} m`, canvas.width / 2, canvas.height / 2 + 15);

        if (stateTimer > 60) {
            ctx.font = '14px monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            if (isTouchDevice) {
                ctx.fillText('Tryck för att försöka igen', canvas.width / 2, canvas.height / 2 + 50);
            } else {
                ctx.fillText('Tryck mellanslag för att försöka igen', canvas.width / 2, canvas.height / 2 + 50);
            }
        }
    }
}

// Huvudloop
function gameLoop() {
    if (gameState === 'playing') {
        player.update(keys, level.platforms);
        level.update(player.y);

        // Död: spikar
        if (player.hitSpikes) {
            gameState = 'dead';
            stateTimer = 0;
        }

        // Död: föll för långt under senaste plattform
        if (player.y > player.lastGroundY + 500) {
            gameState = 'dead';
            stateTimer = 0;
        }

        // Död: under marken
        if (player.y > level.groundY + 100) {
            gameState = 'dead';
            stateTimer = 0;
        }
    } else {
        stateTimer++;

        // Omstart med mellanslag
        if (gameState === 'dead' && stateTimer > 90 && keys[' ']) {
            restartGame();
        }
    }

    // Kamera följer spelaren smidigt
    const targetCameraY = player.y - canvas.height * 0.45;
    cameraY += (targetCameraY - cameraY) * 0.08;

    // Rita allt
    drawBackground();
    level.draw(ctx, cameraY, canvas.height);
    player.draw(ctx, cameraY);
    drawUI();

    if (gameState === 'dead') drawDeathScreen();

    requestAnimationFrame(gameLoop);
}

// Starta spelet!
gameLoop();
