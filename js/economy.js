// Ekonomisystem: pengar, rekord och upplåsning av karaktärer
// Sparas i localStorage så det finns kvar mellan sessioner

const SAVE_KEY = 'mountainExplorer_save';

const economy = {
    coins: 0,
    bestHeight: 0,
    unlockedCharacters: ['alfred', 'astrid', 'pappa', 'mamma', 'alice'], // Gratis från start
    purchasedUpgrades: [], // Köpta uppgraderingar från affären

    // Karaktärer som alltid är gratis
    FREE_CHARACTERS: ['alfred', 'astrid', 'pappa', 'mamma', 'alice'],

    load() {
        try {
            const data = JSON.parse(localStorage.getItem(SAVE_KEY));
            if (data) {
                this.coins = data.coins || 0;
                this.bestHeight = data.bestHeight || 0;
                this.unlockedCharacters = data.unlockedCharacters || [];
                this.purchasedUpgrades = data.purchasedUpgrades || [];
            }
        } catch (e) {}
        // Se till att gratis-karaktärer alltid finns
        for (const id of this.FREE_CHARACTERS) {
            if (!this.unlockedCharacters.includes(id)) {
                this.unlockedCharacters.push(id);
            }
        }
    },

    save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
                coins: this.coins,
                bestHeight: this.bestHeight,
                unlockedCharacters: this.unlockedCharacters,
                purchasedUpgrades: this.purchasedUpgrades
            }));
        } catch (e) {
            // Tyst fail om localStorage inte funkar
        }
    },

    // Anropas efter varje spelomgång med spelarens höjd
    processRun(height, coinMultiplier) {
        const mult = coinMultiplier || 1;
        if (height > this.bestHeight) {
            this.coins += 10 * mult;
            this.bestHeight = height;
            this.save();
            return 10 * mult; // Returnera antal kr
        }
        return 0;
    },

    canAfford(characterId) {
        const char = CHARACTERS[characterId];
        return char && char.cost && this.coins >= char.cost;
    },

    isUnlocked(characterId) {
        return this.unlockedCharacters.includes(characterId);
    },

    // Affärs-uppgraderingar
    hasUpgrade(upgradeId) {
        return this.purchasedUpgrades.includes(upgradeId);
    },

    buyUpgrade(upgradeId, cost) {
        if (this.hasUpgrade(upgradeId)) return false;
        if (this.coins < cost) return false;
        this.coins -= cost;
        this.purchasedUpgrades.push(upgradeId);
        this.save();
        return true;
    },

    buyCharacter(characterId) {
        const char = CHARACTERS[characterId];
        if (!char || !char.cost) return false;
        if (this.isUnlocked(characterId)) return false;
        if (this.coins < char.cost) return false;

        this.coins -= char.cost;
        this.unlockedCharacters.push(characterId);
        this.save();
        return true;
    }
};

// Ladda sparad data direkt
economy.load();
