// Björnen - dyker upp var 100:e meter och jagar spelaren

class Bear {
    constructor(x, bridgeY) {
        this.x = x;
        this.bridgeY = bridgeY;
        this.y = bridgeY - 30;
        this.width = 40;
        this.height = 30;
        this.speed = 5.6;
        this.facing = 1;
        this.active = true;
        this.walkFrame = 0;
    }

    update(playerX) {
        if (!this.active) return;

        // Gå mot spelaren
        const diff = playerX - (this.x + this.width / 2);
        if (diff > 5) {
            this.x += this.speed;
            this.facing = 1;
        } else if (diff < -5) {
            this.x -= this.speed;
            this.facing = -1;
        }

        // Stanna på bron
        this.y = this.bridgeY - this.height;

        // Håll inom canvas
        if (this.x < 5) this.x = 5;
        if (this.x + this.width > 795) this.x = 795 - this.width;

        // Gånganimation
        this.walkFrame += 0.1;
    }

    collidesWith(player) {
        if (!this.active) return false;
        return this.x < player.x + player.width &&
               this.x + this.width > player.x &&
               this.y < player.y + player.height &&
               this.y + this.height > player.y;
    }

    draw(ctx, cameraY) {
        if (!this.active) return;

        const sx = this.x;
        const sy = this.y - cameraY;
        const legAnim = Math.sin(this.walkFrame * Math.PI) * 2;

        // Skugga
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(sx + this.width / 2, sy + this.height + 1, 16, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ben (4 st med animation)
        ctx.fillStyle = '#5C3317';
        // Framben
        ctx.fillRect(sx + 5, sy + this.height - 6 + legAnim, 7, 8);
        ctx.fillRect(sx + 14, sy + this.height - 6 - legAnim, 7, 8);
        // Bakben
        ctx.fillRect(sx + this.width - 21, sy + this.height - 6 - legAnim, 7, 8);
        ctx.fillRect(sx + this.width - 12, sy + this.height - 6 + legAnim, 7, 8);

        // Kropp
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(sx + 3, sy + 8, this.width - 6, this.height - 10);

        // Mage (ljusare)
        ctx.fillStyle = '#A0652A';
        ctx.fillRect(sx + 10, sy + 14, this.width - 20, this.height - 18);

        // Huvud
        const headX = this.facing === 1 ? sx + this.width - 18 : sx;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(headX, sy + 2, 18, 16);

        // Öron
        ctx.fillStyle = '#6B3310';
        ctx.fillRect(headX + 1, sy, 6, 6);
        ctx.fillRect(headX + 11, sy, 6, 6);

        // Inre öra
        ctx.fillStyle = '#A0652A';
        ctx.fillRect(headX + 2, sy + 1, 4, 4);
        ctx.fillRect(headX + 12, sy + 1, 4, 4);

        // Ögon (arga!)
        ctx.fillStyle = '#FFF';
        const eyeBaseX = this.facing === 1 ? headX + 10 : headX + 4;
        ctx.fillRect(eyeBaseX, sy + 6, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(eyeBaseX + 1, sy + 7, 2, 2);

        // Nos
        ctx.fillStyle = '#333';
        const noseX = this.facing === 1 ? headX + 15 : headX;
        ctx.fillRect(noseX, sy + 12, 4, 3);

        // Mun (arg)
        ctx.fillStyle = '#600';
        ctx.fillRect(noseX - 1, sy + 15, 5, 2);
    }
}
