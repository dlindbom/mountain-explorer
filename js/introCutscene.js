// Intro-cutscene: peppar spelaren innan banan börjar

class IntroCutscene {
    constructor(mountain, playerColors) {
        this.mountain = mountain;
        this.colors = playerColors;
        this.frame = 0;
        this.canSkip = false;
        this.done = false;
        this.quote = getRandomQuote();
        this.totalDuration = 240; // 4 sekunder

        // Stjärnor i bakgrunden
        this.stars = [];
        for (let i = 0; i < 25; i++) {
            this.stars.push({
                x: 50 + Math.random() * 700,
                y: 20 + Math.random() * 200,
                size: 1 + Math.random(),
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    update() {
        this.frame++;
        if (this.frame >= 60) { // Kan skippa efter 1 sek
            this.canSkip = true;
        }
        if (this.frame >= this.totalDuration) {
            this.done = true;
        }
    }

    draw(ctx, canvas) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const t = Math.min(1, this.frame / 60); // Fade-in 0→1

        // Bakgrund: mörk himmel → gryning
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        const dawnProgress = Math.min(1, this.frame / this.totalDuration);
        grad.addColorStop(0, this.lerpColor('#0a1628', '#1a3050', dawnProgress));
        grad.addColorStop(0.6, this.lerpColor('#0d1f3c', '#2a4a6a', dawnProgress));
        grad.addColorStop(1, this.lerpColor('#1a2a4a', '#3a5a3a', dawnProgress));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stjärnor (fadear ut med gryningen)
        const starAlpha = Math.max(0, 1 - dawnProgress * 1.5) * t;
        for (const star of this.stars) {
            const twinkle = 0.5 + Math.sin(star.twinkle + this.frame * 0.03) * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha * twinkle})`;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }

        // Berg-silhuett (växer upp)
        const mountainRise = Math.min(1, this.frame / 90); // Tar 1.5 sek att resa sig
        const baseY = canvas.height;
        const peakY = 140;
        const mountainHeight = (baseY - peakY) * mountainRise;

        // Bakgrundsbergen
        ctx.fillStyle = `rgba(40, 50, 65, ${t * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        ctx.lineTo(80, baseY - mountainHeight * 0.5);
        ctx.lineTo(180, baseY - mountainHeight * 0.7);
        ctx.lineTo(280, baseY - mountainHeight * 0.4);
        ctx.lineTo(350, baseY);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(450, baseY);
        ctx.lineTo(520, baseY - mountainHeight * 0.5);
        ctx.lineTo(620, baseY - mountainHeight * 0.65);
        ctx.lineTo(720, baseY - mountainHeight * 0.45);
        ctx.lineTo(800, baseY);
        ctx.fill();

        // Huvudberget (centrerat, störst)
        ctx.fillStyle = `rgba(55, 65, 80, ${t})`;
        ctx.beginPath();
        ctx.moveTo(150, baseY);
        ctx.lineTo(250, baseY - mountainHeight * 0.6);
        ctx.lineTo(340, baseY - mountainHeight * 0.85);
        ctx.lineTo(cx, baseY - mountainHeight); // Toppen
        ctx.lineTo(cx + 60, baseY - mountainHeight * 0.9);
        ctx.lineTo(550, baseY - mountainHeight * 0.65);
        ctx.lineTo(650, baseY);
        ctx.fill();

        // Snötäckt topp
        if (mountainRise > 0.7) {
            const snowAlpha = Math.min(1, (mountainRise - 0.7) / 0.3) * t;
            ctx.fillStyle = `rgba(220, 235, 245, ${snowAlpha})`;
            ctx.beginPath();
            ctx.moveTo(cx - 60, baseY - mountainHeight * 0.88);
            ctx.lineTo(cx - 20, baseY - mountainHeight * 0.96);
            ctx.lineTo(cx, baseY - mountainHeight);
            ctx.lineTo(cx + 30, baseY - mountainHeight * 0.94);
            ctx.lineTo(cx + 50, baseY - mountainHeight * 0.9);
            ctx.fill();
        }

        // Spelaren vid foten av berget
        if (this.frame > 40) {
            const playerAlpha = Math.min(1, (this.frame - 40) / 30);
            ctx.globalAlpha = playerAlpha;
            const playerX = cx - 80;
            const playerY = baseY - 50;
            this.drawMiniClimber(ctx, playerX, playerY);

            // Spelaren tittar uppåt (pil)
            if (this.frame > 80 && this.frame < 200) {
                const arrowBob = Math.sin(this.frame * 0.08) * 3;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.beginPath();
                ctx.moveTo(playerX + 12, playerY - 30 + arrowBob);
                ctx.lineTo(playerX + 6, playerY - 20 + arrowBob);
                ctx.lineTo(playerX + 18, playerY - 20 + arrowBob);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        // Bergnamn (fadear in)
        if (this.frame > 30) {
            const textAlpha = Math.min(1, (this.frame - 30) / 40);
            ctx.globalAlpha = textAlpha;

            // "Dags att bestiga"
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '18px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(t('intro_time_to_climb'), cx, 60);

            // Bergnamn (stort)
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 36px monospace';
            ctx.fillText(this.mountain.name, cx, 100);

            // Land + höjd
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '16px monospace';
            const country = getMountainCountry(this.mountain.id);
            ctx.fillText(`${country} · ${this.mountain.height} m`, cx, 130);

            ctx.globalAlpha = 1;
        }

        // Motiverande citat (fadear in lite senare)
        if (this.frame > 80) {
            const quoteAlpha = Math.min(1, (this.frame - 80) / 40);
            ctx.globalAlpha = quoteAlpha;

            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.quote, cx, 175);

            // Höjdmål
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '14px monospace';
            ctx.fillText(t('intro_height', { height: this.mountain.height }), cx, 200);

            ctx.globalAlpha = 1;
        }

        // "KLÄTTRA!" (pulserar)
        if (this.frame > 140) {
            const goAlpha = Math.min(1, (this.frame - 140) / 30);
            const pulse = 1 + Math.sin(this.frame * 0.1) * 0.08;
            ctx.globalAlpha = goAlpha;

            ctx.save();
            ctx.translate(cx, 250);
            ctx.scale(pulse, pulse);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 40px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(t('intro_go'), 0, 0);
            ctx.restore();

            ctx.globalAlpha = 1;
        }

        // Skippa-instruktion
        if (this.canSkip) {
            const blink = Math.sin(this.frame * 0.08) > 0;
            if (blink) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                if (isTouchDevice) {
                    ctx.fillText(t('intro_skip_touch'), cx, canvas.height - 20);
                } else {
                    ctx.fillText(t('intro_skip_key'), cx, canvas.height - 20);
                }
            }
        }
    }

    drawMiniClimber(ctx, x, y) {
        const c = this.colors;
        const s = 1.8;
        // Ben
        ctx.fillStyle = c.pants;
        ctx.fillRect(x + 4 * s, y + 24 * s, 7 * s, 8 * s);
        ctx.fillRect(x + 13 * s, y + 24 * s, 7 * s, 8 * s);
        // Kängor
        ctx.fillStyle = '#5C4033';
        ctx.fillRect(x + 3 * s, y + 30 * s, 9 * s, 3 * s);
        ctx.fillRect(x + 12 * s, y + 30 * s, 9 * s, 3 * s);
        // Kropp
        ctx.fillStyle = c.jacket;
        ctx.fillRect(x + 3 * s, y + 12 * s, 18 * s, 13 * s);
        // Ryggsäck
        ctx.fillStyle = c.backpack;
        ctx.fillRect(x + 18 * s, y + 13 * s, 6 * s, 10 * s);
        // Huvud
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(x + 5 * s, y + 3 * s, 14 * s, 11 * s);
        // Mössa
        ctx.fillStyle = c.hat;
        ctx.fillRect(x + 4 * s, y, 16 * s, 6 * s);
        ctx.fillRect(x + 7 * s, y - 2 * s, 10 * s, 3 * s);
        // Ögon (tittar uppåt)
        ctx.fillStyle = '#1D3557';
        ctx.fillRect(x + 10 * s, y + 5 * s, 2 * s, 2 * s);
        ctx.fillRect(x + 16 * s, y + 5 * s, 2 * s, 2 * s);
        // Leende
        ctx.fillStyle = '#C1666B';
        ctx.fillRect(x + 12 * s, y + 11 * s, 4 * s, 1 * s);
    }

    // Hjälpfunktion: linjär interpolering mellan två hex-färger
    lerpColor(hex1, hex2, t) {
        const r1 = parseInt(hex1.substring(1, 3), 16);
        const g1 = parseInt(hex1.substring(3, 5), 16);
        const b1 = parseInt(hex1.substring(5, 7), 16);
        const r2 = parseInt(hex2.substring(1, 3), 16);
        const g2 = parseInt(hex2.substring(3, 5), 16);
        const b2 = parseInt(hex2.substring(5, 7), 16);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }
}
