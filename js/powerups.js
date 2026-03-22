// Powerups: bonusföremål som dyker upp slumpmässigt på plattformar

class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = type; // 'rocketboots' eller 'medkit'
        this.active = true;
        this.bobFrame = Math.random() * Math.PI * 2; // Starta på slumpmässig punkt i animationen
    }

    update() {
        this.bobFrame += 0.05;
    }

    collidesWith(player) {
        if (!this.active) return false;
        return player.x + player.width > this.x &&
               player.x < this.x + this.width &&
               player.y + player.height > this.y - 5 &&
               player.y < this.y + this.height;
    }

    draw(ctx, cameraY) {
        if (!this.active) return;

        const bob = Math.sin(this.bobFrame) * 3;
        const sx = this.x;
        const sy = this.y - cameraY + bob;

        // Glöd under föremålet
        const glowColor = this.type === 'rocketboots' ? 'rgba(255, 100, 0, 0.2)' : 'rgba(0, 200, 0, 0.2)';
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.ellipse(sx + this.width / 2, sy + this.height + 2, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.type === 'rocketboots') {
            this.drawRocketBoots(ctx, sx, sy);
        } else {
            this.drawMedkit(ctx, sx, sy);
        }

        // Glittersparkle
        const sparkle = Math.sin(this.bobFrame * 3) > 0.7;
        if (sparkle) {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(sx + 2, sy - 3, 2, 2);
            ctx.fillRect(sx + this.width - 4, sy + 2, 2, 2);
        }
    }

    drawRocketBoots(ctx, sx, sy) {
        // Stövel 1 (vänster)
        ctx.fillStyle = '#CC3300';
        ctx.fillRect(sx, sy + 4, 8, 12);
        ctx.fillStyle = '#AA2200';
        ctx.fillRect(sx, sy + 12, 10, 5);
        // Raketflamma
        ctx.fillStyle = '#FF8800';
        ctx.fillRect(sx + 2, sy + 17, 3, 3 + Math.sin(this.bobFrame * 4) * 2);
        ctx.fillStyle = '#FFDD00';
        ctx.fillRect(sx + 3, sy + 17, 1, 2);

        // Stövel 2 (höger)
        ctx.fillStyle = '#CC3300';
        ctx.fillRect(sx + 11, sy + 4, 8, 12);
        ctx.fillStyle = '#AA2200';
        ctx.fillRect(sx + 10, sy + 12, 10, 5);
        // Raketflamma
        ctx.fillStyle = '#FF8800';
        ctx.fillRect(sx + 14, sy + 17, 3, 3 + Math.sin(this.bobFrame * 4 + 1) * 2);
        ctx.fillStyle = '#FFDD00';
        ctx.fillRect(sx + 15, sy + 17, 1, 2);

        // Raketdetaljer
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(sx + 1, sy + 6, 6, 2);
        ctx.fillRect(sx + 12, sy + 6, 6, 2);
    }

    drawMedkit(ctx, sx, sy) {
        // Vit låda
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(sx + 1, sy + 3, 18, 14);

        // Röd ram
        ctx.strokeStyle = '#CC0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + 1, sy + 3, 18, 14);

        // Rött kors
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(sx + 7, sy + 5, 6, 10);
        ctx.fillRect(sx + 4, sy + 8, 12, 4);

        // Handtag
        ctx.fillStyle = '#999';
        ctx.fillRect(sx + 6, sy + 1, 8, 3);
        ctx.fillStyle = '#777';
        ctx.fillRect(sx + 8, sy, 4, 2);
    }
}

// Hanterar aktiv powerup-effekt på spelaren
class ActiveEffect {
    constructor(type, duration) {
        this.type = type;
        this.duration = duration; // Frames
        this.timer = duration;
    }

    update() {
        this.timer--;
        return this.timer > 0;
    }

    getProgress() {
        return this.timer / this.duration;
    }
}

// Hanterar alla powerups i spelet
class PowerupManager {
    constructor() {
        this.items = [];
        this.activeEffect = null;
        this.nextSpawnHeight = 30; // Första powerup vid 30m
        this.spawnInterval = 40;   // Var 40:e meter
        this.pickupParticles = [];
    }

