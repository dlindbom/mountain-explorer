// Banan - bergets sida med klippavsatser, stegar och broar

class Level {
    constructor() {
        this.platforms = [];
        this.ladders = [];
        this.groundY = 560;
        this.currentY = this.groundY;
        this.sectionCount = 0;
        this.totalPlatforms = 0;

        // Startmark
        this.platforms.push({
            x: 0, y: this.groundY, width: 800, height: 40, type: 'ground'
        });

        // Generera första sektionerna
        this.generateUpTo(this.groundY - 900);
    }

    generateUpTo(targetY) {
        while (this.currentY > targetY) {
            this.addSection();
        }
    }

    addSection() {
        const side = this.sectionCount % 2 === 0 ? 'left' : 'right';
        const difficulty = Math.min(1, this.sectionCount / 40);
        const ledgeCount = 2 + Math.floor(Math.random() * 2); // 2-3 avsatser

        for (let i = 0; i < ledgeCount; i++) {
            // Första avsatsen i gruppen är alltid hoppbar
            const needsLadder = i > 0 && Math.random() < 0.3;
            const gap = needsLadder ?
                135 + Math.random() * 25 :   // För högt att hoppa
                55 + Math.random() * 30;      // Hoppbart

            this.currentY -= gap;

            // Klippavsats från bergväggen
            const width = 200 + Math.random() * 150;
            const x = side === 'left' ? 0 : 800 - width;

            const ledge = {
                x: x, y: this.currentY, width: width, height: 16,
                type: 'ledge', fromWall: side
            };

            // Spikar på vissa avsatser
            const spikeChance = 0.1 + difficulty * 0.25;
            if (this.totalPlatforms > 5 && Math.random() < spikeChance && width > 120) {
                const spikeWidth = 20 + Math.random() * 20 + difficulty * 10;
                const safeZone = 35;
                ledge.spikeStart = safeZone + Math.random() * (width - safeZone * 2 - spikeWidth);
                ledge.spikeWidth = spikeWidth;
            }

            this.platforms.push(ledge);

            // Stege om hoppet är för stort
            if (needsLadder) {
                const ladderX = side === 'left' ? x + width - 35 : x + 8;
                this.ladders.push({
                    x: ladderX,
                    topY: this.currentY,
                    bottomY: this.currentY + gap,
                    width: 24,
                    side: side
                });
            }

            this.totalPlatforms++;
        }

        // Bro ovanför klustret (för att korsa till andra sidan)
        this.currentY -= 60 + Math.random() * 25;
        const bridge = {
            x: 0, y: this.currentY, width: 800, height: 16, type: 'bridge'
        };

        // Spikar på vissa broar
        if (this.sectionCount > 2 && Math.random() < 0.15 + difficulty * 0.2 && true) {
            const spikeWidth = 25 + Math.random() * 20 + difficulty * 15;
            bridge.spikeStart = 200 + Math.random() * (400 - spikeWidth);
            bridge.spikeWidth = spikeWidth;
        }

        this.platforms.push(bridge);
        this.totalPlatforms++;
        this.sectionCount++;
    }

    cleanup(playerY) {
        this.platforms = this.platforms.filter(p =>
            p.type === 'ground' || p.y < playerY + 800
        );
        this.ladders = this.ladders.filter(l => l.bottomY < playerY + 800);
    }

    update(playerY) {
        this.generateUpTo(playerY - 700);
        this.cleanup(playerY);
    }

    draw(ctx, cameraY, canvasHeight) {
        // Stegar (bakom plattformar)
        for (const ladder of this.ladders) {
            this.drawLadder(ctx, ladder, cameraY, canvasHeight);
        }

        // Plattformar
        for (const p of this.platforms) {
            const sy = p.y - cameraY;
            if (sy < -50 || sy > canvasHeight + 50) continue;

            if (p.type === 'ground') {
                this.drawGround(ctx, p, sy);
            } else if (p.type === 'bridge') {
                this.drawBridge(ctx, p, sy);
            } else {
                this.drawLedge(ctx, p, sy);
            }

            // Rita spikar på plattformen
            if (p.spikeStart !== undefined) {
                this.drawSpikes(ctx, p, sy);
            }
        }
    }

    drawGround(ctx, p, sy) {
        ctx.fillStyle = '#555';
        ctx.fillRect(p.x, sy, p.width, p.height);
        ctx.fillStyle = '#5E5E5E';
        ctx.fillRect(p.x, sy, p.width, 6);
        ctx.fillStyle = '#4A4A4A';
        for (let i = p.x + 15; i < p.x + p.width; i += 25) {
            ctx.fillRect(i, sy + 10, 12, 6);
        }
    }

