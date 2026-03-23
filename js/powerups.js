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
        const glowColors = { rocketboots: 'rgba(255, 100, 0, 0.2)', medkit: 'rgba(0, 200, 0, 0.2)', bat: 'rgba(200, 150, 50, 0.2)', gold: 'rgba(255, 215, 0, 0.3)', waterbucket: 'rgba(50, 150, 255, 0.25)', warmjacket: 'rgba(200, 100, 50, 0.25)' };
        const glowColor = glowColors[this.type] || 'rgba(200, 200, 200, 0.2)';
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.ellipse(sx + this.width / 2, sy + this.height + 2, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.type === 'rocketboots') {
            this.drawRocketBoots(ctx, sx, sy);
        } else if (this.type === 'bat') {
            this.drawBat(ctx, sx, sy);
        } else if (this.type === 'gold') {
            this.drawGold(ctx, sx, sy);
        } else if (this.type === 'waterbucket') {
            this.drawWaterBucket(ctx, sx, sy);
        } else if (this.type === 'warmjacket') {
            this.drawWarmJacket(ctx, sx, sy);
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

    drawBat(ctx, sx, sy) {
        // Slagträ (snett lutande)
        ctx.save();
        ctx.translate(sx + 10, sy + 10);
        ctx.rotate(-0.5);

        // Handtag
        ctx.fillStyle = '#4A3520';
        ctx.fillRect(-2, 2, 5, 14);

        // Grepp-tejp
        ctx.fillStyle = '#222';
        ctx.fillRect(-2, 12, 5, 4);

        // Slagyta
        ctx.fillStyle = '#B8935A';
        ctx.fillRect(-4, -8, 9, 12);

        // Topp (rundad)
        ctx.fillStyle = '#C8A36A';
        ctx.fillRect(-3, -10, 7, 4);

        ctx.restore();
    }

    drawGold(ctx, sx, sy) {
        // Guldmynt i en hög
        // Botten-mynt
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.ellipse(sx + 6, sy + 16, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(sx + 14, sy + 16, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mellanmynt
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(sx + 10, sy + 12, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(sx + 5, sy + 12, 5, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Toppmynt (glansigt)
        ctx.fillStyle = '#FFE44D';
        ctx.beginPath();
        ctx.ellipse(sx + 10, sy + 8, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glans
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(sx + 9, sy + 7, 3, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // "kr" text
        ctx.fillStyle = '#B8860B';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('kr', sx + 10, sy + 10);
    }

    drawWaterBucket(ctx, sx, sy) {
        // Hink
        ctx.fillStyle = '#6A6A6A';
        ctx.beginPath();
        ctx.moveTo(sx + 2, sy + 4);
        ctx.lineTo(sx + 18, sy + 4);
        ctx.lineTo(sx + 16, sy + 18);
        ctx.lineTo(sx + 4, sy + 18);
        ctx.fill();
        // Vatten
        ctx.fillStyle = '#4488DD';
        ctx.fillRect(sx + 4, sy + 6, 12, 10);
        // Vattenyta (ljusare)
        ctx.fillStyle = '#66AAEE';
        ctx.fillRect(sx + 4, sy + 6, 12, 3);
        // Glans
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(sx + 6, sy + 7, 4, 1);
        // Handtag
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx + 10, sy + 2, 6, Math.PI, 0);
        ctx.stroke();
        // Droppar
        const dropY = Math.sin(this.bobFrame * 2) * 2;
        ctx.fillStyle = '#4488DD';
        ctx.fillRect(sx + 8, sy + 18 + dropY, 2, 3);
    }

    drawWarmJacket(ctx, sx, sy) {
        // Jacka (puffer-stil)
        ctx.fillStyle = '#CC4400';
        // Kropp
        ctx.fillRect(sx + 3, sy + 5, 14, 13);
        // Ärmar
        ctx.fillRect(sx, sy + 6, 5, 10);
        ctx.fillRect(sx + 15, sy + 6, 5, 10);
        // Päls-krage
        ctx.fillStyle = '#F5E6D0';
        ctx.fillRect(sx + 3, sy + 3, 14, 4);
        ctx.fillRect(sx + 5, sy + 1, 10, 3);
        // Dragkedja
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(sx + 9, sy + 7, 2, 10);
        // Knapp
        ctx.fillRect(sx + 8, sy + 9, 4, 2);
        // Snöflinga ovanpå
        ctx.fillStyle = '#FFF';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('❄', sx + 10, sy + 1);
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

        // Slumpa typ — guld är mer sällsynt (15% chans)
        let type;
        if (Math.random() < 0.15) {
            type = 'gold';
        } else {
            const types = ['rocketboots', 'medkit', 'bat', 'waterbucket', 'warmjacket'];
            type = types[Math.floor(Math.random() * types.length)];
        }
        const px = bestPlatform.x + 30 + Math.random() * (bestPlatform.width - 60);
        const py = bestPlatform.y - 22;

        this.items.push(new Powerup(px, py, type));
    }

    activatePowerup(item, player) {
        if (item.type === 'rocketboots') {
            this.activeEffect = new ActiveEffect('rocketboots', 150); // 2.5 sek vid 60fps
        } else if (item.type === 'bat') {
            this.activeEffect = new ActiveEffect('bat', 1); // Engångs, hanteras vid kollision
            player.hasBat = true;
        } else if (item.type === 'gold') {
            economy.coins += 20 * (player.coinMultiplier || 1);
            economy.save();
        } else if (item.type === 'waterbucket') {
            player.hasWaterBucket = true;
        } else if (item.type === 'warmjacket') {
            player.hasWarmJacket = true;
        } else if (item.type === 'medkit') {
            // Återställ 50 HP
            player.health = Math.min(player.maxHealth, player.health + 50);
        }

        // Pickup-partiklar
        const pickupColors = { rocketboots: '#FF8800', medkit: '#00CC00', bat: '#C8A36A', gold: '#FFD700', waterbucket: '#4488DD', warmjacket: '#CC4400' };
        const color = pickupColors[item.type] || '#FFF';
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

    drawActiveEffect(ctx, canvas, player) {
        // Raketindikator
        if (this.activeEffect && this.activeEffect.type === 'rocketboots') {
            const progress = this.activeEffect.getProgress();
            ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
            roundRect(ctx, canvas.width / 2 - 75, canvas.height - 40, 150, 25, 6);
            ctx.fill();
            ctx.fillStyle = '#FF6600';
            roundRect(ctx, canvas.width / 2 - 72, canvas.height - 37, 144 * progress, 19, 4);
            ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('RAKETSTÖVLAR', canvas.width / 2, canvas.height - 23);
        }

        // Itemindiatorer (höger sida, under pengar)
        if (player) {
            let iy = 42;
            const drawIndicator = (label, color) => {
                ctx.fillStyle = color;
                roundRect(ctx, canvas.width - 115, iy, 100, 18, 5);
                ctx.fill();
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(label, canvas.width - 65, iy + 13);
                iy += 22;
            };
            if (player.hasBat) drawIndicator('🏏 SLAGTRÄ', 'rgba(180, 140, 80, 0.6)');
            if (player.hasWaterBucket) drawIndicator('🪣 VATTEN', 'rgba(50, 120, 200, 0.6)');
            if (player.hasWarmJacket) drawIndicator('🧥 JACKA', 'rgba(200, 80, 30, 0.6)');
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
