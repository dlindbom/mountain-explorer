// Banan - endless bergsvägg med klippkanter och spikar

class Level {
    constructor() {
        this.platforms = [];
        this.groundY = 560;
        this.nextY = this.groundY - 70;
        this.platformCount = 0;

        // Startmark
        this.platforms.push({
            x: 100, y: this.groundY, width: 600, height: 40, type: 'ground'
        });

        // Generera de första plattformarna
        this.generateUpTo(this.groundY - 800);
    }

    // Generera nya plattformar uppåt vid behov
    generateUpTo(targetY) {
        while (this.nextY > targetY) {
            this.addPlatform(this.nextY);
            this.platformCount++;

            // Svårighetsgrad ökar med höjden
            const height = (this.groundY - this.nextY) / 10;
            const spacing = 60 + Math.random() * 25 + Math.min(height / 50, 15);
            this.nextY -= spacing;
        }
    }

    addPlatform(y) {
        const height = (this.groundY - y) / 10; // Höjd i meter
        const difficulty = Math.min(1, height / 500); // 0 till 1 över 500m

        // Plattformens bredd (smalare högre upp)
        const minWidth = Math.max(55, 100 - difficulty * 40);
        const maxWidth = Math.max(80, 160 - difficulty * 60);
        const width = minWidth + Math.random() * (maxWidth - minWidth);

        // Position: 40% från vänster vägg, 40% höger vägg, 20% mitten
        const roll = Math.random();
        let x;
        if (roll < 0.4) {
            // Sticker ut från vänster vägg
            x = 0;
        } else if (roll < 0.8) {
            // Sticker ut från höger vägg
            x = 800 - width;
        } else {
            // Flytande sten i mitten
            x = 100 + Math.random() * (600 - width);
        }

        const platform = {
            x: x,
            y: y,
            width: width,
            height: 16,
            type: 'rock',
            fromWall: roll < 0.4 ? 'left' : (roll < 0.8 ? 'right' : 'none')
        };

        // Spikar (chansen ökar med höjden)
        const spikeChance = 0.1 + difficulty * 0.35;
        if (this.platformCount > 5 && Math.random() < spikeChance && width > 65) {
            // Spikhålet ska inte täcka hela plattformen - lämna säker landningsyta
            const safeZone = 30; // Minst 30px säker yta
            const maxSpikeWidth = width - safeZone * 2;

            if (maxSpikeWidth > 15) {
                const spikeWidth = 15 + Math.random() * Math.min(30, maxSpikeWidth - 15);
                // Placera spikhålet - undvik kanterna
                const spikeStart = safeZone + Math.random() * (width - safeZone * 2 - spikeWidth);
                platform.spikeStart = spikeStart;
                platform.spikeWidth = spikeWidth;
            }
        }

        this.platforms.push(platform);
    }

    // Ta bort plattformar långt under spelaren
    cleanup(playerY) {
        this.platforms = this.platforms.filter(p =>
            p.type === 'ground' || p.y < playerY + 800
        );
    }

    update(playerY) {
        this.generateUpTo(playerY - 700);
        this.cleanup(playerY);
    }

    draw(ctx, cameraY, canvasHeight) {
        // Rita klipporna
        for (const p of this.platforms) {
            const sy = p.y - cameraY;
            if (sy < -40 || sy > canvasHeight + 40) continue;

            if (p.type === 'ground') {
                this.drawGround(ctx, p, sy);
            } else {
                this.drawRock(ctx, p, sy);
            }
        }
    }

    drawGround(ctx, p, sy) {
        ctx.fillStyle = '#555';
        ctx.fillRect(p.x, sy, p.width, p.height);
        ctx.fillStyle = '#666';
        ctx.fillRect(p.x, sy, p.width, 5);

        // Lite grus/sten-textur
        ctx.fillStyle = '#4a4a4a';
        for (let i = p.x + 10; i < p.x + p.width; i += 20) {
            ctx.fillRect(i, sy + 8, 8, 4);
        }
    }

