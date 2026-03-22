// UI: höjdmätare, varningar, dödsanimation, touch-knappar

function drawUI(ctx, canvas, player, bearWarning, gameState) {
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
        ctx.fillText('Hoppa på klippavsatserna och klättra stegarna!', canvas.width / 2, canvas.height - 78);
    }

    // Björnvarning
    if (bearWarning > 0) {
        const alpha = Math.min(1, bearWarning / 30);
        const shake = Math.sin(bearWarning * 0.5) * 3;
        ctx.fillStyle = `rgba(180,30,30,${alpha * 0.6})`;
        roundRect(ctx, canvas.width / 2 - 100, canvas.height / 2 - 40 + shake, 200, 50, 10);
        ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.font = 'bold 32px monospace';
        ctx.fillText('BJÖRN!', canvas.width / 2, canvas.height / 2 - 8 + shake);
    }

    // Touch-knappar
    if (isTouchDevice) {
        drawTouchControls(ctx);
    }
}

function drawTouchControls(ctx) {
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

function drawDeathScreen(ctx, canvas, stateTimer, deathCause, player) {
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
            ctx.fillText(
                isTouchDevice ? 'Tryck för att försöka igen' : 'Tryck mellanslag',
                canvas.width / 2, canvas.height / 2 + 50
            );
        }
    }
}