    drawLedge(ctx, p, sy) {
        // Klippans grundfärg
        const shade = 95 + Math.sin(p.y * 0.05) * 10;
        ctx.fillStyle = `rgb(${shade}, ${shade - 8}, ${shade - 15})`;

        // Klippform med ojämn kant
        ctx.beginPath();
        if (p.fromWall === 'left') {
            ctx.moveTo(p.x, sy - 3);
            ctx.lineTo(p.x + p.width - 15, sy);
            ctx.lineTo(p.x + p.width - 5, sy + 4);
            ctx.lineTo(p.x + p.width, sy + 8);
            ctx.lineTo(p.x + p.width - 8, sy + p.height + 2);
            ctx.lineTo(p.x, sy + p.height + 4);
        } else {
            ctx.moveTo(p.x + p.width, sy - 3);
            ctx.lineTo(p.x + 15, sy);
            ctx.lineTo(p.x + 5, sy + 4);
            ctx.lineTo(p.x, sy + 8);
            ctx.lineTo(p.x + 8, sy + p.height + 2);
            ctx.lineTo(p.x + p.width, sy + p.height + 4);
        }
        ctx.fill();

        // Ljus topp
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        const edgeStart = p.fromWall === 'left' ? p.x : p.x + 10;
        const edgeWidth = p.width - 15;
        ctx.fillRect(edgeStart, sy, edgeWidth, 2);

        // Skugga under
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(edgeStart, sy + p.height - 2, edgeWidth, 3);

        // Stensprickor
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x + p.width * 0.3, sy + 3);
        ctx.lineTo(p.x + p.width * 0.35, sy + p.height);
        ctx.stroke();
    }

    drawBridge(ctx, p, sy) {
        // Undersida
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(p.x, sy + p.height - 2, p.width, 5);

        // Huvudkropp
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(p.x, sy, p.width, p.height);

        // Plankor
        ctx.fillStyle = '#A07828';
        for (let px = p.x; px < p.x + p.width; px += 22) {
            const pw = Math.min(20, p.x + p.width - px);
            ctx.fillRect(px + 1, sy + 1, pw, p.height - 3);
        }

        // Räcke
        ctx.fillStyle = '#6B5010';
        ctx.fillRect(p.x, sy - 2, p.width, 3);

        // Stöd
        ctx.fillStyle = '#6B5010';
        for (let px = p.x + 80; px < p.x + p.width - 40; px += 140) {
            ctx.fillRect(px, sy + p.height, 5, 18);
        }
    }

    drawSpikes(ctx, p, sy) {
        const spikeX = p.x + p.spikeStart;
        const spikeW = p.spikeWidth;
        const spikeH = 12;

        // Mörk bas
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(spikeX, sy - 2, spikeW, 4);

        // Spiktrianglar (pekar UPPÅT från ytan)
        const count = Math.max(2, Math.floor(spikeW / 11));
        const spacing = spikeW / count;

        for (let i = 0; i < count; i++) {
            const x = spikeX + i * spacing + 1;
            const w = spacing - 2;

            // Metallgrå spik
            ctx.fillStyle = '#707070';
            ctx.beginPath();
            ctx.moveTo(x, sy);
            ctx.lineTo(x + w / 2, sy - spikeH);
            ctx.lineTo(x + w, sy);
            ctx.fill();

            // Röd spets
            ctx.fillStyle = '#904040';
            ctx.beginPath();
            ctx.moveTo(x + w / 2 - 2, sy - spikeH + 4);
            ctx.lineTo(x + w / 2, sy - spikeH);
            ctx.lineTo(x + w / 2 + 2, sy - spikeH + 4);
            ctx.fill();
        }
    }

    drawLadder(ctx, ladder, cameraY, canvasHeight) {
        const topSy = ladder.topY - cameraY;
        const bottomSy = ladder.bottomY - cameraY;
        if (topSy > canvasHeight + 50 || bottomSy < -50) return;

        const height = bottomSy - topSy;
        const lx = ladder.x;
        const lw = ladder.width;

        // Rails
        ctx.fillStyle = '#A07828';
        ctx.fillRect(lx, topSy, 4, height);
        ctx.fillRect(lx + lw - 4, topSy, 4, height);

        // Pinnar
        ctx.fillStyle = '#8B6914';
        for (let ry = topSy + 12; ry < bottomSy - 5; ry += 18) {
            ctx.fillRect(lx + 4, ry, lw - 8, 4);
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.fillRect(lx + 4, ry + 4, lw - 8, 2);
            ctx.fillStyle = '#8B6914';
        }

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(lx + 1, topSy, 1, height);
    }
}
