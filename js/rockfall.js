// Stenras - stenbumlingar som faller ner och kan träffa spelaren

class Rock {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 18 + Math.random() * 14;
        this.height = this.width * (0.8 + Math.random() * 0.3);
        this.vy = 1 + Math.random() * 2;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.08;
        this.active = true;
        // Lite variation i färg
        this.shade = 90 + Math.floor(Math.random() * 30);
    }

    update() {
        if (!this.active) return;

        this.vy += 0.15; // Gravitation (långsammare än spelaren för synlighet)
        this.y += this.vy;
        this.x += this.vx;
        this.rotation += this.rotSpeed;

        // Studsa mot väggar
        if (this.x < 0 || this.x + this.width > 800) {
            this.vx *= -0.6;
            this.x = Math.max(0, Math.min(this.x, 800 - this.width));
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

        const sx = this.x + this.width / 2;
        const sy = this.y + this.height / 2 - cameraY;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.rotation);

        // Stenform (ojämn)
        const hw = this.width / 2;
        const hh = this.height / 2;
        const s = this.shade;

        ctx.fillStyle = `rgb(${s}, ${s - 8}, ${s - 15})`;
        ctx.beginPath();
        ctx.moveTo(-hw + 3, -hh);
        ctx.lineTo(hw - 2, -hh + 2);
        ctx.lineTo(hw, hh - 3);
        ctx.lineTo(hw - 4, hh);
        ctx.lineTo(-hw + 2, hh - 1);
        ctx.lineTo(-hw, -hh + 4);
        ctx.fill();

        // Ljus sida
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(-hw + 3, -hh + 1, hw, 3);

        // Mörk sida
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(-hw + 2, hh - 4, hw + 2, 3);

        ctx.restore();
    }
}

// Hanterar alla stenras
class RockfallManager {
    constructor() {
        this.rocks = [];
        this.nextRockfallHeight = 50; // Första stenraset vid 50m
        this.spawnTimer = 0;
        this.isActive = false; // Pågående stenras
        this.rocksToSpawn = 0;
    }

    update(playerY, playerHeight, groundY) {
        const height = Math.max(0, Math.round((groundY - 32 - playerY) / 10));

        // Starta nytt stenras var 50:e meter
        if (height >= this.nextRockfallHeight && !this.isActive) {
            this.isActive = true;
            this.rocksToSpawn = 3 + Math.floor(Math.random() * 4); // 3-6 stenar
            this.spawnTimer = 0;
            this.nextRockfallHeight += 50;
        }

        // Spawna stenar under pågående stenras
        if (this.isActive && this.rocksToSpawn > 0) {
            this.spawnTimer++;
            if (this.spawnTimer % 15 === 0) { // Ny sten var 15:e frame
                // Spawna stenen ovanför spelaren, med lite slump
                const spawnX = 50 + Math.random() * 700;
                const spawnY = playerY - 400 - Math.random() * 200;
                this.rocks.push(new Rock(spawnX, spawnY));
                this.rocksToSpawn--;

                if (this.rocksToSpawn <= 0) {
                    this.isActive = false;
                }
            }
        }

        // Uppdatera alla stenar
        for (const rock of this.rocks) {
            rock.update();
        }

        // Rensa stenar som fallit långt under spelaren
        this.rocks = this.rocks.filter(r => r.active && r.y < playerY + 800);
    }

    checkCollision(player) {
        for (const rock of this.rocks) {
            if (rock.collidesWith(player)) {
                rock.active = false;
                return true;
            }
        }
        return false;
    }

    draw(ctx, cameraY) {
        for (const rock of this.rocks) {
            rock.draw(ctx, cameraY);
        }
    }

    // Varningstecken: visa "!" när stenras är på väg
    drawWarning(ctx, canvas) {
        if (this.isActive || this.rocksToSpawn > 0) {
            const alpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
            ctx.fillStyle = `rgba(200, 150, 50, ${alpha})`;
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('⚠ STENRAS! ⚠', canvas.width / 2, 75);
        }
    }

    reset() {
        this.rocks = [];
        this.nextRockfallHeight = 50;
        this.spawnTimer = 0;
        this.isActive = false;
        this.rocksToSpawn = 0;
    }
}
