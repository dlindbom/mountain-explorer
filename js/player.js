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

        // Klättring
        this.climbing = false;
        this.currentLadder = null;
        this.climbSpeed = 3;
        this.climbFrame = 0;
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.hitSpikes = false;
        this.lastGroundY = this.startY;
        this.climbing = false;
        this.currentLadder = null;
    }

    update(keys, platforms, ladders) {
        this.hitSpikes = false;

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

        if (this.climbing) {
            this.drawClimbing(ctx, sx, sy);
        } else {
            this.drawNormal(ctx, sx, sy);
        }
    }

    drawClimbing(ctx, sx, sy) {
        const offset = Math.sin(this.climbFrame * Math.PI) * 3;

        // Armar (på stegrailsen)
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(sx - 4, sy + 3 - offset, 5, 10);
        ctx.fillRect(sx + this.width - 1, sy + 3 + offset, 5, 10);

        // Ben
        ctx.fillStyle = '#3D5A40';
        ctx.fillRect(sx + 4, sy + 24 + offset, 7, 8);
        ctx.fillRect(sx + 13, sy + 24 - offset, 7, 8);

        // Kängor
        ctx.fillStyle = '#5C4033';
        ctx.fillRect(sx + 3, sy + 30, 9, 3);
        ctx.fillRect(sx + 12, sy + 30, 9, 3);

        // Kropp
        ctx.fillStyle = '#E63946';
        ctx.fillRect(sx + 3, sy + 12, this.width - 6, 13);

        // Huvud
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(sx + 5, sy + 3, this.width - 10, 11);

        // Mössa
        ctx.fillStyle = '#457B9D';
        ctx.fillRect(sx + 4, sy, this.width - 8, 6);

        // Ögon (tittar uppåt)
        ctx.fillStyle = '#1D3557';
        ctx.fillRect(sx + 8, sy + 5, 2, 2);
        ctx.fillRect(sx + 14, sy + 5, 2, 2);
    }

    drawNormal(ctx, sx, sy) {
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

        // Kropp
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
