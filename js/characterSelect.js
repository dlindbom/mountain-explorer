// Karaktärsval-skärm med ekonomi

const ALL_CHARACTER_IDS = ['alfred', 'astrid', 'pappa', 'jeff', 'alvis', 'bob'];

function drawCharacterSelect(ctx, canvas) {
    // Bakgrund
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1a2a4a');
    grad.addColorStop(1, '#2a3a5a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Berg-silhuett
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(200, 200);
    ctx.lineTo(400, 100);
    ctx.lineTo(600, 180);
    ctx.lineTo(800, canvas.height);
    ctx.fill();

    // Titel
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Mountain Explorer', canvas.width / 2, 45);

    ctx.font = '15px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Välj din karaktär', canvas.width / 2, 70);

    // Pengar och rekord
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, canvas.width / 2 - 140, 80, 280, 28, 6);
    ctx.fill();
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`💰 ${economy.coins} kr`, canvas.width / 2 - 50, 98);
    ctx.fillStyle = '#AAA';
    ctx.fillText(`🏔 Rekord: ${economy.bestHeight} m`, canvas.width / 2 + 70, 98);

    // Kort
    const count = ALL_CHARACTER_IDS.length;
    const cardW = count <= 4 ? 175 : count <= 5 ? 148 : 122;
    const cardH = 360;
    const cardY = 118;
    const gap = 12;
    const totalW = cardW * count + gap * (count - 1);
    const startX = (canvas.width - totalW) / 2;

    for (let i = 0; i < count; i++) {
        const id = ALL_CHARACTER_IDS[i];
        const char = CHARACTERS[id];
        const x = startX + i * (cardW + gap);
        const unlocked = economy.isUnlocked(id);
        drawCharacterCard(ctx, x, cardY, cardW, cardH, char, id, String(i + 1), unlocked);
    }

    // Instruktioner
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    if (isTouchDevice) {
        ctx.fillText('Tryck på en karaktär för att börja', canvas.width / 2, canvas.height - 15);
    } else {
        ctx.fillText('Klicka eller tryck 1-' + count, canvas.width / 2, canvas.height - 15);
    }
}

function drawCharacterCard(ctx, x, y, w, h, char, id, keyNum, unlocked) {
    // Kortbakgrund
    ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();

    ctx.strokeStyle = unlocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 10);
    ctx.stroke();

    // Namn
    ctx.fillStyle = unlocked ? '#FFF' : 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(char.name, x + w / 2, y + 28);

    // Karaktär-preview
    if (unlocked) {
        const previewScale = (char.scale || 1) > 1 ? 1.8 : 1.6;
        const previewX = x + w / 2 - 12 * previewScale;
        const previewY = y + 38;
        drawCharacterPreview(ctx, previewX, previewY, char, previewScale, id);
    } else {
        // Låst — silhuett
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.font = 'bold 50px monospace';
        ctx.fillText('🔒', x + w / 2, y + 120);
    }

    // Beskrivning
    const descY = y + 200;
    ctx.fillStyle = unlocked ? char.jacket : 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(char.desc, x + w / 2, descY);

    // Stats
    ctx.font = '10px monospace';
    ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)';

    const jumpPct = Math.round(Math.abs(char.jumpForce) / 10.5 * 100);
    const speedPct = Math.round(char.speed / 4.5 * 100);
    const hpPct = Math.round((char.maxHealth || 100) / 100 * 100);

    const bar = (pct) => pct > 100 ? '██████████' : '██████░░░░';

    const coinMult = char.coinMultiplier || 1;

    ctx.fillText(`⬆ ${bar(jumpPct)} ${jumpPct}%`, x + w / 2, descY + 20);
    ctx.fillText(`➡ ${bar(speedPct)} ${speedPct}%`, x + w / 2, descY + 33);
    ctx.fillText(`♥ ${bar(hpPct)} ${hpPct}%`, x + w / 2, descY + 46);
    if (coinMult > 1) {
        ctx.fillStyle = unlocked ? '#FFD700' : 'rgba(255,215,0,0.3)';
        ctx.fillText(`💰 x${coinMult} PENGAR`, x + w / 2, descY + 59);
        ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)';
    }

    if ((char.scale || 1) > 1) {
        ctx.fillText(`📏 ${Math.round(char.scale * 100)}%`, x + w / 2, descY + 67);
    }

    // Pris / köp-knapp för låsta karaktärer
    if (!unlocked && char.cost) {
        const canBuy = economy.canAfford(id);
        const btnY = y + h - 45;

        ctx.fillStyle = canBuy ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.05)';
        roundRect(ctx, x + 15, btnY, w - 30, 28, 6);
        ctx.fill();
        ctx.strokeStyle = canBuy ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        roundRect(ctx, x + 15, btnY, w - 30, 28, 6);
        ctx.stroke();

        ctx.fillStyle = canBuy ? '#FFD700' : 'rgba(255,255,255,0.3)';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`KÖP ${char.cost} kr`, x + w / 2, btnY + 18);
    }

    // Tangent
    if (unlocked) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '10px monospace';
        if (!isTouchDevice) {
            ctx.fillText('Tryck ' + keyNum, x + w / 2, y + h - 10);
        }
    }
}

