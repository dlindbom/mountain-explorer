// Affär: köp permanenta uppgraderingar med intjänade pengar

const SHOP_ITEMS = [
    {
        id: 'permanentWarmJacket',
        cost: 1000,
    }
];

// Layout
const SHOP_CARD_W = 280;
const SHOP_CARD_H = 300;
const SHOP_CARD_Y = 120;
const SHOP_BACK_W = 120;
const SHOP_BACK_H = 34;
const SHOP_BACK_X = (800 - SHOP_BACK_W) / 2;
const SHOP_BACK_Y = 555;

function drawShop(ctx, canvas) {
    // Bakgrund
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1a2a4a');
    grad.addColorStop(1, '#2a3a5a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Berg-silhuett
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(200, 200);
    ctx.lineTo(400, 100);
    ctx.lineTo(600, 180);
    ctx.lineTo(800, canvas.height);
    ctx.fill();

    // Titel
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t('shop_title'), canvas.width / 2, 45);

    // Pengar
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, canvas.width / 2 - 80, 58, 160, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`💰 ${coinLabel(economy.coins)}`, canvas.width / 2, 77);

    // Rita föremål
    for (let i = 0; i < SHOP_ITEMS.length; i++) {
        const item = SHOP_ITEMS[i];
        const x = canvas.width / 2 - SHOP_CARD_W / 2;
        const y = SHOP_CARD_Y + i * (SHOP_CARD_H + 20);
        const owned = economy.hasUpgrade(item.id);
        drawShopItemCard(ctx, x, y, SHOP_CARD_W, SHOP_CARD_H, item, owned);
    }

    // Tillbaka-knapp
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, SHOP_BACK_X, SHOP_BACK_Y, SHOP_BACK_W, SHOP_BACK_H, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, SHOP_BACK_X, SHOP_BACK_Y, SHOP_BACK_W, SHOP_BACK_H, 8);
    ctx.stroke();
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t('shop_back'), canvas.width / 2, SHOP_BACK_Y + 22);
}

function drawShopItemCard(ctx, x, y, w, h, item, owned) {
    // Kortbakgrund
    ctx.fillStyle = owned ? 'rgba(80, 200, 80, 0.1)' : 'rgba(255,255,255,0.08)';
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();

    ctx.strokeStyle = owned ? 'rgba(80, 200, 80, 0.4)' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 12);
    ctx.stroke();

    // Ikon
    drawShopJacketIcon(ctx, x + w / 2 - 30, y + 20);

    // Namn
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t('shop_jacket_name'), x + w / 2, y + 140);

    // Beskrivning
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '13px monospace';
    ctx.fillText(t('shop_jacket_desc'), x + w / 2, y + 165);

    // Rött sken-förhandsvisning
    ctx.fillStyle = 'rgba(200, 60, 30, 0.15)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 75, 40, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    if (owned) {
        // Köpt-badge
        ctx.fillStyle = 'rgba(80, 200, 80, 0.2)';
        roundRect(ctx, x + w / 2 - 50, y + h - 60, 100, 36, 8);
        ctx.fill();
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(t('shop_bought'), x + w / 2, y + h - 36);
    } else {
        // Köp-knapp
        const canBuy = economy.coins >= item.cost;
        ctx.fillStyle = canBuy ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.05)';
        roundRect(ctx, x + w / 2 - 70, y + h - 60, 140, 36, 8);
        ctx.fill();
        ctx.strokeStyle = canBuy ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        roundRect(ctx, x + w / 2 - 70, y + h - 60, 140, 36, 8);
        ctx.stroke();

        ctx.fillStyle = canBuy ? '#FFD700' : 'rgba(255,255,255,0.3)';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(t('shop_buy', { cost: item.cost }), x + w / 2, y + h - 36);
    }
}

function drawShopJacketIcon(ctx, x, y) {
    const s = 3.5; // Skala (större än powerup-ikonen)

    // Jacka (puffer-stil)
    ctx.fillStyle = '#CC4400';
    // Kropp
    ctx.fillRect(x + 3 * s, y + 5 * s, 14 * s, 13 * s);
    // Ärmar
    ctx.fillRect(x, y + 6 * s, 5 * s, 10 * s);
    ctx.fillRect(x + 15 * s, y + 6 * s, 5 * s, 10 * s);
    // Päls-krage
    ctx.fillStyle = '#F5E6D0';
    ctx.fillRect(x + 3 * s, y + 3 * s, 14 * s, 4 * s);
    ctx.fillRect(x + 5 * s, y + 1 * s, 10 * s, 3 * s);
    // Dragkedja
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 9 * s, y + 7 * s, 2 * s, 10 * s);
    // Knapp
    ctx.fillRect(x + 8 * s, y + 9 * s, 4 * s, 2 * s);
    // Snöflinga
    ctx.fillStyle = '#FFF';
    ctx.font = `${Math.round(8 * s)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('❄', x + 10 * s, y + 1 * s);
}

// Hantera klick i affären
function getShopClick(canvasX, canvasY) {
    // Tillbaka-knapp
    if (canvasX >= SHOP_BACK_X && canvasX <= SHOP_BACK_X + SHOP_BACK_W &&
        canvasY >= SHOP_BACK_Y && canvasY <= SHOP_BACK_Y + SHOP_BACK_H) {
        return 'back';
    }

    // Kolla item-kort
    for (let i = 0; i < SHOP_ITEMS.length; i++) {
        const item = SHOP_ITEMS[i];
        const x = 800 / 2 - SHOP_CARD_W / 2;
        const y = SHOP_CARD_Y + i * (SHOP_CARD_H + 20);

        if (canvasX >= x && canvasX <= x + SHOP_CARD_W &&
            canvasY >= y && canvasY <= y + SHOP_CARD_H) {
            // Försök köpa
            economy.buyUpgrade(item.id, item.cost);
            return null; // Stanna i affären
        }
    }
    return null;
}
