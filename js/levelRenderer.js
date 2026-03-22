// Level-rendering: ritar klippmassa, ytor, broar, stegar och spikar

function drawLevel(ctx, level, cameraY, canvasHeight) {
    // Pass 1: Klippmassa under avsatser (bakom allt)
    for (const p of level.platforms) {
        const sy = p.y - cameraY;
        if (sy < -200 || sy > canvasHeight + 50) continue;
        if (p.type === 'ledge') drawRockBody(ctx, p, sy);
        if (p.type === 'ground') drawGroundBody(ctx, p, sy);
    }

    // Stegar (bakom ytor)
    for (const ladder of level.ladders) {
        drawLadder(ctx, ladder, cameraY, canvasHeight);
    }

    // Pass 2: Ytor ovanpå
    for (const p of level.platforms) {
        const sy = p.y - cameraY;
        if (sy < -50 || sy > canvasHeight + 50) continue;

        if (p.type === 'ground') drawGroundSurface(ctx, p, sy);
        else if (p.type === 'bridge') drawBridge(ctx, p, sy);
        else drawLedgeSurface(ctx, p, sy);

        if (p.spikeStart !== undefined) drawSpikes(ctx, p, sy);
    }
}

// === KLIPPMASSA ===

function drawRockBody(ctx, p, sy) {
    const depth = 140;
    const shade = 58 + Math.sin(p.y * 0.04) * 6;

    ctx.fillStyle = `rgb(${shade}, ${shade - 4}, ${shade - 8})`;
    ctx.beginPath();

    if (p.fromWall === 'left') {
        ctx.moveTo(0, sy);
        ctx.lineTo(p.width, sy);
        ctx.lineTo(p.width - 3, sy + 12);
        ctx.lineTo(p.width - 12, sy + 45);
        ctx.lineTo(p.width - 25, sy + 80);
        ctx.lineTo(p.width - 40, sy + depth);
        ctx.lineTo(0, sy + depth);
    } else {
        ctx.moveTo(800, sy);
        ctx.lineTo(p.x, sy);
        ctx.lineTo(p.x + 3, sy + 12);
        ctx.lineTo(p.x + 12, sy + 45);
        ctx.lineTo(p.x + 25, sy + 80);
        ctx.lineTo(p.x + 40, sy + depth);
        ctx.lineTo(800, sy + depth);
    }
    ctx.fill();

    // Skuggning mot innerkant
    const innerGrad = p.fromWall === 'left' ?
        ctx.createLinearGradient(p.width - 40, 0, p.width, 0) :
        ctx.createLinearGradient(p.x + 40, 0, p.x, 0);
    innerGrad.addColorStop(0, 'rgba(0,0,0,0)');
    innerGrad.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = innerGrad;
    if (p.fromWall === 'left') {
        ctx.fillRect(p.width - 40, sy, 40, depth);
    } else {
        ctx.fillRect(p.x, sy, 40, depth);
    }

    // Geologiska skikt
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    for (let ly = sy + 25; ly < sy + depth - 10; ly += 22) {
        const wobble = Math.sin(ly * 0.08) * 4;
        ctx.beginPath();
        if (p.fromWall === 'left') {
            ctx.moveTo(0, ly + wobble);
            ctx.lineTo(p.width - 30, ly + wobble + 2);
        } else {
            ctx.moveTo(800, ly + wobble);
            ctx.lineTo(p.x + 30, ly + wobble + 2);
        }
        ctx.stroke();
    }

    // Ljusare stenremsor
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let ly = sy + 15; ly < sy + depth - 20; ly += 35) {
        if (p.fromWall === 'left') {
            ctx.fillRect(5, ly, p.width - 50, 8);
        } else {
            ctx.fillRect(p.x + 45, ly, p.width - 50, 8);
        }
    }
}

function drawGroundBody(ctx, p, sy) {
    ctx.fillStyle = '#484040';
    ctx.fillRect(0, sy + p.height, 800, 200);

    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let ly = sy + p.height + 20; ly < sy + p.height + 180; ly += 25) {
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(800, ly + Math.sin(ly * 0.05) * 3);
        ctx.stroke();
    }
}

// === YTOR ===

