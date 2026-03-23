// Karaktärsval-skärm med karusell (3 kort synliga åt gången)

// Ordning: Astrid, Alfred, Alice först — resten bläddras fram
const ALL_CHARACTER_IDS = ['astrid', 'alfred', 'alice', 'pappa', 'mamma', 'jeff', 'alvis', 'bob'];

// Karusell-state
let charSelectStartIndex = 0;
const VISIBLE_CARDS = 3;

// Layout-konstanter
const CARD_W = 200;
const CARD_H = 380;
const CARD_GAP = 20;
const CARD_Y = 115;
const CARDS_TOTAL_W = CARD_W * VISIBLE_CARDS + CARD_GAP * (VISIBLE_CARDS - 1);
const CARDS_START_X = (800 - CARDS_TOTAL_W) / 2;

// Pilknappar
const ARROW_SIZE = 44;
const ARROW_Y = CARD_Y + CARD_H / 2 - ARROW_SIZE / 2;
const ARROW_LEFT_X = CARDS_START_X - ARROW_SIZE - 14;
const ARROW_RIGHT_X = CARDS_START_X + CARDS_TOTAL_W + 14;

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

    // Rita 3 synliga kort
    const count = ALL_CHARACTER_IDS.length;
    for (let i = 0; i < VISIBLE_CARDS; i++) {
        const charIndex = charSelectStartIndex + i;
        if (charIndex >= count) break;
        const id = ALL_CHARACTER_IDS[charIndex];
        const char = CHARACTERS[id];
        const x = CARDS_START_X + i * (CARD_W + CARD_GAP);
        const unlocked = economy.isUnlocked(id);
        drawCharacterCard(ctx, x, CARD_Y, CARD_W, CARD_H, char, id, unlocked);
    }

    // Vänsterpil
    if (charSelectStartIndex > 0) {
        drawArrowButton(ctx, ARROW_LEFT_X, ARROW_Y, ARROW_SIZE, 'left');
    }

    // Högerpil
    if (charSelectStartIndex + VISIBLE_CARDS < count) {
        drawArrowButton(ctx, ARROW_RIGHT_X, ARROW_Y, ARROW_SIZE, 'right');
    }

    // Sidindikator (prickar)
    const totalPages = count - VISIBLE_CARDS + 1;
    const dotY = CARD_Y + CARD_H + 18;
    const dotR = 4;
    const dotGap = 14;
    const dotsW = totalPages * dotGap;
    const dotsStartX = canvas.width / 2 - dotsW / 2 + dotGap / 2;
    for (let i = 0; i < totalPages; i++) {
        ctx.beginPath();
        ctx.arc(dotsStartX + i * dotGap, dotY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = i === charSelectStartIndex ? '#FFF' : 'rgba(255,255,255,0.25)';
        ctx.fill();
    }

    // Instruktioner
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    if (isTouchDevice) {
        ctx.fillText('Tryck på en karaktär för att börja', canvas.width / 2, canvas.height - 15);
    } else {
        ctx.fillText('Klicka på en karaktär eller använd pilarna', canvas.width / 2, canvas.height - 15);
    }
}

function drawArrowButton(ctx, x, y, size, direction) {
    // Bakgrund
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roundRect(ctx, x, y, size, size, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, size, size, 10);
    ctx.stroke();

    // Pil
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(direction === 'left' ? '◀' : '▶', x + size / 2, y + size / 2);
    ctx.textBaseline = 'alphabetic';
}

