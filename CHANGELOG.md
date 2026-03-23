# Changelog — Mountain Explorer

## 2026-03-23

### Nya features

- **Karaktärsval som karusell**: 3 stora kort visas åt gången med Astrid, Alfred och Alice synliga direkt. Pilar vänster/höger för att bläddra till övriga karaktärer. Prickar visar position i listan.

- **Språkval (svenska/engelska)**: Flaggor uppe till höger på karaktärsvalet. All speltext översatt — menyer, HUD, cutscener, powerups, dödsorsaker. Sparas i localStorage.

- **Intro-cutscene**: Visas när man startar en bana. Berg reser sig, bergnamn och höjd fadear in, motiverande citat, "KLÄTTRA!"-text. Kan skippas efter 1 sekund. Hoppas över vid restart.

- **Affär**: Nås via guldknappen "AFFÄR" på karaktärsvalet. Första varan: Permanent Vinterjacka (1000 kr) — ger snöstormsimmunitet och rött sken runt gubben. Köp sparas i localStorage.

- **Stackbara föremål**: Slagträ, vattenhink och jacka kan nu samlas flera av. En förbrukas per användning. HUD visar antal (t.ex. "SLAGTRÄ x3").

### Balansändringar

- **Guldhögar**: Ger nu 20 kr (var 10). Spawnar mer sällan (~15% chans istället för ~17%).
- **Alla karaktärer**: Dubbel HP (bas 200, var 100). Pappa 300, Alvis 220, Bob 150.
- **Medkit**: Helar 100 HP (var 50) för att matcha ny HP-skala.
- **Yeti**: Gör 100 fast skada och försvinner efter en träff (var 75% av max HP, stannade kvar).
- **Lava**: Gör 30 skada (var 40, 25% reduktion).
- **Vattenhink**: Släcker nu lavan permanent — förvandlas till stelnad sten med ångeffekt.
- **100 kr vid klarad bana**: Redan implementerat sedan tidigare, verifierat att det fungerar.

### Buggfixar

- **Cutscene-frys (intro + vinst)**: Lokal variabel `const t` skuggade globala översättningsfunktionen `t()`, vilket kraschade spel-loopen med TypeError. Bytt till `const fade`.
- **Touch-input på cutscener**: Lade till `ArrowUp` (hoppknappen) som dismiss-tangent för alla cutscener. Lade till touch-dismiss för döds-cutscene i touchend-handler.
- **deathType-reset**: `deathType` och `deathCause` nollställs nu mellan spel för att undvika stale state.

### Tekniskt

- Ny fil: `js/lang.js` — översättningssystem med `t(key, params)` funktion
- Ny fil: `js/introCutscene.js` — IntroCutscene-klass
- Ny fil: `js/shop.js` — affärsskärm med SHOP_ITEMS, köplogik, UI
- `js/economy.js` utökad med `purchasedUpgrades[]`, `hasUpgrade()`, `buyUpgrade()`
- `js/player.js` utökad med `permanentWarmJacket` flagga och glöd-rendering
- Cache-version bumpades från v=27 till v=36
