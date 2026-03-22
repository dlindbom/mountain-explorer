// Spelarkaraktären - en liten bergsklättrare

// Karaktärsdata
const CHARACTERS = {
    alfred: {
        name: 'Alfred',
        desc: 'Hoppar 30% högre',
        speed: 4.5,
        jumpForce: -13.65, // 30% högre (-10.5 * 1.3)
        climbSpeed: 3,
        jacket: '#3B7DD8',
        pants: '#3D5A40',
        hat: '#E8A030',
        backpack: '#5A3A8A',
    },
    astrid: {
        name: 'Astrid',
        desc: 'Springer 50% snabbare',
        speed: 6.75, // 50% snabbare (4.5 * 1.5)
        jumpForce: -10.5,
        climbSpeed: 4,
        jacket: '#D44B8A',
        pants: '#4A3D6B',
        hat: '#44B89D',
        backpack: '#C85A30',
    },
    pappa: {
        name: 'Pappa',
        desc: 'Tål 50% mer skada',
        speed: 4.5,
        jumpForce: -10.5,
        climbSpeed: 3,
        scale: 1.5,       // 50% större
        maxHealth: 150,    // 50% mer hälsa
        jacket: '#5A5A5A',   // Grå jacka
        pants: '#3A3A3A',
        hat: '#8B0000',      // Mörkröd mössa
        backpack: '#4A3520',
    },
    jeff: {
        name: 'Jeff',
        desc: 'Hoppar högt + springer snabbt',
        speed: 6.75,          // Astrids fart
        jumpForce: -13.65,    // Alfreds hopp
        climbSpeed: 4,
        cost: 300,            // Kostar 300 kr att låsa upp
        jacket: '#FFD700',    // Guld jacka
        pants: '#1A1A2E',
        hat: '#FF4500',       // Eldröd mössa
        backpack: '#FFD700',  // Guld ryggsäck
    }
};

class Player {
    constructor(x, y, characterId) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        // Karaktärsval (läs in innan storlek sätts)
        this.characterId = characterId || 'alfred';
        const char = CHARACTERS[this.characterId];
        this.characterName = char.name;
        this.speed = char.speed;
        this.jumpForce = char.jumpForce;
        this.climbSpeed = char.climbSpeed;
        this.colors = char;
        this.scale = char.scale || 1;

        this.width = Math.round(24 * this.scale);
        this.height = Math.round(32 * this.scale);
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.5;
        this.onGround = false;
        this.facing = 1;
        this.maxHeight = 0;
        this.walkFrame = 0;
        this.inLava = false;
        this.lastGroundY = y;

        // Hälsa
        this.maxHealth = char.maxHealth || 100;
        this.health = this.maxHealth;

        // Powerups
        this.hasBat = false;

        // Klättring
        this.climbing = false;
        this.currentLadder = null;
        this.climbFrame = 0;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    isDead() {
        return this.health <= 0;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.inLava = false;
        this.lastGroundY = this.startY;
        this.health = this.maxHealth;
        this.hasBat = false;
        this.climbing = false;
        this.currentLadder = null;
    }

    update(keys, platforms, ladders) {
        this.inLava = false;

        if (this.climbing) {
            this.updateClimbing(keys, ladders);
        } else {
            this.updateNormal(keys, platforms, ladders);
        }

        const h = this.getHeight();
        if (h > this.maxHeight) this.maxHeight = h;
    }

    updateClimbing(keys, ladders) {
        const ladder = this.currentLadder;

        // Kolla att stegen fortfarande finns
        if (!ladder || !ladders.includes(ladder)) {
            this.climbing = false;
            this.currentLadder = null;
            return;
        }

        // Klättra upp
        if (keys['ArrowUp'] || keys['w']) {
            this.y -= this.climbSpeed;
            this.climbFrame += 0.12;
        }
        // Klättra ner
        if (keys['ArrowDown'] || keys['s']) {
            this.y += this.climbSpeed;
            this.climbFrame += 0.12;
        }

        // Centrera på stegen
        this.x = ladder.x + (ladder.width - this.width) / 2;
        this.vy = 0;
        this.vx = 0;

        // Nådde toppen - kliv av på bron ovanför
        if (this.y + this.height <= ladder.topY) {
            this.y = ladder.topY - this.height;
            this.climbing = false;
            this.currentLadder = null;
            this.onGround = true;
            this.lastGroundY = this.y;
        }

        // Nådde botten - kliv av på bron under
        if (this.y + this.height >= ladder.bottomY) {
            this.y = ladder.bottomY - this.height;
            this.climbing = false;
            this.currentLadder = null;
            this.onGround = true;
            this.lastGroundY = this.y;
        }

        // Hoppa av stegen (vänster/höger när man INTE håller upp)
        const wantsUp = keys['ArrowUp'] || keys['w'];
        const wantsLeft = keys['ArrowLeft'] || keys['a'];
        const wantsRight = keys['ArrowRight'] || keys['d'];
        const wantsJump = keys[' '];

        if (!wantsUp && (wantsLeft || wantsRight || wantsJump)) {
            if (wantsLeft) this.facing = -1;
            if (wantsRight) this.facing = 1;
            this.climbing = false;
            this.currentLadder = null;
            this.vx = this.facing * this.speed;
            this.vy = this.jumpForce * 0.5;
        }
    }

