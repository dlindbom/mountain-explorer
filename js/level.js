// Level-data: procedural generering av avsatser, broar, stegar och lava
// All rendering ligger i levelRenderer.js

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

            // Lava på vissa avsatser
            const lavaChance = 0.1 + difficulty * 0.25;
            if (this.totalPlatforms > 5 && Math.random() < lavaChance && width > 120) {
                const lavaWidth = 20 + Math.random() * 25 + difficulty * 15;
                const safeZone = 35;
                ledge.lavaStart = safeZone + Math.random() * (width - safeZone * 2 - lavaWidth);
                ledge.lavaWidth = lavaWidth;
                ledge.lavaGrowth = 0.003 + Math.random() * 0.004; // Växttakt
                ledge.lavaTime = 0; // Tidräknare för animering
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
            const lavaWidth = 25 + Math.random() * 25 + difficulty * 15;
            bridge.lavaStart = 200 + Math.random() * (400 - lavaWidth);
            bridge.lavaWidth = lavaWidth;
            bridge.lavaGrowth = 0.003 + Math.random() * 0.004;
            bridge.lavaTime = 0;
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

        // Uppdatera lava (växer sakta)
        for (const p of this.platforms) {
            if (p.lavaStart === undefined) continue;
            p.lavaTime = (p.lavaTime || 0) + 1;
            // Lavan växer långsamt åt båda hållen
            const growth = p.lavaGrowth || 0.004;
            const maxGrow = p.width * 0.4; // Max 40% av plattformen
            const grow = Math.min(maxGrow, p.lavaTime * growth);
            p.lavaCurrentWidth = p.lavaWidth + grow;
            p.lavaCurrentStart = p.lavaStart - grow / 2;
        }
        this.cleanup(playerY);
    }
}
