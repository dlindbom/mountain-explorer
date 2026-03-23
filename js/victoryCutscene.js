// Vinst-cutscene: visas när man klarar en bana

class VictoryCutscene {
    constructor(mountain, playerColors) {
        this.mountain = mountain;
        this.colors = playerColors;
        this.frame = 0;
        this.canContinue = false;
        this.confetti = [];

        // Skapa konfetti
        for (let i = 0; i < 40; i++) {
            this.confetti.push({
                x: 100 + Math.random() * 600,
                y: -20 - Math.random() * 300,
                vx: (Math.random() - 0.5) * 2,
                vy: 1 + Math.random() * 2,
                size: 3 + Math.random() * 5,
                color: ['#FFD700', '#FF6347', '#4CAF50', '#2196F3', '#FF69B4', '#FFF'][Math.floor(Math.random() * 6)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }

    update() {
        this.frame++;
        if (this.frame >= 180) { // 3 sekunder
            this.canContinue = true;
        }

        // Konfetti-fysik
        for (const c of this.confetti) {
            c.x += c.vx;
            c.y += c.vy;
            c.vy += 0.02;
            c.vx += Math.sin(c.y * 0.02) * 0.05;
            c.rotation += c.rotSpeed;
        }
    }

    draw(ctx, canvas) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const fade = Math.min(1, this.frame / 60); // Fade in 0→1

        // Mörk bakgrund med grön ton
        ctx.fillStyle = 'rgba(10, 30, 20, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stjärnhimmel
        ctx.fillStyle = `rgba(255, 255, 255, ${fade * 0.6})`;
        for (let i = 0; i < 30; i++) {
            ctx.fillRect((i * 97 + 30) % 780 + 10, (i * 61 + 20) % 250 + 10, 1 + i % 2, 1 + i % 2);
        }

        // Berg-silhuett
        const mountainY = cy + 40;
        ctx.fillStyle = `rgba(60, 70, 80, ${fade})`;
        ctx.beginPath();
        ctx.moveTo(100, canvas.height);
        ctx.lineTo(100, mountainY + 80);
        ctx.lineTo(250, mountainY + 20);
        ctx.lineTo(350, mountainY - 30);
        ctx.lineTo(cx, mountainY - 100); // Toppen
        ctx.lineTo(cx + 50, mountainY - 80);
        ctx.lineTo(550, mountainY - 20);
        ctx.lineTo(650, mountainY + 30);
        ctx.lineTo(700, mountainY + 80);
        ctx.lineTo(700, canvas.height);
        ctx.fill();

        // Snötäckt topp
        ctx.fillStyle = `rgba(220, 230, 240, ${fade})`;
        ctx.beginPath();
        ctx.moveTo(cx - 80, mountainY - 50);
        ctx.lineTo(cx - 30, mountainY - 85);
        ctx.lineTo(cx, mountainY - 100);
        ctx.lineTo(cx + 30, mountainY - 85);
        ctx.lineTo(cx + 60, mountainY - 55);
        ctx.fill();

        // Flaggstång på toppen
        const flagPoleX = cx;
        const flagPoleY = mountainY - 100;
        ctx.fillStyle = `rgba(139, 69, 19, ${fade})`;
        ctx.fillRect(flagPoleX - 1, flagPoleY - 55, 3, 55);

        // Flagga (vajar)
        const wave = Math.sin(this.frame * 0.05) * 3;
        ctx.fillStyle = `rgba(230, 57, 70, ${fade})`;
        ctx.beginPath();
        ctx.moveTo(flagPoleX + 2, flagPoleY - 55);
        ctx.lineTo(flagPoleX + 35, flagPoleY - 45 + wave);
        ctx.lineTo(flagPoleX + 2, flagPoleY - 35);
        ctx.fill();

        // Liten gubbe på toppen
        if (fade > 0.3) {
            const playerAlpha = Math.min(1, (fade - 0.3) / 0.3);
            ctx.globalAlpha = playerAlpha;
            this.drawMiniPlayer(ctx, flagPoleX - 15, flagPoleY - 10);
            ctx.globalAlpha = 1;
        }

        // Grattis-text
        if (fade > 0.5) {
            const textAlpha = Math.min(1, (fade - 0.5) / 0.3);
            ctx.globalAlpha = textAlpha;

            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 34px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(t('congrats'), cx, 80);

            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 20px monospace';
            ctx.fillText(t('you_climbed'), cx, 120);
            ctx.fillStyle = '#5BA3D9';
            ctx.font = 'bold 24px monospace';
            ctx.fillText(this.mountain.name, cx, 150);

            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '16px monospace';
            ctx.fillText(`${this.mountain.height} m · ${getMountainCountry(this.mountain.id)}`, cx, 178);

            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 16px monospace';
            ctx.fillText(t('reward'), cx, 210);

            ctx.globalAlpha = 1;
        }

        // Konfetti
        for (const c of this.confetti) {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotation);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
            ctx.restore();
        }

        // Fortsätt-text
        if (this.canContinue) {
            const blink = Math.sin(this.frame * 0.08) > 0;
            if (blink) {
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                if (isTouchDevice) {
                    ctx.fillText(t('touch_continue'), cx, canvas.height - 30);
                } else {
                    ctx.fillText(t('key_continue'), cx, canvas.height - 30);
                }
            }
        }
    }

    drawMiniPlayer(ctx, x, y) {
        const c = this.colors;
        // Ben
        ctx.fillStyle = c.pants;
        ctx.fillRect(x + 4, y + 24, 7, 8);
        ctx.fillRect(x + 13, y + 24, 7, 8);
        // Kängor
        ctx.fillStyle = '#5C4033';
        ctx.fillRect(x + 3, y + 30, 9, 3);
        ctx.fillRect(x + 12, y + 30, 9, 3);
        // Kropp
        ctx.fillStyle = c.jacket;
        ctx.fillRect(x + 3, y + 12, 18, 13);
        // Armar upp (firar!)
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(x - 2, y + 2, 5, 12);
        ctx.fillRect(x + 21, y + 2, 5, 12);
        // Huvud
        ctx.fillStyle = '#FFDAB9';
        ctx.fillRect(x + 5, y + 3, 14, 11);
        // Mössa
        ctx.fillStyle = c.hat;
        ctx.fillRect(x + 4, y, 16, 6);
        // Ögon (glada!)
        ctx.fillStyle = '#1D3557';
        ctx.fillRect(x + 8, y + 7, 2, 2);
        ctx.fillRect(x + 14, y + 7, 2, 2);
        // Stort leende
        ctx.fillStyle = '#C1666B';
        ctx.fillRect(x + 9, y + 11, 6, 2);
    }
}