    update(player, level) {
        const height = player.getHeight();

        // Spawna nya powerups
        if (height >= this.nextSpawnHeight) {
            this.spawnPowerup(player, level);
            this.nextSpawnHeight += this.spawnInterval + Math.floor(Math.random() * 20);
        }

        // Uppdatera föremål
        for (const item of this.items) {
            item.update();
        }

        // Kolla kollision med spelaren
        for (const item of this.items) {
            if (item.collidesWith(player)) {
                this.activatePowerup(item, player);
                item.active = false;
            }
        }

        // Uppdatera aktiv effekt
        if (this.activeEffect) {
            if (this.activeEffect.type === 'rocketboots') {
                // Flyg rakt uppåt
                player.vy = -8;
                player.onGround = false;
                player.climbing = false;
                player.currentLadder = null;
            }

            if (!this.activeEffect.update()) {
                this.activeEffect = null;
            }
        }

        // Uppdatera pickup-partiklar
        this.pickupParticles = this.pickupParticles.filter(p => {
            p.timer--;
            p.x += p.vx;
            p.y += p.vy;
            p.vy -= 0.05;
            return p.timer > 0;
        });

        // Rensa föremål som är långt bort
        this.items = this.items.filter(i => i.active && Math.abs(i.y - player.y) < 800);
    }

    spawnPowerup(player, level) {
        // Hitta en plattform nära spelarens höjd att placera powerupen på
        let bestPlatform = null;
        let bestDist = Infinity;

        for (const p of level.platforms) {
            if (p.type === 'ground') continue;
            const dist = Math.abs(p.y - (player.y - 200)); // Lite ovanför spelaren
            if (dist < bestDist && dist < 400) {
                bestDist = dist;
                bestPlatform = p;
            }
        }

        if (!bestPlatform) return;

        // Slumpa typ
        const type = Math.random() < 0.5 ? 'rocketboots' : 'medkit';
        const px = bestPlatform.x + 30 + Math.random() * (bestPlatform.width - 60);
        const py = bestPlatform.y - 22;

        this.items.push(new Powerup(px, py, type));
    }

    activatePowerup(item, player) {
        if (item.type === 'rocketboots') {
            // 5 sekunders flygning
            this.activeEffect = new ActiveEffect('rocketboots', 300); // 5 sek vid 60fps
        } else if (item.type === 'medkit') {
            // Återställ 50 HP
            player.health = Math.min(player.maxHealth, player.health + 50);
        }

        // Pickup-partiklar
        const color = item.type === 'rocketboots' ? '#FF8800' : '#00CC00';
        for (let i = 0; i < 10; i++) {
            this.pickupParticles.push({
                x: item.x + item.width / 2,
                y: item.y + item.height / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3 - 1,
                timer: 20 + Math.random() * 15,
                color: color
            });
        }
    }

    draw(ctx, cameraY) {
        // Rita föremål
        for (const item of this.items) {
            item.draw(ctx, cameraY);
        }

        // Rita pickup-partiklar
        for (const p of this.pickupParticles) {
            const alpha = p.timer / 35;
            ctx.fillStyle = p.color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
            // Enklare: bara färgad ruta
            ctx.globalAlpha = Math.min(1, p.timer / 15);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y - cameraY, 3, 3);
        }
        ctx.globalAlpha = 1;
    }

    drawActiveEffect(ctx, canvas) {
        if (!this.activeEffect) return;

        const progress = this.activeEffect.getProgress();

        if (this.activeEffect.type === 'rocketboots') {
            // Raketindikator
            ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
            roundRect(ctx, canvas.width / 2 - 75, canvas.height - 40, 150, 25, 6);
            ctx.fill();

            // Progressbar
            ctx.fillStyle = '#FF6600';
            roundRect(ctx, canvas.width / 2 - 72, canvas.height - 37, 144 * progress, 19, 4);
            ctx.fill();

            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('RAKETSTÖVLAR', canvas.width / 2, canvas.height - 23);
        }
    }

    isRocketActive() {
        return this.activeEffect && this.activeEffect.type === 'rocketboots';
    }

    reset() {
        this.items = [];
        this.activeEffect = null;
        this.nextSpawnHeight = 30;
        this.pickupParticles = [];
    }
}
