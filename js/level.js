// Banan - berget med klippor och gropar

class Level {
    constructor() {
        this.platforms = [];
        this.pits = []; // Farliga gropar (visuella markörer)
        this.groundY = 560;
        this.peakY = -5000;
        this.generate();
    }

    generate() {
        // Startmark (säker zon)
        this.platforms.push({
            x: 100, y: this.groundY, width: 600, height: 40, type: 'ground'
        });

        // Generera klippor uppåt
        let y = this.groundY - 70;
        let prevX = 350;
        let prevWidth = 120;
        let platformIndex = 0;

        while (y > this.peakY) {
            // Berget smalnar uppåt
            const progress = (this.groundY - y) / (this.groundY - this.peakY);
            const mountainHalfWidth = 350 - progress * 150;
            const centerX = 400;
            const minX = centerX - mountainHalfWidth;
            const maxX = centerX + mountainHalfWidth;

            // Plattformens storlek (mindre högre upp)
            const width = Math.max(50, 130 - progress * 60 + Math.random() * 40);

            // Beräkna x-position (sicksack, men inom hoppavstånd)
            const maxJump = 140;
            let direction = (platformIndex % 3 === 0) ? -1 : 1;
            if (Math.random() < 0.3) direction *= -1;

            let x = prevX + direction * (40 + Math.random() * 80);
            x = Math.max(minX, Math.min(x, maxX - width));

            // Se till att plattformen är nåbar horisontellt
            const prevCenter = prevX + prevWidth / 2;
            const thisCenter = x + width / 2;
            if (Math.abs(thisCenter - prevCenter) > maxJump) {
                x = prevCenter + (direction * maxJump) - width / 2;
                x = Math.max(minX, Math.min(x, maxX - width));
            }

            this.platforms.push({
                x: x, y: y, width: width, height: 14, type: 'rock'
            });

            // Ibland: markera grop mellan plattformar (visuell varning)
            if (platformIndex > 2 && Math.random() < 0.25) {
                const pitX = Math.min(prevX + prevWidth, x + width);
                const pitWidth = Math.abs(prevX - x) + 20;
                this.pits.push({
                    x: pitX - 10, y: y + 30, width: pitWidth, depth: 40
                });
            }

            prevX = x;
            prevWidth = width;
            platformIndex++;

            // Vertikalt avstånd (ökar lite med höjden)
            const spacing = 60 + Math.random() * 25 + progress * 15;
            y -= spacing;
        }

        // Toppen! Flagga!
        this.platforms.push({
            x: 350, y: this.peakY, width: 100, height: 20, type: 'peak'
        });
    }

    draw(ctx, cameraY, canvasHeight) {
        // Rita bergets silhuett i bakgrunden
        this.drawMountainShape(ctx, cameraY, canvasHeight);

        // Rita gropar (mörka sprickor)
        for (const pit of this.pits) {
            const sy = pit.y - cameraY;
            if (sy < -50 || sy > canvasHeight + 50) continue;

            ctx.fillStyle = 'rgba(20, 10, 5, 0.4)';
            ctx.beginPath();
            ctx.moveTo(pit.x, sy);
            ctx.lineTo(pit.x + pit.width * 0.3, sy + pit.depth);
            ctx.lineTo(pit.x + pit.width * 0.7, sy + pit.depth);
            ctx.lineTo(pit.x + pit.width, sy);
            ctx.fill();
        }

        // Rita plattformar
        for (const p of this.platforms) {
            const sy = p.y - cameraY;
            if (sy < -40 || sy > canvasHeight + 40) continue;

            if (p.type === 'ground') {
                this.drawGround(ctx, p, sy);
            } else if (p.type === 'peak') {
                this.drawPeak(ctx, p, sy);
            } else {
                this.drawRock(ctx, p, sy);
            }
        }
    }

    drawMountainShape(ctx, cameraY, canvasHeight) {
        // Bergets sidor (halvtransparenta)
        const topScreenY = this.peakY - cameraY;
        const bottomScreenY = this.groundY - cameraY + 40;

        ctx.fillStyle = 'rgba(80, 70, 60, 0.15)';

        // Vänster sida
        ctx.beginPath();
        ctx.moveTo(0, bottomScreenY);
        ctx.lineTo(50, bottomScreenY);
        ctx.lineTo(200, topScreenY + 200);
        ctx.lineTo(350, topScreenY);
        ctx.lineTo(0, topScreenY - 100);
        ctx.fill();

        // Höger sida
        ctx.beginPath();
        ctx.moveTo(800, bottomScreenY);
        ctx.lineTo(750, bottomScreenY);
        ctx.lineTo(600, topScreenY + 200);
        ctx.lineTo(450, topScreenY);
        ctx.lineTo(800, topScreenY - 100);
        ctx.fill();
    }

    drawGround(ctx, p, sy) {
        // Grönt gräs
        ctx.fillStyle = '#4A7C59';
        ctx.fillRect(p.x, sy, p.width, p.height);

        // Gräs-topp
        ctx.fillStyle = '#5C9A4D';
        ctx.fillRect(p.x, sy, p.width, 6);

        // Gräsblad
        ctx.fillStyle = '#6BAF5B';
        for (let i = p.x + 5; i < p.x + p.width - 5; i += 12) {
            ctx.fillRect(i, sy - 3, 2, 5);
            ctx.fillRect(i + 5, sy - 2, 2, 4);
        }
    }

    drawPeak(ctx, p, sy) {
        // Gyllene topp-plattform
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(p.x, sy, p.width, p.height);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(p.x + 2, sy, p.width - 4, 4);

        // Flaggstång
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(p.x + 48, sy - 50, 3, 50);

        // Flagga
        ctx.fillStyle = '#E63946';
        ctx.beginPath();
        ctx.moveTo(p.x + 51, sy - 50);
        ctx.lineTo(p.x + 80, sy - 40);
        ctx.lineTo(p.x + 51, sy - 30);
        ctx.fill();

        // Text på flaggan
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TOP', p.x + 64, sy - 38);
    }

    drawRock(ctx, p, sy) {
        const progress = (this.groundY - p.y) / (this.groundY - this.peakY);

        // Färg baserad på höjd
        let color, topColor;
        if (progress > 0.8) {
            color = '#D8D8D8';   // Snö
            topColor = '#F0F0F0';
        } else if (progress > 0.55) {
            color = '#9E9E9E';   // Grå sten
            topColor = '#B0B0B0';
        } else if (progress > 0.3) {
            color = '#8B7355';   // Brun sten
            topColor = '#9E8668';
        } else {
            color = '#6B7B3A';   // Grön sten med mossa
            topColor = '#7D8E4A';
        }

        // Klippform (lätt oregelbunden)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(p.x + 3, sy + p.height);
        ctx.lineTo(p.x, sy + 4);
        ctx.lineTo(p.x + 5, sy);
        ctx.lineTo(p.x + p.width - 5, sy);
        ctx.lineTo(p.x + p.width, sy + 4);
        ctx.lineTo(p.x + p.width - 3, sy + p.height);
        ctx.fill();

        // Topp-highlight
        ctx.fillStyle = topColor;
        ctx.fillRect(p.x + 5, sy, p.width - 10, 3);

        // Skugga under
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(p.x + 3, sy + p.height - 3, p.width - 6, 3);

        // Snö-topping på höga klippor
        if (progress > 0.75) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(p.x + 8, sy - 2, p.width - 16, 3);
        }
    }
}