    updateNormal(keys, platforms, ladders) {
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

        // Kolla om vi kan börja klättra (ArrowUp nära en stege)
        let startedClimbing = false;
        if ((keys['ArrowUp'] || keys['w']) && (this.onGround || this.vy > 0)) {
            for (const ladder of ladders) {
                if (this.isNearLadder(ladder)) {
                    this.climbing = true;
                    this.currentLadder = ladder;
                    this.x = ladder.x + (ladder.width - this.width) / 2;
                    this.vy = 0;
                    this.vx = 0;
                    this.climbFrame = 0;
                    startedClimbing = true;
                    break;
                }
            }
        }

        if (startedClimbing) return;

        // Hopp (Space alltid, ArrowUp om inte nära stege)
        if ((keys[' '] || keys['ArrowUp'] || keys['w']) && this.onGround) {
            this.vy = this.jumpForce;
            this.onGround = false;
        }

        // Gravitation
        this.vy += this.gravity;

        // Flytta
        this.x += this.vx;
        this.y += this.vy;

        // Horisontel gräns
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > 800) this.x = 800 - this.width;

        // Plattformskollision (ovanifrån)
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

                // Kolla om vi landade i lava (använd aktuell storlek)
                if (p.lavaStart !== undefined) {
                    const ls = p.lavaCurrentStart !== undefined ? p.lavaCurrentStart : p.lavaStart;
                    const lw = p.lavaCurrentWidth !== undefined ? p.lavaCurrentWidth : p.lavaWidth;
                    const lavaLeft = p.x + ls;
                    const lavaRight = lavaLeft + lw;
                    if (this.x + this.width - 2 > lavaLeft && this.x + 2 < lavaRight) {
                        this.inLava = true;
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
    }

    isNearLadder(ladder) {
        const ladderCenter = ladder.x + ladder.width / 2;
        const playerCenter = this.x + this.width / 2;
        if (Math.abs(playerCenter - ladderCenter) > 28) return false;

        const feetY = this.y + this.height;
        return feetY >= ladder.topY - 5 && feetY <= ladder.bottomY + 10;
    }

    getHeight() {
        return Math.max(0, Math.round((this.startY - this.y) / 10));
    }

    draw(ctx, cameraY) {
        const sx = this.x;
        const sy = this.y - cameraY;

        // Skala allt ritande
        ctx.save();
        ctx.translate(sx, sy);
        ctx.scale(this.scale, this.scale);

        if (this.climbing) {
            this.drawClimbing(ctx);
        } else {
            this.drawNormal(ctx);
        }

        ctx.restore();
    }

    drawClimbing(ctx) {
        const offset = Math.sin(this.climbFrame * Math.PI) * 3;
        const c = this.colors;

        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(-4, 3 - offset, 5, 10);
        ctx.fillRect(20, 3 + offset, 5, 10);

        ctx.fillStyle = c.pants;
        ctx.fillRect(4, 24 + offset, 7, 8);
        ctx.fillRect(13, 24 - offset, 7, 8);

        ctx.fillStyle = '#5C4033';
        ctx.fillRect(3, 30, 9, 3);
        ctx.fillRect(12, 30, 9, 3);

        ctx.fillStyle = c.jacket;
        ctx.fillRect(3, 12, 18, 13);

        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(5, 3, 14, 11);

        ctx.fillStyle = c.hat;
        ctx.fillRect(4, 0, 16, 6);

        ctx.fillStyle = '#1D3557';
        ctx.fillRect(8, 5, 2, 2);
        ctx.fillRect(14, 5, 2, 2);

        // Skägg för Pappa
        if (this.characterId === 'pappa') {
            ctx.fillStyle = '#8B7355';
            ctx.fillRect(6, 11, 12, 4);
        }
    }

    drawNormal(ctx) {
        const legOffset = Math.sin(this.walkFrame * Math.PI) * 3;
        const c = this.colors;

        // Skugga
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(12, 32, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ben
        ctx.fillStyle = c.pants;
        if (this.onGround && this.vx !== 0) {
            ctx.fillRect(4, 24 + legOffset, 7, 8 - legOffset);
            ctx.fillRect(13, 24 - legOffset, 7, 8 + legOffset);
        } else {
            ctx.fillRect(4, 24, 7, 8);
            ctx.fillRect(13, 24, 7, 8);
        }

        // Kängor
        ctx.fillStyle = '#5C4033';
        ctx.fillRect(3, 30, 9, 3);
        ctx.fillRect(12, 30, 9, 3);

        // Kropp
        ctx.fillStyle = c.jacket;
        ctx.fillRect(3, 12, 18, 13);

        // Ryggsäck
        const backX = this.facing === 1 ? 0 : 18;
        ctx.fillStyle = c.backpack;
        ctx.fillRect(backX, 13, 6, 10);

        // Huvud
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(5, 3, 14, 11);

        // Mössa
        ctx.fillStyle = c.hat;
        ctx.fillRect(4, 0, 16, 6);
        ctx.fillRect(7, -2, 10, 3);

        // Ögon
        const eyeX = this.facing === 1 ? 2 : -2;
        ctx.fillStyle = '#1D3557';
        ctx.fillRect(8 + eyeX, 7, 2, 2);
        ctx.fillRect(14 + eyeX, 7, 2, 2);

        // Skägg för Pappa
        if (this.characterId === 'pappa') {
            ctx.fillStyle = '#8B7355';
            ctx.fillRect(7 + eyeX, 11, 10, 4);
            ctx.fillRect(6 + eyeX, 12, 2, 2);
            ctx.fillRect(18 + eyeX, 12, 2, 2);
        }

        // Mun
        ctx.fillStyle = '#C1666B';
        ctx.fillRect(10 + eyeX, this.characterId === 'pappa' ? 15 : 11, 4, 1);
    }
}
