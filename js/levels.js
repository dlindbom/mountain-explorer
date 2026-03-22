// Bansystem: 11 riktiga berg att bestiga

const MOUNTAINS = [
    { id: 'kebnekaise',  name: 'Kebnekaise',   country: 'Sverige',       height: 2097 },
    { id: 'olympus',     name: 'Mount Olympus', country: 'Grekland',      height: 2917 },
    { id: 'fuji',        name: 'Mount Fuji',    country: 'Japan',         height: 3776 },
    { id: 'rainier',     name: 'Mount Rainier', country: 'USA',           height: 4392 },
    { id: 'montblanc',   name: 'Mont Blanc',    country: 'Frankrike',     height: 4808 },
    { id: 'kenya',       name: 'Mount Kenya',   country: 'Kenya',         height: 5199 },
    { id: 'kilimanjaro', name: 'Kilimanjaro',   country: 'Tanzania',      height: 5895 },
    { id: 'denali',      name: 'Denali',        country: 'Alaska, USA',   height: 6190 },
    { id: 'aconcagua',   name: 'Aconcagua',     country: 'Argentina',     height: 6961 },
    { id: 'k2',          name: 'K2',            country: 'Pakistan/Kina', height: 8611 },
    { id: 'everest',     name: 'Mount Everest', country: 'Nepal/Kina',    height: 8849 },
];

const LEVEL_SAVE_KEY = 'mountainExplorer_levels';

const levelProgress = {
    currentLevel: 0,
    completedLevels: [],

    load() {
        try {
            const data = JSON.parse(localStorage.getItem(LEVEL_SAVE_KEY));
            if (data) {
                this.currentLevel = data.currentLevel || 0;
                this.completedLevels = data.completedLevels || [];
            }
        } catch (e) {}
    },

    save() {
        try {
            localStorage.setItem(LEVEL_SAVE_KEY, JSON.stringify({
                currentLevel: this.currentLevel,
                completedLevels: this.completedLevels
            }));
        } catch (e) {}
    },

    getCurrentMountain() {
        return MOUNTAINS[this.currentLevel] || MOUNTAINS[MOUNTAINS.length - 1];
    },

    getTargetHeight() {
        return this.getCurrentMountain().height;
    },

    isCompleted(levelIndex) {
        return this.completedLevels.includes(levelIndex);
    },

    completeCurrentLevel() {
        if (!this.completedLevels.includes(this.currentLevel)) {
            this.completedLevels.push(this.currentLevel);
            economy.coins += 100;
            economy.save();
        }
        if (this.currentLevel < MOUNTAINS.length - 1) {
            this.currentLevel++;
        }
        this.save();
    },

    selectLevel(index) {
        // Kan bara välja klarade banor eller nästa ej klarade
        if (index <= this.getHighestUnlocked()) {
            this.currentLevel = index;
            this.save();
        }
    },

    getHighestUnlocked() {
        // Kan spela alla klarade + nästa
        let highest = 0;
        for (let i = 0; i < MOUNTAINS.length; i++) {
            if (this.completedLevels.includes(i)) {
                highest = Math.max(highest, i + 1);
            }
        }
        return Math.min(highest, MOUNTAINS.length - 1);
    },

    reset() {
        this.currentLevel = 0;
        this.completedLevels = [];
        this.save();
    }
};

levelProgress.load();

