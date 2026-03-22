# Mountain Explorer

## Om projektet

Ett spelbygge som Daniel gör tillsammans med sin son. Projektet handlar lika mycket om att lära sig spelbygge tillsammans som om slutresultatet.

## Spelkoncept

- **Genre:** 2D-plattformare / klättringsspel
- **Perspektiv:** Sidovy
- **Mål:** Klättra uppför ett berg
- **Vy:** Spelaren ser berget från sidan och navigerar uppåt

## Tech stack

- **HTML5 Canvas** — renderingsyta för spelet
- **Vanilla JavaScript** — spellogik (ingen ramverk, för maximal lärbarhet)
- **CSS** — grundläggande sidlayout

Inga byggverktyg, inga beroenden — öppna `index.html` i webbläsaren och spela.

## Status

**Fas:** Uppstart

## Projektstruktur

```
mountain-explorer/
├── index.html          # Huvudsida
├── css/
│   └── style.css       # Styling
├── js/
│   ├── game.js         # Spelloop och huvudlogik
│   ├── player.js       # Spelarkaraktär
│   └── level.js        # Bandesign och plattformar
├── assets/
│   └── (bilder, ljud)  # Spelresurser
└── CLAUDE.md           # Projektdokumentation
```

## Regler

- Koden ska vara lättförståelig — detta är ett lärprojekt
- Kommentera gärna på svenska där det hjälper förståelsen
- Små steg framåt, testa ofta
- Inga externa beroenden — allt ska funka genom att öppna index.html
