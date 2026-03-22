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
        const ledgeCount = 2 + Math.floor(Math.random() * 2);

        for (let i = 0; i < ledgeCount; i++) {
            const needsLadder = i > 0 && Math.random() < 0.3;
            const gap = needsLadder ?
                135 + Math.random() * 25 :
                55 + Math.random() * 30;

            this.currentY -= gap;

            const width = 200 + Math.random() * 150;
            const x = side === 'left' ? 0 : 800 - width;

            const ledge = {
                x: x, y: this.currentY, width: width, height: 16,
                type: 'ledge', fromWall: side
            };

            const spikeChance = 0.1 + difficulty * 0.25;
            if (this.totalPlatforms > 5 && Math.random() < spikeChance && width > 120) {
                const spikeWidth = 20 + Math.random() * 20 + difficulty * 10;
                const safeZone = 35;
                ledge.spikeStart = safeZone + Math.random() * (width - safeZone * 2 - spikeWidth);
                ledge.spikeWidth = spikeWidth;
            }

            this.platforms.push(ledge);

            if (needsLadder) {
                const ladderX = side === 'left' ? x + width - 35 : x + 8;
                this.ladders.push({
                    x: ladderX, topY: this.currentY,
                    bottomY: this.currentY + gap, width: 24, side: side
                });
            }

            this.totalPlatforms++;
        }

        // Bro ovanför klustret
        this.currentY -= 60 + Math.random() * 25;
        const bridge = {
            x: 0, y: this.currentY, width: 800, height: 16, type: 'bridge'
        };

        if (this.sectionCount > 2 && Math.random() < 0.15 + difficulty * 0.2) {
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
        // Pass 1: Klippmassa under varje avsats (bakom allt)
        for (const p of this.platforms) {
            const sy = p.y - cameraY;
            if (sy < -200 || sy > canvasHeight + 50) continue;
            if (p.type === 'ledge') {
                this.drawRockBody(ctx, p, sy);
            }
            if (p.type === 'ground') {
                this.drawGroundBody(ctx, p, sy);
            }
        }

        // Stegar (bakom ytor)
        for (const ladder of this.ladders) {
            this.drawLadder(ctx, ladder, cameraY, canvasHeight);
        }

        // Pass 2: Ytor (ovanpå klippmassan)
        for (const p of this.platforms) {
            const sy = p.y - cameraY;
            if (sy < -50 || sy > canvasHeight + 50) continue;

            if (p.type === 'ground') {
                this.drawGroundSurface(ctx, p, sy);
            } else if (p.type === 'bridge') {
                this.drawBridge(ctx, p, sy);
            } else {
                this.drawLedgeSurface(ctx, p, sy);
            }

            if (p.spikeStart !== undefined) {
                this.drawSpikes(ctx, p, sy);
            }
        }
    }

    // === KLIPPMASSA (berget under avsatsen) ===

    drawRockBody(ctx, p, sy) {
        const depth = 140;
        const shade = 58 + Math.sin(p.y * 0.04) * 6;

        // Bergmassa som sträcker sig neråt
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

        // Mörkare skuggning mot innerkanten
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

        // Horisontella skikt-linjer (geologiska lager)
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

        // Ljusare remsor (stenvariation)
        ctx.fillStyle = `rgba(255,255,255,0.03)`;
        for (let ly = sy + 15; ly < sy + depth - 20; ly += 35) {
            if (p.fromWall === 'left') {
                ctx.fillRect(5, ly, p.width - 50, 8);
            } else {
                ctx.fillRect(p.x + 45, ly, p.width - 50, 8);
            }
        }
    }

    drawGroundBody(ctx, p, sy) {
        // Marken sträcker sig neråt
        ctx.fillStyle = '#484040';
        ctx.fillRect(0, sy + p.height, 800, 200);

        // Stenlager
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        for (let ly = sy + p.height + 20; ly < sy + p.height + 180; ly += 25) {
            ctx.beginPath();
            ctx.moveTo(0, ly);
            ctx.lineTo(800, ly + Math.sin(ly * 0.05) * 3);
            ctx.stroke();
        }
    }

    // === YTOR (det man går på) ===

    drawLedgeSurface(ctx, p, sy) {
        const shade = 82 + Math.sin(p.y * 0.04) * 8;

        // Avsatsens ovansida (ljusare än klippmassan)
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
        ctx.fillStyle = `rgba(255,255,255,0.1)`;
        const startX = p.fromWall === 'left' ? 0 : p.x + 10;
        const edgeW = p.width - 12;
        ctx.fillRect(startX, sy, edgeW, 2);

        // Mörk underkant
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(startX, sy + p.height - 2, edgeW, 2);

        // Spricka i ytan
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const crackX = p.x + p.width * 0.4;
        ctx.moveTo(crackX, sy + 2);
        ctx.lineTo(crackX + 3, sy + p.height);
        ctx.stroke();
    }

    drawGroundSurface(ctx, p, sy) {
        ctx.fillStyle = '#5A5252';
        ctx.fillRect(p.x, sy, p.width, p.height);
        ctx.fillStyle = '#625A5A';
        ctx.fillRect(p.x, sy, p.width, 6);
        ctx.fillStyle = '#504848';
        for (let i = p.x + 15; i < p.x + p.width; i += 25) {
            ctx.fillRect(i, sy + 10, 12, 6);
        }
    }

    drawBridge(ctx, p, sy) {
        // Undersida
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(p.x, sy + p.height - 2, p.width, 5);

        // Kropp
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

    // === SPIKAR ===

    drawSpikes(ctx, p, sy) {
        const spikeX = p.x + p.spikeStart;
        const spikeW = p.spikeWidth;
        const spikeH = 12;

        // Mörk bas
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(spikeX, sy - 1, spikeW, 3);

        // Spiktrianglar uppåt
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

    drawLadder(ctx, ladder, cameraY, canvasHeight) {
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
}