// Rita banväljare
function drawLevelSelect(ctx, canvas) {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1a2a4a');
    grad.addColorStop(1, '#2a3a5a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Berg-silhuett
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let i = 0; i < MOUNTAINS.length; i++) {
        const x = 50 + i * 70;
        const h = (MOUNTAINS[i].height / 8849) * 350;
        ctx.lineTo(x, canvas.height - 50 - h);
        ctx.lineTo(x + 35, canvas.height - 50 - h + 20);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    // Titel
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Välj berg', canvas.width / 2, 40);

    ctx.fillStyle = '#FFD700';
    ctx.font = '13px monospace';
    ctx.fillText(`💰 ${economy.coins} kr`, canvas.width / 2, 60);

    // Banrutor
    const cols = 4;
    const boxW = 170;
    const boxH = 95;
    const gapX = 15;
    const gapY = 12;
    const startX = (canvas.width - (cols * boxW + (cols - 1) * gapX)) / 2;
    const startY = 80;

    const highestUnlocked = levelProgress.getHighestUnlocked();

    for (let i = 0; i < MOUNTAINS.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (boxW + gapX);
        const y = startY + row * (boxH + gapY);

        const mountain = MOUNTAINS[i];
        const unlocked = i <= highestUnlocked;
        const completed = levelProgress.isCompleted(i);
        const isCurrent = i === levelProgress.currentLevel;

        // Bakgrund
        if (isCurrent) {
            ctx.fillStyle = 'rgba(100, 180, 255, 0.15)';
        } else if (completed) {
            ctx.fillStyle = 'rgba(80, 200, 80, 0.1)';
        } else {
            ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.3)';
        }
        roundRect(ctx, x, y, boxW, boxH, 8);
        ctx.fill();

        // Kant
        ctx.strokeStyle = isCurrent ? 'rgba(100, 180, 255, 0.5)' :
                          completed ? 'rgba(80, 200, 80, 0.3)' :
                          'rgba(255,255,255,0.1)';
        ctx.lineWidth = isCurrent ? 2 : 1;
        roundRect(ctx, x, y, boxW, boxH, 8);
        ctx.stroke();

        // Bannummer
        ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${i + 1}.`, x + 8, y + 16);

        // Bergnamn
        ctx.fillStyle = unlocked ? '#FFF' : 'rgba(255,255,255,0.25)';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(mountain.name, x + 22, y + 16);

        // Land
        ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
        ctx.font = '10px monospace';
        ctx.fillText(mountain.country, x + 22, y + 30);

        // Höjd
        ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${mountain.height} m`, x + boxW - 8, y + 16);

        // Status
        if (completed) {
            ctx.fillStyle = '#4CAF50';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('KLARAD ✓', x + boxW / 2, y + boxH - 10);
        } else if (!unlocked) {
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.font = '11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('🔒', x + boxW / 2, y + boxH - 10);
        }

        // Mini-höjdbar
        if (unlocked) {
            const barX = x + 8;
            const barY = y + 50;
            const barW = boxW - 16;
            const barH = 6;

            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(barX, barY, barW, barH);

            if (completed) {
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(barX, barY, barW, barH);
            }

            // Bergets höjd som liten triangel
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.moveTo(barX, barY + barH);
            ctx.lineTo(barX + barW / 2, barY - 8);
            ctx.lineTo(barX + barW, barY + barH);
            ctx.fill();
        }
    }

    // Instruktioner
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    if (isTouchDevice) {
        ctx.fillText('Tryck på ett berg för att spela', canvas.width / 2, canvas.height - 15);
    } else {
        ctx.fillText('Klicka på ett berg eller tryck Escape för att gå tillbaka', canvas.width / 2, canvas.height - 15);
    }
}

// Kolla klick på banväljaren
function getSelectedLevel(canvasX, canvasY) {
    const cols = 4;
    const boxW = 170;
    const boxH = 95;
    const gapX = 15;
    const gapY = 12;
    const startX = (800 - (cols * boxW + (cols - 1) * gapX)) / 2;
    const startY = 80;
    const highestUnlocked = levelProgress.getHighestUnlocked();

    for (let i = 0; i < MOUNTAINS.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (boxW + gapX);
        const y = startY + row * (boxH + gapY);

        if (canvasX >= x && canvasX <= x + boxW &&
            canvasY >= y && canvasY <= y + boxH) {
            if (i <= highestUnlocked) return i;
            return null;
        }
    }
    return null;
}

// Rita ban-HUD under spelet (höger sida)
function drawLevelHUD(ctx, canvas, playerHeight) {
    const mountain = levelProgress.getCurrentMountain();
    const targetHeight = mountain.height;
    const progress = Math.min(1, playerHeight / targetHeight);

    // Panel på höger sida
    const panelX = canvas.width - 45;
    const panelY = 80;
    const panelH = 200;
    const barW = 14;

    // Bakgrund
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, panelX - 18, panelY - 25, 55, panelH + 60, 8);
    ctx.fill();

    // Bergnamn (vertikalt - förkortat)
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    const shortName = mountain.name.length > 10 ? mountain.name.substring(0, 9) + '.' : mountain.name;
    ctx.fillText(shortName, panelX, panelY - 10);

    // Vertikal progressbar
    const barX = panelX - barW / 2;

    // Tom bar
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(barX, panelY, barW, panelH);

    // Fylld del (nerifrån och upp)
    const fillH = panelH * progress;
    const barColor = progress >= 1 ? '#4CAF50' : progress > 0.7 ? '#FFD700' : '#5BA3D9';
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, panelY + panelH - fillH, barW, fillH);

    // Berg-triangel i bakgrunden
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.moveTo(barX, panelY + panelH);
    ctx.lineTo(panelX, panelY);
    ctx.lineTo(barX + barW, panelY + panelH);
    ctx.fill();

    // Snötopp-markering
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(barX + 2, panelY, barW - 4, 3);

    // Höjdmål
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${targetHeight}m`, panelX, panelY + panelH + 14);

    // Procent
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${Math.floor(progress * 100)}%`, panelX, panelY + panelH + 28);

    // "TOPPEN!" vid mål
    if (progress >= 1) {
        const pulse = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
        ctx.fillStyle = `rgba(76, 175, 80, ${pulse})`;
        ctx.font = 'bold 10px monospace';
        ctx.fillText('TOPP!', panelX, panelY + panelH + 42);
    }
}
