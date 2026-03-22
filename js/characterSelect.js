// Karaktärsval-skärm

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
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Mountain Explorer', canvas.width / 2, 60);

    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Välj din karaktär', canvas.width / 2, 90);

    // Tre kort bredvid varandra
    const cardW = 220;
    const cardH = 370;
    const cardY = 115;
    const gap = 20;
    const totalW = cardW * 3 + gap * 2;
    const startX = (canvas.width - totalW) / 2;

    drawCharacterCard(ctx, startX, cardY, cardW, cardH, CHARACTERS.alfred, 'alfred', '1');
    drawCharacterCard(ctx, startX + cardW + gap, cardY, cardW, cardH, CHARACTERS.astrid, 'astrid', '2');
    drawCharacterCard(ctx, startX + (cardW + gap) * 2, cardY, cardW, cardH, CHARACTERS.pappa, 'pappa', '3');

    // Instruktioner
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    if (isTouchDevice) {
        ctx.fillText('Tryck på en karaktär för att börja', canvas.width / 2, canvas.height - 20);
    } else {
        ctx.fillText('Klicka på en karaktär eller tryck 1 / 2 / 3', canvas.width / 2, canvas.height - 20);
    }
}

function drawCharacterCard(ctx, x, y, w, h, char, id, keyNum) {
    // Kortbakgrund
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 12);
    ctx.stroke();

    // Namn
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(char.name, x + w / 2, y + 32);

    // Rita karaktären
    const previewScale = id === 'pappa' ? 2.5 : 2;
    const previewX = x + w / 2 - 12 * previewScale;
    const previewY = y + 45;
    drawCharacterPreview(ctx, previewX, previewY, char, previewScale, id);

    // Beskrivning
    const descY = y + 220;
    ctx.fillStyle = char.jacket;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(char.desc, x + w / 2, descY);

    // Stats
    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';

    const jumpPct = id === 'alfred' ? 150 : 100;
    const speedPct = id === 'astrid' ? 150 : 100;
    const hpPct = id === 'pappa' ? 150 : 100;

    const barFull = '███████';
    const barHalf = '████░░░';
    const barExtra = '██████████';

    ctx.fillText(`⬆ HOPP: ${jumpPct > 100 ? barExtra : barHalf} ${jumpPct}%`, x + w / 2, descY + 25);
    ctx.fillText(`➡ FART: ${speedPct > 100 ? barExtra : barHalf} ${speedPct}%`, x + w / 2, descY + 42);
    ctx.fillText(`♥ HÄLSA: ${hpPct > 100 ? barExtra : barHalf} ${hpPct}%`, x + w / 2, descY + 59);

    // Storlek-indikator för Pappa
    if (id === 'pappa') {
        ctx.fillText('📏 STORLEK: 150%', x + w / 2, descY + 76);
    }

    // Tangent
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px monospace';
    if (!isTouchDevice) {
        ctx.fillText('Tryck ' + keyNum, x + w / 2, y + h - 12);
    }
}

function drawCharacterPreview(ctx, x, y, char, s, id) {
    // Ben
    ctx.fillStyle = char.pants;
    ctx.fillRect(x + 4 * s, y + 24 * s, 7 * s, 8 * s);
    ctx.fillRect(x + 13 * s, y + 24 * s, 7 * s, 8 * s);

    // Kängor
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(x + 3 * s, y + 30 * s, 9 * s, 3 * s);
    ctx.fillRect(x + 12 * s, y + 30 * s, 9 * s, 3 * s);

    // Kropp
    ctx.fillStyle = char.jacket;
    ctx.fillRect(x + 3 * s, y + 12 * s, 18 * s, 13 * s);

    // Ryggsäck
    ctx.fillStyle = char.backpack;
    ctx.fillRect(x + 18 * s, y + 13 * s, 6 * s, 10 * s);

    // Huvud
    ctx.fillStyle = '#FFDAB9';
    ctx.fillRect(x + 5 * s, y + 3 * s, 14 * s, 11 * s);

    // Mössa
    ctx.fillStyle = char.hat;
    ctx.fillRect(x + 4 * s, y, 16 * s, 6 * s);
    ctx.fillRect(x + 7 * s, y - 2 * s, 10 * s, 3 * s);

    // Ögon
    ctx.fillStyle = '#1D3557';
    ctx.fillRect(x + 10 * s, y + 7 * s, 2 * s, 2 * s);
    ctx.fillRect(x + 16 * s, y + 7 * s, 2 * s, 2 * s);

    // Skägg för Pappa
    if (id === 'pappa') {
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 7 * s, y + 11 * s, 10 * s, 4 * s);
        ctx.fillRect(x + 6 * s, y + 12 * s, 2 * s, 2 * s);
        ctx.fillRect(x + 18 * s, y + 12 * s, 2 * s, 2 * s);

        // Mun under skägget
        ctx.fillStyle = '#C1666B';
        ctx.fillRect(x + 10 * s, y + 15 * s, 4 * s, 1 * s);
    } else {
        // Mun
        ctx.fillStyle = '#C1666B';
        ctx.fillRect(x + 12 * s, y + 11 * s, 4 * s, 1 * s);
    }
}

// Kolla om ett klick/touch träffar ett kort
function getSelectedCharacter(canvasX, canvasY) {
    const cardW = 220;
    const cardH = 370;
    const cardY = 115;
    const gap = 20;
    const totalW = cardW * 3 + gap * 2;
    const startX = (800 - totalW) / 2;

    // Alfred
    if (canvasX >= startX && canvasX <= startX + cardW &&
        canvasY >= cardY && canvasY <= cardY + cardH) {
        return 'alfred';
    }
    // Astrid
    const astridX = startX + cardW + gap;
    if (canvasX >= astridX && canvasX <= astridX + cardW &&
        canvasY >= cardY && canvasY <= cardY + cardH) {
        return 'astrid';
    }
    // Pappa
    const pappaX = startX + (cardW + gap) * 2;
    if (canvasX >= pappaX && canvasX <= pappaX + cardW &&
        canvasY >= cardY && canvasY <= cardY + cardH) {
        return 'pappa';
    }
    return null;
}
