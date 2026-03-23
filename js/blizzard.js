// Snöstorm - ett vitt moln som drar in och gör skada + saktar ner spelaren

class Blizzard {
    constructor(playerY) {
        // Starta utanför skärmen, från vänster eller höger
        this.fromLeft = Math.random() < 0.5;
        this.x = this.fromLeft ? -300 : 800;
        this.y = playerY - 100 - Math.random() * 200;
        this.width = 350;
        this.height = 200;
        this.speed = 0.8;
        this.active = true;
        this.timer = 0;
        this.duration = 360; // 6 sekunder
        this.particles = [];

        // Generera snöpartiklar
        for (let i = 0; i < 60; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 1 + Math.random() * 3,
                speedX: (this.fromLeft ? 1 : -1) * (2 + Math.random() * 3),
                speedY: 0.5 + Math.random() * 1.5,
                wobble: Math.random() * Math.PI * 2
            });
        }
    }

    update(playerX, playerY) {
        if (!this.active) return;

        this.timer++;

        // Rör sig sakta mot spelarens position
        const targetX = playerX - this.width / 2;
        const targetY = playerY - this.height / 2;
        this.x += (targetX - this.x) * 0.01;
        this.y += (targetY - this.y) * 0.008;

        // Uppdatera snöpartiklar
        for (const p of this.particles) {
            p.x += p.speedX * 0.5;
            p.y += p.speedY;
            p.wobble += 0.05;
            p.x += Math.sin(p.wobble) * 0.5;

            // Wrappa partiklar
            if (p.x > this.width) p.x -= this.width;
            if (p.x < 0) p.x += this.width;
            if (p.y > this.height) p.y -= this.height;
        }

        // Inaktivera efter duration
        if (this.timer >= this.duration) {
            this.active = false;
        }
    }

    isPlayerInside(player) {
        if (!this.active) return false;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;
        // Elliptisk check (mjukare känsla)
        const dx = (px - cx) / (this.width / 2);
        const dy = (py - cy) / (this.height / 2);
        return dx * dx + dy * dy < 1;
    }

    draw(ctx, cameraY) {
        if (!this.active) return;

        const sx = this.x;
        const sy = this.y - cameraY;
        const fadeIn = Math.min(1, this.timer / 60);
        const fadeOut = Math.min(1, (this.duration - this.timer) / 60);
        const alpha = fadeIn * fadeOut;

        // Molnkropp (stort vitt halvtransparent moln)
        ctx.fillStyle = `rgba(220, 230, 240, ${0.35 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(sx + this.width / 2, sy + this.height / 2,
            this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inre moln (tätare)
        ctx.fillStyle = `rgba(200, 215, 230, ${0.25 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(sx + this.width / 2 - 30, sy + this.height / 2 - 20,
            this.width / 3, this.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(sx + this.width / 2 + 40, sy + this.height / 2 + 10,
            this.width / 3.5, this.height / 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snöpartiklar
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * alpha})`;
        for (const p of this.particles) {
            ctx.fillRect(sx + p.x, sy + p.y, p.size, p.size);
        }

        // Vindslingor
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * alpha})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const ly = sy + 30 + i * 45;
            const lx = sx + (this.timer * 2 + i * 80) % this.width;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.quadraticCurveTo(lx + 40, ly - 10, lx + 80, ly + 5);
            ctx.stroke();
        }
    }
}

// Hanterar snöstormar
class BlizzardManager {
    constructor() {
        this.blizzards = [];
        this.nextBlizzardHeight = 80;
        this.interval = 120; // Var 120:e meter
    }

    update(player) {
        const height = player.getHeight();

        // Spawna ny snöstorm
        if (height >= this.nextBlizzardHeight) {
            this.blizzards.push(new Blizzard(player.y));
            this.nextBlizzardHeight += this.interval + Math.floor(Math.random() * 40);
        }

        // Uppdatera alla snöstormar
        player.blizzardSlow = false;
        for (const b of this.blizzards) {
            b.update(player.x, player.y);

            if (b.isPlayerInside(player)) {
                if (player.hasWarmJacket) {
                    // Jackan skyddar - förbruka den
                    player.hasWarmJacket -= 1;
                    b.active = false;
                } else {
                    // 10 skada per sekund
                    player.takeDamage(10 / 60);
                    player.blizzardSlow = true;
                }
            }
        }

        // Rensa inaktiva
        this.blizzards = this.blizzards.filter(b => b.active);
    }

    draw(ctx, cameraY) {
        for (const b of this.blizzards) {
            b.draw(ctx, cameraY);
        }
    }

    drawWarning(ctx, canvas, player) {
        if (player.blizzardSlow) {
            const alpha = 0.4 + Math.sin(Date.now() * 0.005) * 0.15;
            ctx.fillStyle = `rgba(180, 200, 230, ${alpha})`;
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('❄ SNÖSTORM! ❄', canvas.width / 2, 90);
        }
    }

    reset() {
        this.blizzards = [];
        this.nextBlizzardHeight = 80;
    }
}
