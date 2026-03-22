// Bakgrund: himmel, avlägsna berg och klippväggar

function drawBackground(ctx, canvas, cameraY) {
    const altitude = Math.max(0, -cameraY);
    const progress = Math.min(1, altitude / 6000);

    // Himmel
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (progress > 0.7) {
        skyGrad.addColorStop(0, '#0F1B33');
        skyGrad.addColorStop(1, '#1B3A5C');
    } else if (progress > 0.4) {
        skyGrad.addColorStop(0, '#2E5090');
        skyGrad.addColorStop(1, '#6B9AC4');
    } else {
        skyGrad.addColorStop(0, '#5BA3D9');
        skyGrad.addColorStop(1, '#A8D8EA');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stjärnor på hög höjd
    if (progress > 0.6) {
        const a = (progress - 0.6) / 0.4 * 0.8;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        for (let i = 0; i < 25; i++) {
            ctx.fillRect((i * 137 + 50) % 780 + 10, (i * 97 + 30) % 580 + 10, (i % 3) + 1, (i % 3) + 1);
        }
    }

    // Avlägsna berg (parallax)
    ctx.fillStyle = 'rgba(80, 95, 110, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(80, 250 - cameraY * 0.02);
    ctx.lineTo(200, 350 - cameraY * 0.02);
    ctx.lineTo(350, 150 - cameraY * 0.02);
    ctx.lineTo(500, 300 - cameraY * 0.02);
    ctx.lineTo(700, 120 - cameraY * 0.02);
    ctx.lineTo(800, 220 - cameraY * 0.02);
    ctx.lineTo(800, canvas.height);
    ctx.fill();

    // Klippväggar
    drawCliffFace(ctx, canvas, 'left', cameraY);
    drawCliffFace(ctx, canvas, 'right', cameraY);
}

function drawCliffFace(ctx, canvas, side, cameraY) {
    const isLeft = side === 'left';

    ctx.fillStyle = isLeft ? '#3D3832' : '#3A3530';
    ctx.beginPath();

    if (isLeft) {
        ctx.moveTo(0, 0);
        ctx.lineTo(0, canvas.height);
        for (let y = canvas.height; y >= -10; y -= 20) {
            const worldY = y + cameraY;
            const x = 100 + Math.sin(worldY * 0.007) * 35 + Math.sin(worldY * 0.023) * 12;
            ctx.lineTo(x, y);
        }
    } else {
        ctx.moveTo(800, 0);
        ctx.lineTo(800, canvas.height);
        for (let y = canvas.height; y >= -10; y -= 20) {
            const worldY = y + cameraY;
            const x = 700 - Math.sin(worldY * 0.007 + 2) * 35 - Math.sin(worldY * 0.023 + 1) * 12;
            ctx.lineTo(x, y);
        }
    }
    ctx.fill();

    // Stentextur
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 30) {
        const worldY = y + cameraY;
        const offset = Math.sin(worldY * 0.01) * 10;
        ctx.beginPath();
        if (isLeft) {
            ctx.moveTo(0, y);
            ctx.lineTo(60 + offset, y);
        } else {
            ctx.moveTo(800, y);
            ctx.lineTo(740 + offset, y);
        }
        ctx.stroke();
    }

    // Mörk kant mot klyftan
    const edgeGrad = isLeft ?
        ctx.createLinearGradient(80, 0, 140, 0) :
        ctx.createLinearGradient(720, 0, 660, 0);
    edgeGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
    edgeGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = edgeGrad;
    if (isLeft) {
        ctx.fillRect(80, 0, 60, canvas.height);
    } else {
        ctx.fillRect(660, 0, 60, canvas.height);
    }
}
