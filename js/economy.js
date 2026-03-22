// Ekonomisystem: pengar, rekord och upplåsning av karaktärer
// Sparas i localStorage så det finns kvar mellan sessioner

const SAVE_KEY = 'mountainExplorer_save';

const economy = {
    coins: 0,
    bestHeight: 0,
    unlockedCharacters: ['alfred', 'astrid', 'pappa'], // Gratis från start

    load() {
        try {
            const data = JSON.parse(localStorage.getItem(SAVE_KEY));
            if (data) {
                this.coins = data.coins || 0;
                this.bestHeight = data.bestHeight || 0;
                this.unlockedCharacters = data.unlockedCharacters || ['alfred', 'astrid', 'pappa'];
            }
        } catch (e) {
            // Om localStorage inte funkar, kör med defaults
        }
    },

    save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
                coins: this.coins,
                bestHeight: this.bestHeight,
                unlockedCharacters: this.unlockedCharacters
            }));
        } catch (e) {
            // Tyst fail om localStorage inte funkar
        }
    },

    // Anropas efter varje spelomgång med spelarens höjd
    processRun(height) {
        if (height > this.bestHeight) {
            // Nytt rekord! +10 kr
            this.coins += 10;
            this.bestHeight = height;
            this.save();
            return true; // Nytt rekord
        }
        return false;
    },

    canAfford(characterId) {
        const char = CHARACTERS[characterId];
        return char && char.cost && this.coins >= char.cost;
    },

    isUnlocked(characterId) {
        return this.unlockedCharacters.includes(characterId);
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
