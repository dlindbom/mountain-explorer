// Spelarkaraktären - en liten bergsklättrare

class Player {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 32;
        this.vx = 0;
        this.vy = 0;
        this.speed = 4.5;
        this.jumpForce = -10.5;
        this.gravity = 0.5;
        this.onGround = false;
        this.facing = 1;
        this.maxHeight = 0;
        this.walkFrame = 0;
        this.hitSpikes = false;
        this.lastGroundY = y;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.hitSpikes = false;
        this.lastGroundY = this.startY;
    }

    update(keys, platforms) {
        this.hitSpikes = false;

        // Rörelse vänster/höger
        if (keys['ArrowLeft'] || keys['a']) {
            this.vx = -this.speed;
            this.facing = -1;
        } else if (keys['ArrowRight'] || keys['d']) {
            this.vx = this.speed;
            this.facing = 1;
        } else {
            this.vx = 0;
        }

        // Hopp
        if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && this.onGround) {
            this.vy = this.jumpForce;
            this.onGround = false;
        }

        // Gravitation
        this.vy += this.gravity;

        // Flytta spelaren
        this.x += this.vx;
        this.y += this.vy;

        // Håll spelaren inom canvas horisontellt
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > 800) this.x = 800 - this.width;

        // Kollision med plattformar
        this.onGround = false;
        for (const p of platforms) {
            if (this.vy < 0) continue;

            if (this.x + this.width <= p.x || this.x >= p.x + p.width) continue;

            const feetY = this.y + this.height;
            if (feetY >= p.y && feetY <= p.y + p.height + 8) {
                this.y = p.y - this.height;
                this.vy = 0;
                this.onGround = true;
                this.lastGroundY = this.y;

                // Kolla om vi landade på spikar
                if (p.spikeStart !== undefined) {
                    const spikeLeft = p.x + p.spikeStart;
                    const spikeRight = spikeLeft + p.spikeWidth;
                    const playerLeft = this.x + 2;
                    const playerRight = this.x + this.width - 2;

                    if (playerRight > spikeLeft && playerLeft < spikeRight) {
                        this.hitSpikes = true;
                    }
                }
                break;
            }
        }

        // Gånganimation
        if (this.vx !== 0 && this.onGround) {
            this.walkFrame += 0.15;
        } else {
            this.walkFrame = 0;
        }

        // Uppdatera högsta höjd
        const currentHeight = this.getHeight();
        if (currentHeight > this.maxHeight) {
            this.maxHeight = currentHeight;
        }
    }

    getHeight() {
        return Math.max(0, Math.round((this.startY - this.y) / 10));
    }

    draw(ctx, cameraY) {
        const sx = this.x;
        const sy = this.y - cameraY;
        const legOffset = Math.sin(this.walkFrame * Math.PI) * 3;

        // Skugga
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(sx + this.width / 2, sy + this.height, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ben
        ctx.fillStyle = '#3D5A40';
        if (this.onGround && this.vx !== 0) {
            ctx.fillRect(sx + 4, sy + 24 + legOffset, 7, 8 - legOffset);
            ctx.fillRect(sx + 13, sy + 24 - legOffset, 7, 8 + legOffset);
        } else {
            ctx.fillRect(sx + 4, sy + 24, 7, 8);
            ctx.fillRect(sx + 13, sy + 24, 7, 8);
        }

        // Kängor
        ctx.fillStyle = '#5C4033';
        ctx.fillRect(sx + 3, sy + 30, 9, 3);
        ctx.fillRect(sx + 12, sy + 30, 9, 3);

        // Kropp (röd jacka)
        ctx.fillStyle = '#E63946';
        ctx.fillRect(sx + 3, sy + 12, this.width - 6, 13);

        // Ryggsäck
        const backX = this.facing === 1 ? sx : sx + this.width - 6;
        ctx.fillStyle = '#A8553A';
        ctx.fillRect(backX, sy + 13, 6, 10);

        // Huvud
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(sx + 5, sy + 3, this.width - 10, 11);

        // Mössa
        ctx.fillStyle = '#457B9D';
        ctx.fillRect(sx + 4, sy, this.width - 8, 6);
        ctx.fillRect(sx + 7, sy - 2, this.width - 14, 3);

        // Ögon
        const eyeX = this.facing === 1 ? 2 : -2;
        ctx.fillStyle = '#1D3557';
        ctx.fillRect(sx + 8 + eyeX, sy + 7, 2, 2);
        ctx.fillRect(sx + 14 + eyeX, sy + 7, 2, 2);

        // Mun
        ctx.fillStyle = '#C1666B';
        ctx.fillRect(sx + 10 + eyeX, sy + 11, 4, 1);
    }
}
