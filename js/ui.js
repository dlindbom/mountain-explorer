// UI: höjdmätare, varningar, dödsanimation, touch-knappar

// Skadeeffekt-state
let damageFlashTimer = 0;
let lastKnownHealth = -1;

function drawUI(ctx, canvas, player, bearWarning, gameState, enemyWarningText) {
    const height = player.getHeight();

    // Skadeeffekt: kolla om hälsa minskat
    if (lastKnownHealth < 0) lastKnownHealth = player.health;
    if (player.health < lastKnownHealth) {
        damageFlashTimer = 15; // 15 frames röd blinkning
        // Vibrera enheten om möjligt
        if (navigator.vibrate) navigator.vibrate(80);
    }
    lastKnownHealth = player.health;

    // Rita röd blinkning runt kanterna
    if (damageFlashTimer > 0) {
        const a = damageFlashTimer / 15 * 0.5;
        // Röd vinjett runt kanterna
        const edgeSize = 60;
        // Topp
        const topGrad = ctx.createLinearGradient(0, 0, 0, edgeSize);
        topGrad.addColorStop(0, `rgba(200, 0, 0, ${a})`);
        topGrad.addColorStop(1, 'rgba(200, 0, 0, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, canvas.width, edgeSize);
        // Botten
        const botGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - edgeSize);
        botGrad.addColorStop(0, `rgba(200, 0, 0, ${a})`);
        botGrad.addColorStop(1, 'rgba(200, 0, 0, 0)');
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, canvas.height - edgeSize, canvas.width, edgeSize);
        // Vänster
        const leftGrad = ctx.createLinearGradient(0, 0, edgeSize, 0);
        leftGrad.addColorStop(0, `rgba(200, 0, 0, ${a})`);
        leftGrad.addColorStop(1, 'rgba(200, 0, 0, 0)');
        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, edgeSize, canvas.height);
        // Höger
        const rightGrad = ctx.createLinearGradient(canvas.width, 0, canvas.width - edgeSize, 0);
        rightGrad.addColorStop(0, `rgba(200, 0, 0, ${a})`);
        rightGrad.addColorStop(1, 'rgba(200, 0, 0, 0)');
        ctx.fillStyle = rightGrad;
        ctx.fillRect(canvas.width - edgeSize, 0, edgeSize, canvas.height);

        damageFlashTimer--;
    }

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
        ctx.fillText(t('best', { height: player.maxHeight }), canvas.width / 2, 50);
    }

    // Karaktärsnamn (liten text)
    if (player.characterName) {
        ctx.font = '10px monospace';
        ctx.fillStyle = player.colors ? player.colors.jacket : 'rgba(255,255,255,0.4)';
        ctx.fillText(player.characterName, canvas.width / 2, 62);
    }

    // Hälsomätare (vänster uppe)
    drawHealthBar(ctx, player);

    // Pengar (höger uppe)
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    roundRect(ctx, canvas.width - 110, 12, 95, 22, 5);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(coinLabel(economy.coins), canvas.width - 20, 28);
    ctx.textAlign = 'center';

    // Starthjälp
    if (height === 0 && player.vy === 0 && gameState === 'playing') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        roundRect(ctx, canvas.width / 2 - 200, canvas.height - 120, 400, 55, 8);
        ctx.fill();
        ctx.font = '13px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        if (isTouchDevice) {
            ctx.fillText(t('help_touch'), canvas.width / 2, canvas.height - 98);
        } else {
            ctx.fillText(t('help_desktop'), canvas.width / 2, canvas.height - 98);
        }
        ctx.fillText(t('help_instruction'), canvas.width / 2, canvas.height - 78);
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
        ctx.fillText(enemyWarningText || 'BJÖRN!', canvas.width / 2, canvas.height / 2 - 8 + shake);
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

function drawHealthBar(ctx, player) {
    const barX = 15;
    const barY = 15;
    const barW = 120;
    const barH = 14;
    const healthPct = player.health / player.maxHealth;

    // Bakgrund
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    roundRect(ctx, barX - 3, barY - 3, barW + 6, barH + 6, 5);
    ctx.fill();

    // Tom bar
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(barX, barY, barW, barH);

    // Hälsobar (färg ändras med nivå)
    let barColor;
    if (healthPct > 0.6) {
        barColor = '#4CAF50'; // Grön
    } else if (healthPct > 0.3) {
        barColor = '#FF9800'; // Orange
    } else {
        barColor = '#F44336'; // Röd
    }
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barW * healthPct, barH);

    // Pulsera rött vid låg hälsa
    if (healthPct <= 0.3 && healthPct > 0) {
        const pulse = 0.3 + Math.sin(Date.now() * 0.008) * 0.2;
        ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
        ctx.fillRect(barX, barY, barW * healthPct, barH);
    }

    // Text
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`HP ${Math.ceil(player.health)}`, barX + 4, barY + 11);
    ctx.textAlign = 'center'; // Återställ
}

function drawDeathScreen(ctx, canvas, stateTimer, deathCause, player, gotNewRecord, recordEarned) {
    const alpha = Math.min(0.7, stateTimer / 60);
    ctx.fillStyle = `rgba(80,0,0,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (stateTimer > 20) {
        const cy = canvas.height / 2;

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(deathCause, canvas.width / 2, cy - 40);

        ctx.font = '18px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(`Höjd: ${player.maxHeight} m`, canvas.width / 2, cy - 10);

        // Nytt rekord + pengar
        if (gotNewRecord) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 16px monospace';
            ctx.fillText(`NYTT REKORD! +${recordEarned || 10} kr`, canvas.width / 2, cy + 15);
        }

        ctx.fillStyle = '#FFD700';
        ctx.font = '14px monospace';
        ctx.fillText(`💰 ${economy.coins} kr`, canvas.width / 2, cy + 38);

        if (stateTimer > 60) {
            ctx.font = '13px monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            if (isTouchDevice) {
                ctx.fillText('Tryck för att försöka igen', canvas.width / 2, cy + 65);
            } else {
                ctx.fillText('Mellanslag = försök igen', canvas.width / 2, cy + 65);
                ctx.fillText('Escape = byt karaktär', canvas.width / 2, cy + 83);
            }
        }
    }
}
