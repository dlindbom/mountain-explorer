// Örn - dyker ner från himlen om spelaren står stilla för länge

class Eagle {
    constructor(targetX, targetY) {
        // Starta utanför skärmen, ovanifrån
        this.x = targetX + (Math.random() < 0.5 ? -300 : 300);
        this.y = targetY - 400;
        this.width = 40;
        this.height = 20;
        this.speed = 6;
        this.active = true;
        this.wingFrame = 0;
        this.targetX = targetX;
        this.targetY = targetY;
        this.diving = true;
    }

    update(playerX, playerY) {
        if (!this.active) return;

        // Sikta mot spelaren
        this.targetX = playerX;
        this.targetY = playerY;

        const dx = this.targetX - (this.x + this.width / 2);
        const dy = this.targetY - (this.y + this.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        // Riktning
        this.facing = dx > 0 ? 1 : -1;

        // Vinganimation (snabbare under dykning)
        this.wingFrame += 0.15;

        // Om örnen passerat spelaren och är långt bort, avaktivera
        if (this.y > playerY + 300) {
            this.active = false;
        }
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
        const wingY = Math.sin(this.wingFrame * Math.PI) * 8;
        const f = this.facing;

        // Skugga på marken (subtil)
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(sx + this.width / 2, sy + 60, 15, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vingar
        ctx.fillStyle = '#4A3828';
        // Vänster vinge
        ctx.beginPath();
        ctx.moveTo(sx + this.width / 2 - 2, sy + 8);
        ctx.lineTo(sx - 15, sy + wingY);
        ctx.lineTo(sx - 8, sy + 12);
        ctx.fill();
        // Höger vinge
        ctx.beginPath();
        ctx.moveTo(sx + this.width / 2 + 2, sy + 8);
        ctx.lineTo(sx + this.width + 15, sy + wingY);
        ctx.lineTo(sx + this.width + 8, sy + 12);
        ctx.fill();

        // Vingspetsar (ljusare)
        ctx.fillStyle = '#6B5A48';
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy + wingY + 2);
        ctx.lineTo(sx - 18, sy + wingY - 2);
        ctx.lineTo(sx - 10, sy + wingY + 5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx + this.width + 8, sy + wingY + 2);
        ctx.lineTo(sx + this.width + 18, sy + wingY - 2);
        ctx.lineTo(sx + this.width + 10, sy + wingY + 5);
        ctx.fill();

        // Kropp
        ctx.fillStyle = '#3A2A1A';
        ctx.fillRect(sx + 10, sy + 4, this.width - 20, 14);

        // Buk (ljusare)
        ctx.fillStyle = '#D4C4A0';
        ctx.fillRect(sx + 13, sy + 10, this.width - 26, 6);

        // Huvud
        const headX = f === 1 ? sx + this.width - 12 : sx + 2;
        ctx.fillStyle = '#F5F0E0'; // Vitt huvud (havsörn-stil)
        ctx.fillRect(headX, sy + 2, 10, 10);

        // Öga
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(headX + (f === 1 ? 6 : 2), sy + 4, 3, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(headX + (f === 1 ? 7 : 3), sy + 5, 1, 1);

        // Näbb
        ctx.fillStyle = '#DAA520';
        const beakX = f === 1 ? headX + 10 : headX - 5;
        ctx.fillRect(beakX, sy + 7, 5, 3);
        ctx.fillRect(beakX + (f === 1 ? 2 : 0), sy + 10, 3, 1);

        // Svansfjädrar
        const tailX = f === 1 ? sx + 8 : sx + this.width - 12;
        ctx.fillStyle = '#3A2A1A';
        ctx.fillRect(tailX, sy + 12, 6, 5);
        ctx.fillStyle = '#4A3828';
        ctx.fillRect(tailX + (f === 1 ? -3 : 5), sy + 14, 4, 4);

        // Klor (utsträckta under dykning)
        ctx.fillStyle = '#333';
        ctx.fillRect(sx + 14, sy + 18, 2, 4);
        ctx.fillRect(sx + 18, sy + 18, 2, 5);
        ctx.fillRect(sx + this.width - 16, sy + 18, 2, 4);
        ctx.fillRect(sx + this.width - 20, sy + 18, 2, 5);
    }
}
