// Yeti - stor snövarelse, dubbelt så stor som björnen, 50% snabbare

class Yeti {
    constructor(x, bridgeY) {
        this.x = x;
        this.bridgeY = bridgeY;
        this.width = 80;
        this.height = 60;
        this.y = bridgeY - this.height;
        this.speed = 8.4; // 50% snabbare än björnen (5.6 * 1.5)
        this.facing = 1;
        this.active = true;
        this.walkFrame = 0;
    }

    update(playerX) {
        if (!this.active) return;

        const diff = playerX - (this.x + this.width / 2);
        if (diff > 8) {
            this.x += this.speed;
            this.facing = 1;
        } else if (diff < -8) {
            this.x -= this.speed;
            this.facing = -1;
        }

        this.y = this.bridgeY - this.height;

        if (this.x < 5) this.x = 5;
        if (this.x + this.width > 795) this.x = 795 - this.width;

        this.walkFrame += 0.08;
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
        const legAnim = Math.sin(this.walkFrame * Math.PI) * 4;

        // Skugga
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(sx + this.width / 2, sy + this.height + 2, 30, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ben (kraftiga)
        ctx.fillStyle = '#B8C8D0';
        ctx.fillRect(sx + 10, sy + this.height - 12 + legAnim, 14, 16);
        ctx.fillRect(sx + 28, sy + this.height - 12 - legAnim, 14, 16);
        ctx.fillRect(sx + this.width - 42, sy + this.height - 12 - legAnim, 14, 16);
        ctx.fillRect(sx + this.width - 24, sy + this.height - 12 + legAnim, 14, 16);

        // Fötter
        ctx.fillStyle = '#8090A0';
        ctx.fillRect(sx + 8, sy + this.height + 2, 18, 6);
        ctx.fillRect(sx + 26, sy + this.height + 2, 18, 6);
        ctx.fillRect(sx + this.width - 44, sy + this.height + 2, 18, 6);
        ctx.fillRect(sx + this.width - 26, sy + this.height + 2, 18, 6);

        // Kropp (stor, vit/grå päls)
        ctx.fillStyle = '#D0D8E0';
        ctx.fillRect(sx + 5, sy + 14, this.width - 10, this.height - 20);

        // Buk (ljusare)
        ctx.fillStyle = '#E8EEF2';
        ctx.fillRect(sx + 18, sy + 22, this.width - 36, this.height - 32);

        // Armar
        const armDir = this.facing;
        ctx.fillStyle = '#C0CCD5';
        ctx.fillRect(sx + (armDir === 1 ? this.width - 8 : 0), sy + 18, 10, 28);
        ctx.fillRect(sx + (armDir === 1 ? 0 : this.width - 10), sy + 20, 10, 24);

        // Huvud (stort)
        const headX = sx + this.width / 2 - 18 + this.facing * 5;
        ctx.fillStyle = '#D0D8E0';
        ctx.fillRect(headX, sy, 36, 24);

        // Panna (mörkare)
        ctx.fillStyle = '#B8C4CC';
        ctx.fillRect(headX + 2, sy, 32, 8);

        // Ögon (glödande, arga)
        ctx.fillStyle = '#FF4444';
        const eyeOff = this.facing === 1 ? 6 : -2;
        ctx.fillRect(headX + 8 + eyeOff, sy + 9, 6, 5);
        ctx.fillRect(headX + 20 + eyeOff, sy + 9, 6, 5);
        // Pupill
        ctx.fillStyle = '#880000';
        ctx.fillRect(headX + 10 + eyeOff, sy + 10, 3, 3);
        ctx.fillRect(headX + 22 + eyeOff, sy + 10, 3, 3);

        // Mun (arg, tänder)
        const mouthX = headX + 10 + this.facing * 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(mouthX, sy + 17, 16, 5);
        // Tänder
        ctx.fillStyle = '#FFF';
        ctx.fillRect(mouthX + 2, sy + 17, 3, 3);
        ctx.fillRect(mouthX + 7, sy + 17, 3, 3);
        ctx.fillRect(mouthX + 12, sy + 17, 3, 3);

        // Horn/öron
        ctx.fillStyle = '#A0ACB5';
        ctx.fillRect(headX, sy - 4, 8, 8);
        ctx.fillRect(headX + 28, sy - 4, 8, 8);
    }
}