function drawLedgeSurface(ctx, p, sy) {
    const shade = 82 + Math.sin(p.y * 0.04) * 8;

    ctx.fillStyle = `rgb(${shade}, ${shade - 6}, ${shade - 12})`;
    ctx.beginPath();
    if (p.fromWall === 'left') {
        ctx.moveTo(0, sy);
        ctx.lineTo(p.width - 8, sy + 1);
        ctx.lineTo(p.width, sy + 5);
        ctx.lineTo(p.width - 2, sy + p.height);
        ctx.lineTo(0, sy + p.height);
    } else {
        ctx.moveTo(800, sy);
        ctx.lineTo(p.x + 8, sy + 1);
        ctx.lineTo(p.x, sy + 5);
        ctx.lineTo(p.x + 2, sy + p.height);
        ctx.lineTo(800, sy + p.height);
    }
    ctx.fill();

    // Ljus toppkant
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    const startX = p.fromWall === 'left' ? 0 : p.x + 10;
    ctx.fillRect(startX, sy, p.width - 12, 2);

    // Mörk underkant
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(startX, sy + p.height - 2, p.width - 12, 2);

    // Spricka
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x + p.width * 0.4, sy + 2);
    ctx.lineTo(p.x + p.width * 0.4 + 3, sy + p.height);
    ctx.stroke();
}

function drawGroundSurface(ctx, p, sy) {
    ctx.fillStyle = '#5A5252';
    ctx.fillRect(p.x, sy, p.width, p.height);
    ctx.fillStyle = '#625A5A';
    ctx.fillRect(p.x, sy, p.width, 6);
    ctx.fillStyle = '#504848';
    for (let i = p.x + 15; i < p.x + p.width; i += 25) {
        ctx.fillRect(i, sy + 10, 12, 6);
    }
}

function drawBridge(ctx, p, sy) {
    ctx.fillStyle = '#5A4010';
    ctx.fillRect(p.x, sy + p.height - 2, p.width, 5);

    ctx.fillStyle = '#8B6914';
    ctx.fillRect(p.x, sy, p.width, p.height);

    ctx.fillStyle = '#A07828';
    for (let px = p.x; px < p.x + p.width; px += 22) {
        const pw = Math.min(20, p.x + p.width - px);
        ctx.fillRect(px + 1, sy + 1, pw, p.height - 3);
    }

    ctx.fillStyle = '#6B5010';
    ctx.fillRect(p.x, sy - 2, p.width, 3);

    ctx.fillStyle = '#6B5010';
    for (let px = p.x + 80; px < p.x + p.width - 40; px += 140) {
        ctx.fillRect(px, sy + p.height, 5, 18);
    }
}

// === SPIKAR ===

function drawSpikes(ctx, p, sy) {
    const spikeX = p.x + p.spikeStart;
    const spikeW = p.spikeWidth;
    const spikeH = 12;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(spikeX, sy - 1, spikeW, 3);

    const count = Math.max(2, Math.floor(spikeW / 11));
    const spacing = spikeW / count;

    for (let i = 0; i < count; i++) {
        const x = spikeX + i * spacing + 1;
        const w = spacing - 2;

        ctx.fillStyle = '#707070';
        ctx.beginPath();
        ctx.moveTo(x, sy);
        ctx.lineTo(x + w / 2, sy - spikeH);
        ctx.lineTo(x + w, sy);
        ctx.fill();

        ctx.fillStyle = '#904040';
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 2, sy - spikeH + 4);
        ctx.lineTo(x + w / 2, sy - spikeH);
        ctx.lineTo(x + w / 2 + 2, sy - spikeH + 4);
        ctx.fill();
    }
}

// === STEGAR ===

function drawLadder(ctx, ladder, cameraY, canvasHeight) {
    const topSy = ladder.topY - cameraY;
    const bottomSy = ladder.bottomY - cameraY;
    if (topSy > canvasHeight + 50 || bottomSy < -50) return;

    const height = bottomSy - topSy;
    const lx = ladder.x;
    const lw = ladder.width;

    ctx.fillStyle = '#A07828';
    ctx.fillRect(lx, topSy, 4, height);
    ctx.fillRect(lx + lw - 4, topSy, 4, height);

    ctx.fillStyle = '#8B6914';
    for (let ry = topSy + 12; ry < bottomSy - 5; ry += 18) {
        ctx.fillRect(lx + 4, ry, lw - 8, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(lx + 4, ry + 4, lw - 8, 2);
        ctx.fillStyle = '#8B6914';
    }

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(lx + 1, topSy, 1, height);
}
