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
    ctx.fillText('Mountain Explorer', canvas.width / 2, 70);

    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Välj din karaktär', canvas.width / 2, 105);

    // Alfred-kort (vänster)
    drawCharacterCard(ctx, 100, 150, 250, 350, CHARACTERS.alfred, 'alfred');

    // Astrid-kort (höger)
    drawCharacterCard(ctx, 450, 150, 250, 350, CHARACTERS.astrid, 'astrid');

    // Instruktioner
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    if (isTouchDevice) {
        ctx.fillText('Tryck på en karaktär för att börja', canvas.width / 2, canvas.height - 30);
    } else {
        ctx.fillText('Klicka på en karaktär eller tryck 1 / 2', canvas.width / 2, canvas.height - 30);
    }
}

function drawCharacterCard(ctx, x, y, w, h, char, id) {
    // Kortbakgrund
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();

    // Kant
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 12);
    ctx.stroke();

    // Namn
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(char.name, x + w / 2, y + 35);

    // Rita karaktären (stor version)
    drawCharacterPreview(ctx, x + w / 2 - 24, y + 60, char);

    // Beskrivning
    ctx.fillStyle = char.jacket;
    ctx.font = 'bold 15px monospace';
    ctx.fillText(char.desc, x + w / 2, y + 250);

    // Stats
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';

    const jumpLabel = id === 'alfred' ? '⬆ HOPP: ███████████ 150%' : '⬆ HOPP: ███████░░░░ 100%';
    const speedLabel = id === 'astrid' ? '➡ FART: ███████████ 150%' : '➡ FART: ███████░░░░ 100%';

    ctx.textAlign = 'center';
    ctx.fillText(jumpLabel, x + w / 2, y + 285);
    ctx.fillText(speedLabel, x + w / 2, y + 305);

    // Knapptext
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px monospace';
    if (!isTouchDevice) {
        ctx.fillText(id === 'alfred' ? 'Tryck 1' : 'Tryck 2', x + w / 2, y + h - 15);
    }
}

function drawCharacterPreview(ctx, x, y, char) {
    // Stor version av karaktären (2x skala)
    const s = 2;

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

    // Mun (leende)
    ctx.fillStyle = '#C1666B';
    ctx.fillRect(x + 12 * s, y + 11 * s, 4 * s, 1 * s);
}

// Kolla om ett klick/touch träffar ett kort
function getSelectedCharacter(canvasX, canvasY) {
    // Alfred-kort: x=100, y=150, w=250, h=350
    if (canvasX >= 100 && canvasX <= 350 && canvasY >= 150 && canvasY <= 500) {
        return 'alfred';
    }
    // Astrid-kort: x=450, y=150, w=250, h=350
    if (canvasX >= 450 && canvasX <= 700 && canvasY >= 150 && canvasY <= 500) {
        return 'astrid';
    }
    return null;
}