function drawCharacterCard(ctx, x, y, w, h, char, id, unlocked) {
    // Kortbakgrund
    ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)';
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();

    ctx.strokeStyle = unlocked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 12);
    ctx.stroke();

    // Namn
    ctx.fillStyle = unlocked ? '#FFF' : 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(char.name, x + w / 2, y + 32);

    // Karaktär-preview (större nu)
    if (unlocked) {
        const previewScale = (char.scale || 1) > 1 ? 2.4 : 2.2;
        const previewX = x + w / 2 - 12 * previewScale;
        const previewY = y + 50;
        drawCharacterPreview(ctx, previewX, previewY, char, previewScale, id);
    } else {
        // Låst — silhuett
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.font = 'bold 60px monospace';
        ctx.fillText('🔒', x + w / 2, y + 140);
    }

    // Beskrivning
    const descY = y + 210;
    ctx.fillStyle = unlocked ? char.jacket : 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(char.desc, x + w / 2, descY);

    // Stats
    ctx.font = '12px monospace';
    ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)';

    const jumpPct = Math.round(Math.abs(char.jumpForce) / 10.5 * 100);
    const speedPct = Math.round(char.speed / 4.5 * 100);
    const hpPct = Math.round((char.maxHealth || 100) / 100 * 100);

    const bar = (pct) => {
        const filled = Math.round(pct / 10);
        const empty = 10 - Math.min(filled, 10);
        return '█'.repeat(Math.min(filled, 10)) + '░'.repeat(empty);
    };

    const coinMult = char.coinMultiplier || 1;

    ctx.fillText(`⬆ ${bar(jumpPct)} ${jumpPct}%`, x + w / 2, descY + 24);
    ctx.fillText(`➡ ${bar(speedPct)} ${speedPct}%`, x + w / 2, descY + 40);
    ctx.fillText(`♥ ${bar(hpPct)} ${hpPct}%`, x + w / 2, descY + 56);
    if (coinMult > 1) {
        ctx.fillStyle = unlocked ? '#FFD700' : 'rgba(255,215,0,0.3)';
        ctx.fillText(`💰 x${coinMult} PENGAR`, x + w / 2, descY + 72);
        ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)';
    }

    if ((char.scale || 1) > 1) {
        ctx.fillText(`📏 ${Math.round(char.scale * 100)}%`, x + w / 2, descY + (coinMult > 1 ? 88 : 72));
    }

    // Pris / köp-knapp för låsta karaktärer
    if (!unlocked && char.cost) {
        const canBuy = economy.canAfford(id);
        const btnY = y + h - 55;

        ctx.fillStyle = canBuy ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.05)';
        roundRect(ctx, x + 25, btnY, w - 50, 32, 8);
        ctx.fill();
        ctx.strokeStyle = canBuy ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        roundRect(ctx, x + 25, btnY, w - 50, 32, 8);
        ctx.stroke();

        ctx.fillStyle = canBuy ? '#FFD700' : 'rgba(255,255,255,0.3)';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`KÖP ${char.cost} kr`, x + w / 2, btnY + 21);
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

// Hantera klick/touch på karaktärsval-skärmen
function getSelectedCharacter(canvasX, canvasY) {
    const count = ALL_CHARACTER_IDS.length;

    // Kolla vänsterpil
    if (charSelectStartIndex > 0 &&
        canvasX >= ARROW_LEFT_X && canvasX <= ARROW_LEFT_X + ARROW_SIZE &&
        canvasY >= ARROW_Y && canvasY <= ARROW_Y + ARROW_SIZE) {
        charSelectStartIndex--;
        return null; // Navigerade, inget val
    }

    // Kolla högerpil
    if (charSelectStartIndex + VISIBLE_CARDS < count &&
        canvasX >= ARROW_RIGHT_X && canvasX <= ARROW_RIGHT_X + ARROW_SIZE &&
        canvasY >= ARROW_Y && canvasY <= ARROW_Y + ARROW_SIZE) {
        charSelectStartIndex++;
        return null; // Navigerade, inget val
    }

    // Kolla kort
    for (let i = 0; i < VISIBLE_CARDS; i++) {
        const charIndex = charSelectStartIndex + i;
        if (charIndex >= count) break;
        const x = CARDS_START_X + i * (CARD_W + CARD_GAP);
        if (canvasX >= x && canvasX <= x + CARD_W &&
            canvasY >= CARD_Y && canvasY <= CARD_Y + CARD_H) {

            const id = ALL_CHARACTER_IDS[charIndex];

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