function drawCharacterPreview(ctx, x, y, char, s, id) {
    ctx.fillStyle = char.pants;
    ctx.fillRect(x + 4 * s, y + 24 * s, 7 * s, 8 * s);
    ctx.fillRect(x + 13 * s, y + 24 * s, 7 * s, 8 * s);

    ctx.fillStyle = '#5C4033';
    ctx.fillRect(x + 3 * s, y + 30 * s, 9 * s, 3 * s);
    ctx.fillRect(x + 12 * s, y + 30 * s, 9 * s, 3 * s);

    ctx.fillStyle = char.jacket;
    ctx.fillRect(x + 3 * s, y + 12 * s, 18 * s, 13 * s);

    ctx.fillStyle = char.backpack;
    ctx.fillRect(x + 18 * s, y + 13 * s, 6 * s, 10 * s);

    ctx.fillStyle = '#FFDAB9';
    ctx.fillRect(x + 5 * s, y + 3 * s, 14 * s, 11 * s);

    ctx.fillStyle = char.hat;
    ctx.fillRect(x + 4 * s, y, 16 * s, 6 * s);
    ctx.fillRect(x + 7 * s, y - 2 * s, 10 * s, 3 * s);

    ctx.fillStyle = '#1D3557';
    ctx.fillRect(x + 10 * s, y + 7 * s, 2 * s, 2 * s);
    ctx.fillRect(x + 16 * s, y + 7 * s, 2 * s, 2 * s);

    if (id === 'pappa') {
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 7 * s, y + 11 * s, 10 * s, 4 * s);
        ctx.fillStyle = '#C1666B';
        ctx.fillRect(x + 10 * s, y + 15 * s, 4 * s, 1 * s);
    } else {
        ctx.fillStyle = '#C1666B';
        ctx.fillRect(x + 12 * s, y + 11 * s, 4 * s, 1 * s);
    }

    // Jeff glow-effekt
    if (id === 'jeff') {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(x + 12 * s, y + 16 * s, 14 * s, 18 * s, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Kolla om ett klick/touch träffar ett kort (eller köp-knapp)
function getSelectedCharacter(canvasX, canvasY) {
    const count = ALL_CHARACTER_IDS.length;
    const cardW = count <= 4 ? 175 : count <= 5 ? 148 : 122;
    const cardH = 360;
    const cardY = 118;
    const gap = 12;
    const totalW = cardW * count + gap * (count - 1);
    const startX = (800 - totalW) / 2;

    for (let i = 0; i < count; i++) {
        const x = startX + i * (cardW + gap);
        if (canvasX >= x && canvasX <= x + cardW &&
            canvasY >= cardY && canvasY <= cardY + cardH) {

            const id = ALL_CHARACTER_IDS[i];

            if (economy.isUnlocked(id)) {
                return id; // Välj karaktären
            }

            // Försök köpa
            if (economy.buyCharacter(id)) {
                return id; // Köpt och vald!
            }

            return null; // Inte råd
        }
    }
    return null;
}
