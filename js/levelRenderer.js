// Level-rendering: ritar klippmassa, ytor, broar, stegar och lava

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

        if (p.lavaStart !== undefined) {
            if (p.lavaExtinguished) {
                drawExtinguishedLava(ctx, p, sy);
            } else {
                drawLava(ctx, p, sy);
            }
        }
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

function drawLava(ctx, p, sy) {
    const ls = p.lavaCurrentStart !== undefined ? p.lavaCurrentStart : p.lavaStart;
    const lw = p.lavaCurrentWidth !== undefined ? p.lavaCurrentWidth : p.lavaWidth;
    const lavaX = p.x + ls;
    const lavaH = 8;
    const time = p.lavaTime || 0;

    // Glödande bas under lavan
    const glowGrad = ctx.createRadialGradient(
        lavaX + lw / 2, sy - 2, 2,
        lavaX + lw / 2, sy - 2, lw * 0.7
    );
    glowGrad.addColorStop(0, 'rgba(255, 100, 0, 0.25)');
    glowGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(lavaX - 10, sy - 15, lw + 20, 20);

    // Lava-kropp (vågig ovansida)
    ctx.fillStyle = '#CC3300';
    ctx.beginPath();
    ctx.moveTo(lavaX, sy);
    for (let x = 0; x <= lw; x += 4) {
        const wave = Math.sin((x + time * 0.8) * 0.15) * 3 +
                     Math.sin((x + time * 1.2) * 0.25) * 2;
        ctx.lineTo(lavaX + x, sy - lavaH + 2 - wave);
    }
    ctx.lineTo(lavaX + lw, sy);
    ctx.fill();

    // Ljusare övre lager (het yta)
    ctx.fillStyle = '#FF6600';
    ctx.beginPath();
    ctx.moveTo(lavaX + 2, sy - 1);
    for (let x = 2; x <= lw - 2; x += 3) {
        const wave = Math.sin((x + time * 0.6) * 0.2) * 2 +
                     Math.sin((x + time * 1.5) * 0.3) * 1.5;
        ctx.lineTo(lavaX + x, sy - lavaH + 4 - wave);
    }
    ctx.lineTo(lavaX + lw - 2, sy - 1);
    ctx.fill();

    // Ljusa hotspots (gula fläckar)
    ctx.fillStyle = '#FFAA00';
    const spotCount = Math.max(1, Math.floor(lw / 20));
    for (let i = 0; i < spotCount; i++) {
        const spotX = lavaX + 8 + ((i * 23 + time * 0.3) % (lw - 16));
        const spotW = 5 + Math.sin(time * 0.05 + i) * 3;
        const spotY = sy - lavaH + 3 + Math.sin(time * 0.08 + i * 2) * 2;
        ctx.beginPath();
        ctx.ellipse(spotX, spotY, spotW, 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Vita glödpunkter (hetaste)
    ctx.fillStyle = '#FFE0A0';
    for (let i = 0; i < spotCount; i++) {
        const hx = lavaX + 12 + ((i * 31 + time * 0.5) % (lw - 20));
        const hy = sy - lavaH + 4 + Math.sin(time * 0.1 + i * 3) * 1.5;
        ctx.fillRect(hx, hy, 2, 1);
    }

    // Partiklar/gnistor ovanför
    ctx.fillStyle = 'rgba(255, 150, 0, 0.6)';
    for (let i = 0; i < 3; i++) {
        const px = lavaX + ((i * 37 + time * 0.7) % lw);
        const py = sy - lavaH - 2 - ((time * 0.5 + i * 20) % 12);
        const alpha = 1 - ((time * 0.5 + i * 20) % 12) / 12;
        ctx.fillStyle = `rgba(255, 150, 0, ${alpha * 0.5})`;
        ctx.fillRect(px, py, 2, 2);
    }

    // Mörka kanter
    ctx.fillStyle = 'rgba(100, 20, 0, 0.6)';
    ctx.fillRect(lavaX, sy - 2, 2, 3);
    ctx.fillRect(lavaX + lw - 2, sy - 2, 2, 3);
}

// Släckt lava — stelnad sten med ångmoln
function drawExtinguishedLava(ctx, p, sy) {
    const ls = p.lavaCurrentStart !== undefined ? p.lavaCurrentStart : p.lavaStart;
    const lw = p.lavaCurrentWidth !== undefined ? p.lavaCurrentWidth : p.lavaWidth;
    const lavaX = p.x + ls;
    const lavaH = 8;

    // Stelnad sten (mörk, ojämn yta)
    ctx.fillStyle = '#3A3A3A';
    ctx.beginPath();
    ctx.moveTo(lavaX, sy);
    for (let x = 0; x <= lw; x += 6) {
        const bump = Math.sin(x * 0.4) * 1.5 + Math.sin(x * 0.7) * 1;
        ctx.lineTo(lavaX + x, sy - lavaH + 3 - bump);
    }
    ctx.lineTo(lavaX + lw, sy);
    ctx.fill();

    // Ljusare stenfläckar
    ctx.fillStyle = '#555';
    for (let i = 0; i < Math.max(1, Math.floor(lw / 25)); i++) {
        const sx = lavaX + 5 + (i * 23 % (lw - 10));
        ctx.fillRect(sx, sy - lavaH + 2, 6, 3);
    }

    // Lite ånga ovanpå (subtilt)
    const time = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(200, 200, 200, 0.15)';
    for (let i = 0; i < 2; i++) {
        const sx = lavaX + lw * 0.3 + i * lw * 0.4;
        const steamY = sy - lavaH - 4 - Math.sin(time + i * 2) * 3;
        ctx.beginPath();
        ctx.arc(sx, steamY, 4 + Math.sin(time * 1.5 + i) * 2, 0, Math.PI * 2);
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