    drawRock(ctx, p, sy) {
        // Klippans grundfärg
        const shade = 85 + Math.sin(p.y * 0.1) * 15;
        ctx.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 10})`;

        // Klippform - lite ojämn
        ctx.beginPath();
        if (p.fromWall === 'left') {
            // Sticker ut från vänster
            ctx.moveTo(p.x, sy - 2);
            ctx.lineTo(p.x + p.width - 8, sy);
            ctx.lineTo(p.x + p.width, sy + 5);
            ctx.lineTo(p.x + p.width - 3, sy + p.height);
            ctx.lineTo(p.x, sy + p.height + 2);
        } else if (p.fromWall === 'right') {
            // Sticker ut från höger
            ctx.moveTo(p.x + p.width, sy - 2);
            ctx.lineTo(p.x + 8, sy);
            ctx.lineTo(p.x, sy + 5);
            ctx.lineTo(p.x + 3, sy + p.height);
            ctx.lineTo(p.x + p.width, sy + p.height + 2);
        } else {
            // Fri sten
            ctx.moveTo(p.x + 4, sy + p.height);
            ctx.lineTo(p.x, sy + 4);
            ctx.lineTo(p.x + 6, sy);
            ctx.lineTo(p.x + p.width - 6, sy);
            ctx.lineTo(p.x + p.width, sy + 4);
            ctx.lineTo(p.x + p.width - 4, sy + p.height);
        }
        ctx.fill();

        // Highlight på toppen
        ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;
        ctx.fillRect(p.x + 6, sy, p.width - 12, 2);

        // Skugga under
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(p.x + 4, sy + p.height - 3, p.width - 8, 3);

        // Stenstruktur (sprickor)
        ctx.strokeStyle = `rgba(0, 0, 0, 0.15)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x + p.width * 0.3, sy + 3);
        ctx.lineTo(p.x + p.width * 0.35, sy + p.height - 2);
        ctx.moveTo(p.x + p.width * 0.7, sy + 2);
        ctx.lineTo(p.x + p.width * 0.65, sy + p.height - 3);
        ctx.stroke();

        // Rita spikar om det finns
        if (p.spikeStart !== undefined) {
            this.drawSpikes(ctx, p, sy);
        }
    }

    drawSpikes(ctx, p, sy) {
        const holeX = p.x + p.spikeStart;
        const holeW = p.spikeWidth;

        // Mörkt hål i klippan
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(holeX, sy + 1, holeW, p.height - 1);

        // Spikar (trianglar som pekar uppåt)
        const spikeCount = Math.max(2, Math.floor(holeW / 10));
        const spikeSpacing = holeW / spikeCount;

        ctx.fillStyle = '#8A8A8A';
        for (let i = 0; i < spikeCount; i++) {
            const sx = holeX + i * spikeSpacing + spikeSpacing * 0.1;
            const sw = spikeSpacing * 0.8;
            const spikeH = p.height - 3;

            ctx.beginPath();
            ctx.moveTo(sx, sy + p.height);
            ctx.lineTo(sx + sw / 2, sy + p.height - spikeH);
            ctx.lineTo(sx + sw, sy + p.height);
            ctx.fill();
        }

        // Röd/rostfärgad topp på spikarna
        ctx.fillStyle = '#A04040';
        for (let i = 0; i < spikeCount; i++) {
            const sx = holeX + i * spikeSpacing + spikeSpacing * 0.1;
            const sw = spikeSpacing * 0.8;

            ctx.beginPath();
            ctx.moveTo(sx + sw * 0.25, sy + p.height - 6);
            ctx.lineTo(sx + sw / 2, sy + p.height - (p.height - 3));
            ctx.lineTo(sx + sw * 0.75, sy + p.height - 6);
            ctx.fill();
        }
    }
}
