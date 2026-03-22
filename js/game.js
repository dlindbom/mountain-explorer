// Mountain Explorer - Huvudspelloop
// Byggt av Daniel och hans son

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Anpassa canvas till skärmen (viktigt för iPad/mobil)
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
const level = new Level();
const player = new Player(380, level.groundY - 32);

let cameraY = 0;
const keys = {};
let gameState = 'playing'; // 'playing', 'dead', 'victory'
let stateTimer = 0;

// Kolla om enheten har touch
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// Touch-knappar (visas bara på touch-enheter)
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

// Omvandla touch-koordinater till canvas-koordinater
function touchToCanvas(touch) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
    };
}

// Kolla om en punkt träffar en knapp
function hitButton(pos, btn) {
    return pos.x >= btn.x && pos.x <= btn.x + btn.w &&
           pos.y >= btn.y && pos.y <= btn.y + btn.h;
}

// Uppdatera alla touch-knappar baserat på aktiva touches
function updateTouchButtons(touches) {
    // Nollställ alla knappar
    for (const name in touchButtons) {
        const btn = touchButtons[name];
        btn.pressed = false;
        keys[btn.key] = false;
    }

    // Kolla varje aktiv touch mot varje knapp
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

// Rita himmel och bakgrund
function drawBackground() {
    // Himmelfärg ändras med höjden
    const altitude = Math.max(0, -cameraY);
    const maxAlt = Math.abs(level.peakY);
    const progress = Math.min(1, altitude / maxAlt);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

    if (progress > 0.7) {
        // Hög höjd - mörk himmel
        gradient.addColorStop(0, '#0F1B33');
        gradient.addColorStop(1, '#1B3A5C');
    } else if (progress > 0.4) {
        // Mellanhöjd
        gradient.addColorStop(0, '#2E5090');
        gradient.addColorStop(1, '#6B9AC4');
    } else {
        // Låg höjd - ljus himmel
        gradient.addColorStop(0, '#5BA3D9');
        gradient.addColorStop(1, '#A8D8EA');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stjärnor vid hög höjd
    if (progress > 0.6) {
        const starAlpha = (progress - 0.6) / 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha * 0.8})`;
        for (let i = 0; i < 30; i++) {
            const sx = (i * 137 + 50) % 780 + 10;
            const sy = (i * 97 + 30) % 580 + 10;
            const size = (i % 3) + 1;
            ctx.fillRect(sx, sy, size, size);
        }
    }

    // Moln (parallax-effekt)
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 - progress * 0.2})`;
    for (let i = 0; i < 6; i++) {
        const cloudBaseY = i * 300 + 100;
        const cloudScreenY = cloudBaseY - cameraY * 0.2;
        const cloudX = ((i * 173 + 80) % 700) + 20;

        // Visa bara moln som är nära synfältet
        if (cloudScreenY > -100 && cloudScreenY < canvas.height + 100) {
            ctx.beginPath();
            ctx.arc(cloudX, cloudScreenY, 25 + i * 3, 0, Math.PI * 2);
            ctx.arc(cloudX + 30, cloudScreenY - 8, 20 + i * 2, 0, Math.PI * 2);
            ctx.arc(cloudX + 55, cloudScreenY, 22 + i * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Bakgrundsbergen (parallax)
    ctx.fillStyle = 'rgba(100, 115, 130, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(100, 300 - cameraY * 0.05);
    ctx.lineTo(220, 400 - cameraY * 0.05);
    ctx.lineTo(350, 200 - cameraY * 0.05);
    ctx.lineTo(500, 350 - cameraY * 0.05);
    ctx.lineTo(650, 180 - cameraY * 0.05);
    ctx.lineTo(800, 300 - cameraY * 0.05);
    ctx.lineTo(800, canvas.height);
    ctx.fill();
}

// Rita höjdmätare
function drawUI() {
    const height = player.getHeight();
    const maxHeight = player.maxHeight;
    const totalHeight = Math.round((level.groundY - level.peakY) / 10);

    // Höjdpanel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    roundRect(ctx, canvas.width / 2 - 90, 8, 180, 44, 8);
    ctx.fill();

    // Höjdtext
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⛰ ${height} m`, canvas.width / 2, 36);

    // Progressbar
    const barWidth = 160;
    const barX = canvas.width / 2 - barWidth / 2;
    const progress = Math.min(1, height / totalHeight);

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(barX, 42, barWidth, 4);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(barX, 42, barWidth * progress, 4);

    // Bästa höjd
    if (maxHeight > 0 && height < maxHeight) {
        ctx.font = '11px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(`Bäst: ${maxHeight} m`, canvas.width / 2, 62);
    }

    // Kontrollhjälp (visas bara vid start)
    if (height === 0 && player.vy === 0 && gameState === 'playing') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
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

    // Rita touch-knappar (bara på touch-enheter)
    if (isTouchDevice) {
        drawTouchControls();
    }
}

// Rita touch-kontroller
function drawTouchControls() {
    for (const name in touchButtons) {
        const btn = touchButtons[name];
        const isPressed = btn.pressed;

        // Knappbakgrund
        ctx.fillStyle = isPressed ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)';
        roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 16);
        ctx.fill();

        // Kant
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 16);
        ctx.stroke();

        // Symbol
        ctx.fillStyle = isPressed ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.6)';
        ctx.font = name === 'jump' ? 'bold 36px monospace' : 'bold 30px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
    ctx.textBaseline = 'alphabetic';
}

// Hjälpfunktion: rundade rektanglar
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
    ctx.fillStyle = `rgba(139, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (stateTimer > 20) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Du föll!', canvas.width / 2, canvas.height / 2 - 10);

        ctx.font = '16px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(`Du nådde ${player.getHeight()} meter`, canvas.width / 2, canvas.height / 2 + 25);
    }
}

// Vinst-skärm
function drawVictoryScreen() {
    const alpha = Math.min(0.5, stateTimer / 60);
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 42px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Toppen nådd!', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#FFF';
    ctx.font = '20px monospace';
    ctx.fillText(`Du klättrade ${player.maxHeight} meter!`, canvas.width / 2, canvas.height / 2 + 20);

    if (stateTimer > 90) {
        ctx.font = '14px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        if (isTouchDevice) {
            ctx.fillText('Tryck på skärmen för att spela igen', canvas.width / 2, canvas.height / 2 + 60);
        } else {
            ctx.fillText('Tryck mellanslag för att spela igen', canvas.width / 2, canvas.height / 2 + 60);
        }
    }
}

// Huvudloop
function gameLoop() {
    if (gameState === 'playing') {
        player.update(keys, level.platforms);

        // Kolla om spelaren föll under marken
        if (player.y > level.groundY + 100) {
            gameState = 'dead';
            stateTimer = 0;
        }

        // Kolla om spelaren nått toppen
        const totalHeight = Math.round((level.groundY - level.peakY) / 10);
        if (player.getHeight() >= totalHeight - 5) {
            gameState = 'victory';
            stateTimer = 0;
        }
    } else {
        stateTimer++;

        // Omstart efter död
        if (gameState === 'dead' && stateTimer > 90) {
            player.reset();
            cameraY = 0;
            gameState = 'playing';
        }

        // Omstart efter vinst (mellanslag eller touch)
        if (gameState === 'victory' && stateTimer > 90 && (keys[' '] || keys['_touchRestart'])) {
            keys['_touchRestart'] = false;
            player.reset();
            cameraY = 0;
            gameState = 'playing';
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
    if (gameState === 'victory') drawVictoryScreen();

    requestAnimationFrame(gameLoop);
}

// Touch på skärmen för omstart vid vinst
canvas.addEventListener('touchstart', (e) => {
    if (gameState === 'victory' && stateTimer > 90) {
        keys['_touchRestart'] = true;
    }
}, { passive: true });

// Starta spelet!
gameLoop();
