// Level-data: procedural generering av avsatser, broar, stegar och spikar
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

            // Spikar på vissa avsatser
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
}
