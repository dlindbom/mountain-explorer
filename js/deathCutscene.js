// Döds-cutscenes: korta animationer beroende på dödsorsak

class DeathCutscene {
    constructor(cause, playerColors, deathInfo) {
        this.cause = cause;
        this.colors = playerColors;
        this.frame = 0;
        this.canRestart = false;
        this.animDuration = this.getAnimDuration();
        // Info för slutskärmen
        this.deathCause = deathInfo.deathCause || '';
        this.maxHeight = deathInfo.maxHeight || 0;
        this.gotNewRecord = deathInfo.gotNewRecord || false;
        this.recordEarned = deathInfo.recordEarned || 0;
    }

    getAnimDuration() {
        switch (this.cause) {
            case 'eagle': return 180;
            case 'bear': return 150;
            case 'yeti': return 120;
            case 'rock': return 90;
            case 'lava': return 120;
            default: return 90;
        }
    }

    update() {
        this.frame++;
        // Kan starta om efter animationen + 1.5 sek
        if (this.frame >= this.animDuration + 90) {
            this.canRestart = true;
        }
    }

    draw(ctx, canvas) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Mörk bakgrund
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (this.frame <= this.animDuration) {
            // Fas 1: animationen
            this.drawAnimation(ctx, canvas);
        } else {
            // Fas 2: resultat + restart
            this.drawResults(ctx, canvas);
        }
    }

    drawResults(ctx, canvas) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const fadeT = Math.min(1, (this.frame - this.animDuration) / 30);

        ctx.globalAlpha = fadeT;

        // Dödsorsak
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.deathCause, cx, cy - 50);

        // Höjd
        ctx.font = '18px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(`Höjd: ${this.maxHeight} m`, cx, cy - 15);

        // Nytt rekord
        if (this.gotNewRecord) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 16px monospace';
            ctx.fillText(`NYTT REKORD! +${this.recordEarned} kr`, cx, cy + 15);
        }

        // Pengar
        ctx.fillStyle = '#FFD700';
        ctx.font = '14px monospace';
        ctx.fillText(`💰 ${economy.coins} kr`, cx, cy + 42);

        // Restart-instruktioner
        if (this.canRestart) {
            ctx.font = '13px monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            if (isTouchDevice) {
                ctx.fillText('Tryck för att försöka igen', cx, cy + 75);
            } else {
                ctx.fillText('Mellanslag = försök igen', cx, cy + 75);
                ctx.fillText('Escape = byt karaktär', cx, cy + 93);
            }
        }

        ctx.globalAlpha = 1;
    }

    drawAnimation(ctx, canvas) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const t = this.frame / this.animDuration;

        switch (this.cause) {
            case 'eagle': this.drawEagleCutscene(ctx, cx, cy, t); break;
            case 'bear': this.drawBearCutscene(ctx, cx, cy, t); break;
            case 'yeti': this.drawYetiCutscene(ctx, cx, cy, t); break;
            case 'rock': this.drawRockCutscene(ctx, cx, cy, t); break;
            case 'lava': this.drawLavaCutscene(ctx, cx, cy, t); break;
            default: this.drawFallCutscene(ctx, cx, cy, t); break;
        }
    }

    // Hjälp: rita liten gubbe
    drawMiniPlayer(ctx, x, y, scale, rotation) {
        const s = scale || 1;
        ctx.save();
        ctx.translate(x, y);
        if (rotation) ctx.rotate(rotation);
        ctx.scale(s, s);

        // Ben
        ctx.fillStyle = this.colors.pants;
        ctx.fillRect(-8, 12, 7, 8);
        ctx.fillRect(1, 12, 7, 8);
        // Kropp
        ctx.fillStyle = this.colors.jacket;
        ctx.fillRect(-9, 0, 18, 13);
        // Huvud
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(-7, -10, 14, 11);
        // Mössa
        ctx.fillStyle = this.colors.hat;
        ctx.fillRect(-8, -14, 16, 6);
        // Ögon (skrämda)
        ctx.fillStyle = '#FFF';
        ctx.fillRect(-4, -7, 3, 3);
        ctx.fillRect(2, -7, 3, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(-3, -6, 1, 1);
        ctx.fillRect(3, -6, 1, 1);
        // Mun (O-form, rädd)
        ctx.fillStyle = '#000';
        ctx.fillRect(-2, -2, 4, 3);

        ctx.restore();
    }

    // === ÖRNEN: lyfter spelaren och flyger till boet ===
    drawEagleCutscene(ctx, cx, cy, t) {
        // Fas 1: örnen griper tag (0-0.3)
        // Fas 2: flyger uppåt med spelaren (0.3-0.7)
        // Fas 3: boet, spelaren försvinner (0.7-1)

        const groundY = cy + 80;

        if (t < 0.3) {
            // Spelaren på marken, örnen dyker ner
            const eagleY = cy - 200 + (t / 0.3) * (groundY - cy + 200 - 40);
            this.drawMiniPlayer(ctx, cx, groundY, 2);
            this.drawMiniEagle(ctx, cx, eagleY, 3);
        } else if (t < 0.7) {
            // Flyger uppåt med spelaren
            const flyT = (t - 0.3) / 0.4;
            const flyY = groundY - 40 - flyT * 250;
            const flyX = cx + Math.sin(flyT * 4) * 30;
            const scale = 2 - flyT * 0.8;
            this.drawMiniPlayer(ctx, flyX, flyY + 30, scale, Math.sin(flyT * 6) * 0.3);
            this.drawMiniEagle(ctx, flyX, flyY, scale + 0.5);
        } else {
            // Boet högst upp, spelaren försvinner
            const fadeT = (t - 0.7) / 0.3;
            // Bo
            ctx.fillStyle = '#5A4020';
            ctx.beginPath();
            ctx.ellipse(cx, cy - 60, 60, 25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#4A3018';
            ctx.beginPath();
            ctx.ellipse(cx, cy - 60, 50, 15, 0, 0, Math.PI);
            ctx.fill();
            // Lilla örnar i boet
            ctx.fillStyle = '#8B7B60';
            ctx.fillRect(cx - 15, cy - 75, 10, 12);
            ctx.fillRect(cx + 5, cy - 75, 10, 12);
            // Näbbar
            ctx.fillStyle = '#DAA520';
            ctx.fillRect(cx - 13, cy - 68, 5, 3);
            ctx.fillRect(cx + 7, cy - 68, 5, 3);
            // Spelaren krymper i boet
            if (fadeT < 0.7) {
                this.drawMiniPlayer(ctx, cx, cy - 55, 1.5 - fadeT * 1.5);
            }
            // Stor örn
            this.drawMiniEagle(ctx, cx + 50, cy - 100, 3);
        }

        // Text
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        if (t > 0.5) ctx.fillText('Örnen tog dig till sitt bo...', cx, cy + 140);
    }

    // === BJÖRNEN: äter upp spelaren ===
    drawBearCutscene(ctx, cx, cy, t) {
        if (t < 0.4) {
            // Björnen jagar spelaren
            const chaseT = t / 0.4;
            const playerX = cx + 100 - chaseT * 80;
            const bearX = cx - 80 + chaseT * 80;
            this.drawMiniPlayer(ctx, playerX, cy, 2, 0);
            this.drawMiniBear(ctx, bearX, cy + 5, 2.5);
        } else if (t < 0.7) {
            // Björnen fångar spelaren
            const eatT = (t - 0.4) / 0.3;
            this.drawMiniBear(ctx, cx, cy + 5, 2.5 + eatT * 0.5);
            if (eatT < 0.5) {
                const shrink = 1 - eatT * 2;
                this.drawMiniPlayer(ctx, cx + 20, cy - 10, 2 * shrink, eatT * 2);
            }
        } else {
            // Björnen nöjd (stor mage)
            this.drawMiniBear(ctx, cx, cy + 5, 3);
            // Nöjd mun
            ctx.fillStyle = '#A0652A';
            ctx.beginPath();
            ctx.arc(cx + 25, cy + 8, 6, 0, Math.PI);
            ctx.fill();
        }

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        if (t > 0.5) ctx.fillText('Björnen åt upp dig!', cx, cy + 130);
    }

    // === YETIN: slår iväg spelaren som en projektil ===
    drawYetiCutscene(ctx, cx, cy, t) {
        if (t < 0.3) {
            // Yetin tar sats
            const windupT = t / 0.3;
            this.drawMiniPlayer(ctx, cx + 30, cy, 2);
            this.drawMiniYeti(ctx, cx - 60, cy, 3);
            // Yetins arm drar bakåt
            ctx.fillStyle = '#C0CCD5';
            ctx.fillRect(cx - 60 + 45, cy - 20 - windupT * 15, 12, 25);
        } else {
            // Spelaren flyger iväg som projektil
            const flyT = (t - 0.3) / 0.7;
            const px = cx + 30 + flyT * 500;
            const py = cy - flyT * 200 + flyT * flyT * 300;
            const pScale = Math.max(0.2, 2 - flyT * 2.5);
            const rot = flyT * 15;

            this.drawMiniYeti(ctx, cx - 60, cy, 3);

            // Fartlinjer
            ctx.strokeStyle = `rgba(255,255,255,${0.5 - flyT * 0.5})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(px - 30 - i * 20, py + i * 5);
                ctx.lineTo(px - 60 - i * 20, py + i * 5 + 3);
                ctx.stroke();
            }

            if (flyT < 0.8) {
                this.drawMiniPlayer(ctx, px, py, pScale, rot);
            } else {
                // Stjärna vid impact
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 30px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('💫', px > canvas.width ? canvas.width - 30 : px, py);
            }
        }

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        if (t > 0.4) ctx.fillText('Yetin slog iväg dig!', cx, cy + 130);
    }

    // === STENRAS: krossad av sten ===
    drawRockCutscene(ctx, cx, cy, t) {
        const groundY = cy + 30;

        if (t < 0.4) {
            // Spelaren ser stenen komma
            this.drawMiniPlayer(ctx, cx, groundY, 2);
            const rockY = cy - 200 + (t / 0.4) * 230;
            this.drawBigRock(ctx, cx, rockY, 40);
        } else if (t < 0.6) {
            // Impact
            const impactT = (t - 0.4) / 0.2;
            this.drawBigRock(ctx, cx, groundY, 40 + impactT * 5);
            // Partiklar
            ctx.fillStyle = '#888';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const dist = impactT * 50;
                ctx.fillRect(cx + Math.cos(angle) * dist, groundY + Math.sin(angle) * dist - 10, 5, 5);
            }
            // Skakeffekt
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 30px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('KRASCH!', cx + (Math.random() - 0.5) * 10, cy - 60);
        } else {
            // Stenen ligger kvar, spelaren borta
            this.drawBigRock(ctx, cx, groundY, 45);
            // Liten hand som sticker ut
            ctx.fillStyle = '#FFDAB9';
            ctx.fillRect(cx + 25, groundY + 10, 6, 10);
            // Fingrar
            ctx.fillRect(cx + 23, groundY + 8, 3, 4);
            ctx.fillRect(cx + 28, groundY + 8, 3, 4);
        }

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        if (t > 0.5) ctx.fillText('Krossad av en sten!', cx, cy + 130);
    }

    // === LAVA: brinner upp ===
    drawLavaCutscene(ctx, cx, cy, t) {
        const groundY = cy + 30;

        // Lava-yta
        ctx.fillStyle = '#CC3300';
        ctx.fillRect(cx - 100, groundY + 10, 200, 40);
        ctx.fillStyle = '#FF6600';
        for (let x = cx - 95; x < cx + 95; x += 8) {
            const wave = Math.sin((x + this.frame * 0.8) * 0.15) * 4;
            ctx.fillRect(x, groundY + 6 - wave, 6, 8);
        }
        // Gul glöd
        ctx.fillStyle = '#FFAA00';
        for (let i = 0; i < 5; i++) {
            const sx = cx - 60 + ((i * 37 + this.frame) % 120);
            ctx.fillRect(sx, groundY + 8, 4, 3);
        }

        if (t < 0.3) {
            // Spelaren sjunker ner
            const sinkT = t / 0.3;
            this.drawMiniPlayer(ctx, cx, groundY - 10 + sinkT * 20, 2 - sinkT * 0.5, sinkT * 0.3);
        } else if (t < 0.7) {
            // Brinner — eld och rök
            const burnT = (t - 0.3) / 0.4;
            const playerScale = Math.max(0, 1.5 - burnT * 2);
            if (playerScale > 0) {
                this.drawMiniPlayer(ctx, cx, groundY + 5, playerScale);
            }
            // Eldflammor
            for (let i = 0; i < 8; i++) {
                const fx = cx - 20 + Math.random() * 40;
                const fy = groundY - burnT * 30 - Math.random() * 30;
                const fSize = 3 + Math.random() * 6;
                ctx.fillStyle = Math.random() > 0.5 ? '#FF4400' : '#FFAA00';
                ctx.fillRect(fx, fy, fSize, fSize);
            }
        } else {
            // Bara rök kvar
            const smokeT = (t - 0.7) / 0.3;
            ctx.fillStyle = `rgba(100, 100, 100, ${0.6 - smokeT * 0.6})`;
            for (let i = 0; i < 5; i++) {
                const sx = cx - 15 + i * 8;
                const sy = groundY - 20 - smokeT * 60 - i * 10;
                ctx.beginPath();
                ctx.arc(sx, sy, 8 + smokeT * 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        if (t > 0.4) ctx.fillText('Du brann upp i lavan!', cx, cy + 130);
    }

    // === FALL: faller ner ===
    drawFallCutscene(ctx, cx, cy, t) {
        const fallDist = t * 400;
        const rot = t * 8;
        const scale = Math.max(0.3, 2 - t * 2);
        this.drawMiniPlayer(ctx, cx, cy - 100 + fallDist, scale, rot);

        // Fartlinjer
        ctx.strokeStyle = `rgba(255,255,255,${0.4 - t * 0.4})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const lx = cx - 30 + i * 20;
            ctx.beginPath();
            ctx.moveTo(lx, cy - 100 + fallDist - 40);
            ctx.lineTo(lx, cy - 100 + fallDist - 80);
            ctx.stroke();
        }

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        if (t > 0.4) ctx.fillText('Du föll!', cx, cy + 130);
    }

    // === Hjälp-ritfunktioner ===

    drawMiniEagle(ctx, x, y, s) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(s, s);
        // Vingar
        ctx.fillStyle = '#4A3828';
        ctx.beginPath();
        ctx.moveTo(-2, 0);
        ctx.lineTo(-18, -5 + Math.sin(this.frame * 0.2) * 4);
        ctx.lineTo(-10, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(18, -5 + Math.sin(this.frame * 0.2) * 4);
        ctx.lineTo(10, 3);
        ctx.fill();
        // Kropp
        ctx.fillStyle = '#3A2A1A';
        ctx.fillRect(-6, -3, 12, 8);
        // Huvud
        ctx.fillStyle = '#F5F0E0';
        ctx.fillRect(6, -5, 8, 7);
        // Näbb
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(14, -3, 4, 3);
        ctx.restore();
    }

    drawMiniBear(ctx, x, y, s) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(s, s);
        // Kropp
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-12, -5, 24, 16);
        // Huvud
        ctx.fillRect(10, -12, 12, 12);
        // Öron
        ctx.fillStyle = '#6B3310';
        ctx.fillRect(11, -15, 4, 4);
        ctx.fillRect(18, -15, 4, 4);
        // Ögon
        ctx.fillStyle = '#FFF';
        ctx.fillRect(17, -9, 3, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(18, -8, 1, 1);
        // Ben
        ctx.fillStyle = '#6B3310';
        ctx.fillRect(-10, 11, 5, 5);
        ctx.fillRect(-2, 11, 5, 5);
        ctx.fillRect(6, 11, 5, 5);
        ctx.fillRect(14, 11, 5, 5);
        ctx.restore();
    }

    drawMiniYeti(ctx, x, y, s) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(s, s);
        // Kropp
        ctx.fillStyle = '#D0D8E0';
        ctx.fillRect(-15, -8, 30, 22);
        // Huvud
        ctx.fillRect(-8, -22, 20, 16);
        // Ögon
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(2, -17, 4, 4);
        ctx.fillRect(8, -17, 4, 4);
        // Tänder
        ctx.fillStyle = '#FFF';
        ctx.fillRect(3, -9, 3, 3);
        ctx.fillRect(8, -9, 3, 3);
        // Ben
        ctx.fillStyle = '#B8C8D0';
        ctx.fillRect(-12, 14, 8, 8);
        ctx.fillRect(4, 14, 8, 8);
        ctx.restore();
    }

    drawBigRock(ctx, x, y, size) {
        ctx.fillStyle = '#777';
        ctx.beginPath();
        ctx.moveTo(x - size / 2 + 5, y - size / 2);
        ctx.lineTo(x + size / 2 - 3, y - size / 2 + 3);
        ctx.lineTo(x + size / 2, y + size / 2 - 5);
        ctx.lineTo(x - size / 2 + 3, y + size / 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x - size / 2 + 8, y - size / 2 + 2, size / 2, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x - size / 2 + 5, y + size / 2 - 5, size - 8, 3);
    }
}
