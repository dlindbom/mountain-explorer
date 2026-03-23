// Språksystem: svenska och engelska
// Sparar språkval i localStorage

const LANG_KEY = 'mountainExplorer_lang';
let currentLang = 'sv';

function loadLanguage() {
    try {
        const saved = localStorage.getItem(LANG_KEY);
        if (saved === 'en' || saved === 'sv') currentLang = saved;
    } catch (e) {}
}

function setLanguage(lang) {
    currentLang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
}

function t(key, params) {
    let str = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ||
              (TRANSLATIONS.sv && TRANSLATIONS.sv[key]) || key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            str = str.replace('{' + k + '}', v);
        }
    }
    return str;
}

const TRANSLATIONS = {
    sv: {
        // === Karaktärsval ===
        'menu_title': 'Mountain Explorer',
        'choose_character': 'Välj din karaktär',
        'record': 'Rekord',
        'buy': 'KÖP {cost} kr',
        'touch_choose': 'Tryck på en karaktär för att börja',
        'click_choose': 'Klicka på en karaktär eller använd pilarna',

        // === Karaktärsbeskrivningar ===
        'char_alfred_desc': 'Hoppar 30% högre',
        'char_astrid_desc': 'Springer 50% snabbare',
        'char_pappa_desc': 'Tål 50% mer skada',
        'char_jeff_desc': 'Hoppar högt + springer snabbt',
        'char_alvis_desc': 'Dubbla pengar, pytteliten!',
        'char_bob_desc': 'Hoppar 27m högre, 75 HP',
        'char_mamma_desc': 'Gips+krycka, permanent slagträ',
        'char_alice_desc': 'Volthopp, 50% längre!',

        // === Banväljare ===
        'choose_mountain': 'Välj berg',
        'completed': 'KLARAD ✓',
        'touch_mountain': 'Tryck på ett berg för att spela',
        'click_mountain': 'Klicka på ett berg eller tryck Escape för att gå tillbaka',
        'summit': 'TOPP!',

        // === Spel-HUD ===
        'best': 'Bäst: {height} m',
        'help_touch': '← → Röra sig   ↑ Hoppa & Klättra',
        'help_desktop': '← → Röra sig   ↑ Hoppa/Klättra   Mellanslag = Hoppa',
        'help_instruction': 'Hoppa på klippavsatserna och klättra stegarna!',

        // === Varningar ===
        'warn_bear': 'BJÖRN!',
        'warn_yeti': 'YETI!',
        'warn_eagle': 'ÖRN!',
        'warn_smack': 'SMACK!',

        // === Dödsorsaker ===
        'death_lava': 'Lava!',
        'death_bear': 'Björnen tog dig!',
        'death_yeti': 'Yetin krossade dig!',
        'death_rock': 'Stenras!',
        'death_fall': 'Du föll!',
        'death_eagle': 'Örnen tog dig!',
        'death_spikes': 'Spikar!',

        // === Döds-cutscene ===
        'height_reached': 'Höjd: {height} m',
        'new_record': 'NYTT REKORD! +{earned} kr',
        'touch_retry': 'Tryck för att försöka igen',
        'key_retry': 'Mellanslag = försök igen',
        'key_change': 'Escape = byt karaktär',
        'cutscene_eagle': 'Örnen tog dig till sitt bo...',
        'cutscene_bear': 'Björnen åt upp dig!',
        'cutscene_yeti': 'Yetin slog iväg dig!',
        'cutscene_rock_crash': 'KRASCH!',
        'cutscene_rock': 'Krossad av en sten!',
        'cutscene_lava': 'Du brann upp i lavan!',
        'cutscene_fall': 'Du föll!',

        // === Vinst-cutscene ===
        'congrats': 'GRATTIS!',
        'you_climbed': 'Du har bestigit',
        'reward': '+100 kr',
        'touch_continue': 'Tryck för att fortsätta',
        'key_continue': 'Tryck mellanslag för att fortsätta',

        // === Powerups ===
        'powerup_rocket': 'RAKETSTÖVLAR',
        'powerup_bat': '🏏 SLAGTRÄ',
        'powerup_water': '🪣 VATTEN',
        'powerup_jacket': '🧥 JACKA',

        // === Intro-cutscene ===
        'intro_time_to_climb': 'Dags att bestiga',
        'intro_height': '{height} meter till toppen!',
        'intro_go': 'KLÄTTRA!',
        'intro_skip_touch': 'Tryck för att börja',
        'intro_skip_key': 'Tryck mellanslag för att börja',

        // === Motiverande citat ===
        'quote_1': 'Inga berg är för höga!',
        'quote_2': 'Upp mot skyarna!',
        'quote_3': 'Äventyret börjar nu!',
        'quote_4': 'Du klarar det!',
        'quote_5': 'Toppen väntar på dig!',

        // === Länder ===
        'country_kebnekaise': 'Sverige',
        'country_olympus': 'Grekland',
        'country_fuji': 'Japan',
        'country_rainier': 'USA',
        'country_montblanc': 'Frankrike',
        'country_kenya': 'Kenya',
        'country_kilimanjaro': 'Tanzania',
        'country_denali': 'Alaska, USA',
        'country_aconcagua': 'Argentina',
        'country_k2': 'Pakistan/Kina',
        'country_everest': 'Nepal/Kina',
    },

    en: {
        // === Character select ===
        'menu_title': 'Mountain Explorer',
        'choose_character': 'Choose your character',
        'record': 'Record',
        'buy': 'BUY {cost} coins',
        'touch_choose': 'Tap a character to start',
        'click_choose': 'Click a character or use the arrows',

        // === Character descriptions ===
        'char_alfred_desc': 'Jumps 30% higher',
        'char_astrid_desc': 'Runs 50% faster',
        'char_pappa_desc': 'Takes 50% more damage',
        'char_jeff_desc': 'High jumps + fast runner',
        'char_alvis_desc': 'Double coins, tiny!',
        'char_bob_desc': 'Jumps 27m higher, 75 HP',
        'char_mamma_desc': 'Cast+crutch, permanent bat',
        'char_alice_desc': 'Vault jump, 50% longer!',

        // === Level select ===
        'choose_mountain': 'Choose mountain',
        'completed': 'COMPLETED ✓',
        'touch_mountain': 'Tap a mountain to play',
        'click_mountain': 'Click a mountain or press Escape to go back',
        'summit': 'TOP!',

        // === Game HUD ===
        'best': 'Best: {height} m',
        'help_touch': '← → Move   ↑ Jump & Climb',
        'help_desktop': '← → Move   ↑ Jump/Climb   Space = Jump',
        'help_instruction': 'Jump on ledges and climb the ladders!',

        // === Warnings ===
        'warn_bear': 'BEAR!',
        'warn_yeti': 'YETI!',
        'warn_eagle': 'EAGLE!',
        'warn_smack': 'SMACK!',

        // === Death causes ===
        'death_lava': 'Lava!',
        'death_bear': 'The bear got you!',
        'death_yeti': 'The yeti crushed you!',
        'death_rock': 'Rockfall!',
        'death_fall': 'You fell!',
        'death_eagle': 'The eagle got you!',
        'death_spikes': 'Spikes!',

        // === Death cutscene ===
        'height_reached': 'Height: {height} m',
        'new_record': 'NEW RECORD! +{earned} coins',
        'touch_retry': 'Tap to try again',
        'key_retry': 'Space = try again',
        'key_change': 'Escape = change character',
        'cutscene_eagle': 'The eagle took you to its nest...',
        'cutscene_bear': 'The bear ate you!',
        'cutscene_yeti': 'The yeti knocked you away!',
        'cutscene_rock_crash': 'CRASH!',
        'cutscene_rock': 'Crushed by a rock!',
        'cutscene_lava': 'You burned up in the lava!',
        'cutscene_fall': 'You fell!',

        // === Victory cutscene ===
        'congrats': 'CONGRATULATIONS!',
        'you_climbed': 'You have climbed',
        'reward': '+100 coins',
        'touch_continue': 'Tap to continue',
        'key_continue': 'Press space to continue',

        // === Powerups ===
        'powerup_rocket': 'ROCKET BOOTS',
        'powerup_bat': '🏏 BAT',
        'powerup_water': '🪣 WATER',
        'powerup_jacket': '🧥 JACKET',

        // === Intro cutscene ===
        'intro_time_to_climb': 'Time to climb',
        'intro_height': '{height} meters to the top!',
        'intro_go': 'CLIMB!',
        'intro_skip_touch': 'Tap to start',
        'intro_skip_key': 'Press space to start',

        // === Motivational quotes ===
        'quote_1': 'No mountain is too high!',
        'quote_2': 'Up to the skies!',
        'quote_3': 'The adventure begins now!',
        'quote_4': 'You can do it!',
        'quote_5': 'The summit awaits you!',

        // === Countries ===
        'country_kebnekaise': 'Sweden',
        'country_olympus': 'Greece',
        'country_fuji': 'Japan',
        'country_rainier': 'USA',
        'country_montblanc': 'France',
        'country_kenya': 'Kenya',
        'country_kilimanjaro': 'Tanzania',
        'country_denali': 'Alaska, USA',
        'country_aconcagua': 'Argentina',
        'country_k2': 'Pakistan/China',
        'country_everest': 'Nepal/China',
    }
};

// Hämta ett slumpmässigt motiverande citat
function getRandomQuote() {
    const num = Math.floor(Math.random() * 5) + 1;
    return t('quote_' + num);
}

// Hämta översatt land för ett berg
function getMountainCountry(mountainId) {
    return t('country_' + mountainId);
}

// Valutaenhet
function coinLabel(amount) {
    return currentLang === 'en' ? amount + ' coins' : amount + ' kr';
}

loadLanguage();
