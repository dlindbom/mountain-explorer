// Banan - broar, stegar och spikhål på berget

class Level {
    constructor() {
        this.platforms = [];
        this.ladders = [];
        this.spikes = [];
        this.groundY = 560;
        this.floorSpacing = 125;
        this.currentFloor = 0;
        this.nextFloorY = this.groundY;

        // Startmark (bred plattform)
        this.platforms.push({
            x: 0, y: this.groundY, width: 800, height: 40, type: 'ground'
        });

        // Generera de första våningarna
        this.generateUpTo(this.groundY - 900);
    }

    generateUpTo(targetY) {
        while (this.nextFloorY - this.floorSpacing > targetY) {
            this.addFloor();
        }
    }

    addFloor() {
        this.currentFloor++;
        const y = this.groundY - this.currentFloor * this.floorSpacing;
        const belowY = this.groundY - (this.currentFloor - 1) * this.floorSpacing;
        const difficulty = Math.min(1, this.currentFloor / 60);

        // Stege: alternerar sida varje våning
        const ladderSide = this.currentFloor % 2 !== 0 ? 'left' : 'right';
        const ladderX = ladderSide === 'left' ? 15 : 760;

        // Stege från våningen under till denna
        this.ladders.push({
            x: ladderX,
            topY: y,
            bottomY: belowY,
            width: 24,
            side: ladderSide
        });

        // Bro med eventuellt spikhål
        const hasGap = this.currentFloor > 3 && Math.random() < 0.2 + difficulty * 0.35;

        if (hasGap) {
            const gapWidth = Math.min(120, 45 + Math.random() * 25 + difficulty * 40);
            // Placera hålet i mitten, bort från stegen
            let gapStart;
            if (ladderSide === 'left') {
                gapStart = 200 + Math.random() * (500 - gapWidth);
            } else {
                gapStart = 100 + Math.random() * (500 - gapWidth);
            }

            // Vänster segment
            this.platforms.push({
                x: 0, y: y, width: gapStart, height: 16, type: 'bridge'
            });
            // Höger segment
            this.platforms.push({
                x: gapStart + gapWidth, y: y,
                width: 800 - gapStart - gapWidth, height: 16, type: 'bridge'
            });
            // Spikar i hålet
            this.spikes.push({
                x: gapStart, y: y, width: gapWidth
            });
        } else {
            // Hel bro
            this.platforms.push({
                x: 0, y: y, width: 800, height: 16, type: 'bridge'
            });
        }

        this.nextFloorY = y;
    }

    cleanup(playerY) {
        this.platforms = this.platforms.filter(p =>
            p.type === 'ground' || p.y < playerY + 800
        );
        this.ladders = this.ladders.filter(l => l.bottomY < playerY + 800);
        this.spikes = this.spikes.filter(s => s.y < playerY + 800);
    }

    update(playerY) {
        this.generateUpTo(playerY - 700);
        this.cleanup(playerY);
    }

    draw(ctx, cameraY, canvasHeight) {
        // Rita stegar (bakom broarna)
        for (const ladder of this.ladders) {
            this.drawLadder(ctx, ladder, cameraY, canvasHeight);
        }

        // Rita spikhål
        for (const spike of this.spikes) {
            this.drawSpikes(ctx, spike, cameraY, canvasHeight);
        }

        // Rita broar/plattformar
        for (const p of this.platforms) {
            const sy = p.y - cameraY;
            if (sy < -50 || sy > canvasHeight + 50) continue;

            if (p.type === 'ground') {
                this.drawGround(ctx, p, sy);
            } else {
                this.drawBridge(ctx, p, sy);
            }
        }
    }

    drawGround(ctx, p, sy) {
        // Stenbotten
        ctx.fillStyle = '#555';
        ctx.fillRect(p.x, sy, p.width, p.height);
        ctx.fillStyle = '#5E5E5E';
        ctx.fillRect(p.x, sy, p.width, 6);

        // Stenblock-textur
        ctx.fillStyle = '#4A4A4A';
        for (let i = p.x + 15; i < p.x + p.width; i += 25) {
            ctx.fillRect(i, sy + 10, 12, 6);
        }
    }

    drawBridge(ctx, p, sy) {
        // Brons undersida (skugga)
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(p.x, sy + p.height - 3, p.width, 5);

        // Brons huvudkropp
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(p.x, sy, p.width, p.height);

        // Träplankor
        ctx.fillStyle = '#A07828';
        for (let px = p.x; px < p.x + p.width; px += 22) {
            const pw = Math.min(20, p.x + p.width - px);
            ctx.fillRect(px + 1, sy + 1, pw, p.height - 3);
        }

        // Räcke (tunn linje ovanpå)
        ctx.fillStyle = '#6B5010';
        ctx.fillRect(p.x, sy - 2, p.width, 3);

        // Stödpelare under (var 120px)
        ctx.fillStyle = '#6B5010';
        for (let px = p.x + 60; px < p.x + p.width - 30; px += 120) {
            ctx.fillRect(px, sy + p.height, 6, 20);
        }
    }

    drawLadder(ctx, ladder, cameraY, canvasHeight) {
        const topSy = ladder.topY - cameraY;
        const bottomSy = ladder.bottomY - cameraY;

        // Synlig?
        if (topSy > canvasHeight + 50 || bottomSy < -50) return;

        const height = bottomSy - topSy;
        const lx = ladder.x;
        const lw = ladder.width;

        // Sidorails
        ctx.fillStyle = '#A07828';
        ctx.fillRect(lx, topSy, 4, height);
        ctx.fillRect(lx + lw - 4, topSy, 4, height);

        // Stegpinnar
        ctx.fillStyle = '#8B6914';
        const rungSpacing = 18;
        for (let ry = topSy + 12; ry < bottomSy - 5; ry += rungSpacing) {
            ctx.fillRect(lx + 4, ry, lw - 8, 4);

            // Skugga under pinnen
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(lx + 4, ry + 4, lw - 8, 2);
            ctx.fillStyle = '#8B6914';
        }

        // Highlight på rails
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(lx + 1, topSy, 1, height);
        ctx.fillRect(lx + lw - 3, topSy, 1, height);
    }

    drawSpikes(ctx, spike, cameraY, canvasHeight) {
        const sy = spike.y - cameraY;
        if (sy < -50 || sy > canvasHeight + 50) return;

        // Mörkt hål
        ctx.fillStyle = 'rgba(10, 5, 0, 0.85)';
        ctx.fillRect(spike.x, sy, spike.width, 35);

        // Spiktrianglar (pekar uppåt)
        const count = Math.max(2, Math.floor(spike.width / 14));
        const spacing = spike.width / count;

        for (let i = 0; i < count; i++) {
            const sx = spike.x + i * spacing + 2;
            const sw = spacing - 4;

            // Metallgrå spik
            ctx.fillStyle = '#707070';
            ctx.beginPath();
            ctx.moveTo(sx, sy + 32);
            ctx.lineTo(sx + sw / 2, sy + 10);
            ctx.lineTo(sx + sw, sy + 32);
            ctx.fill();

            // Röd/rostig spets
            ctx.fillStyle = '#904040';
            ctx.beginPath();
            ctx.moveTo(sx + sw / 2 - 3, sy + 16);
            ctx.lineTo(sx + sw / 2, sy + 10);
            ctx.lineTo(sx + sw / 2 + 3, sy + 16);
            ctx.fill();
        }

        // Kantskuggor vid hålets kanter
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(spike.x, sy, 3, 35);
        ctx.fillRect(spike.x + spike.width - 3, sy, 3, 35);
    }
}
