# Mountain Explorer

## Om projektet

Ett 2D-klättringsspel som Daniel bygger tillsammans med sin son. Lärprojekt — koden ska vara lättförståelig. Inga ramverk, inga beroenden.

**Live:** https://dlindbom.github.io/mountain-explorer/
**GitHub:** https://github.com/dlindbom/mountain-explorer

## Spelkoncept

Sidovy av ett berg. Spelaren klättrar uppåt genom att:
- **Hoppa** mellan klippavsatser (naturliga utsprång på bergväggen)
- **Klättra stegar** för att nå avsatser som är för höga att hoppa till
- **Springa över broar** (träbroar som spänner hela bredden)
- **Undvika spikar** — vassa spikar på vissa avsatser, dödar vid landning
- **Fly björnar** — en björn spawnar var 100:e meter och jagar spelaren

Spelet är **endless** — ingen topp, klättra så högt du kan. Svårigheten ökar gradvis.

## Tech stack

- **HTML5 Canvas** (800×600) — all rendering
- **Vanilla JavaScript** — klasser, ingen bundler
- **CSS** — minimal sidlayout
- **GitHub Pages** — hosting (legacy deploy från `main`)

Öppna `index.html` i webbläsaren — inget mer krävs.

## Filstruktur

```
mountain-explorer/
├── index.html              # Laddar scripts i rätt ordning
├── css/style.css            # Sidlayout, touch-action, responsiv canvas
├── js/
│   ├── utils.js             # Delade hjälpfunktioner (roundRect)
│   ├── input.js             # Tangentbord + touch-hantering, keys-objekt
│   ├── background.js        # Himmel, avlägsna berg, klippväggar
│   ├── level.js             # Level-klass: procedural generering (data, ingen rendering)
│   ├── levelRenderer.js     # drawLevel() + alla draw-funktioner för klippmassa/ytor/broar/stegar/spikar
│   ├── player.js            # Player-klass: rörelse, hopp, klättring, spik-kollision
│   ├── bear.js              # Bear-klass: jagar spelaren på sin plattform
│   ├── ui.js                # drawUI(), drawDeathScreen(), drawTouchControls()
│   └── game.js              # Huvudloop, kamera, björn-spawning, spelstate-koordinator
├── assets/                  # (tomt — allt ritas med Canvas)
└── CLAUDE.md
```

**Script-laddningsordning** (viktigt — klasser måste finnas innan de används):
`utils → input → background → level → levelRenderer → player → bear → ui → game`

## Nyckelklasser och ansvar

### `Player` (player.js)
- Fysik: gravitation, hopp (`jumpForce=-10.5`), hastighet (`speed=4.5`)
- States: normal (gå/hoppa) och climbing (på stege)
- `update(keys, platforms, ladders)` — huvuduppdatering
- `hitSpikes` — sätts true vid landning på spikzon (kollision i plattformsloopen)
- `isNearLadder(ladder)` — avgör om klättring kan påbörjas
- `draw()` har separata `drawNormal()` och `drawClimbing()` metoder

### `Level` (level.js) — BARA DATA, ingen rendering
- Genererar **sektioner**: 2–3 klippavsatser (samma sida) + en bro ovanför
- Avsatser alternerar vänster/höger mellan sektioner
- ~70% av hoppen är hoppbara (55–85px gap), ~30% kräver stege (135–160px)
- Stegar placeras automatiskt vid stora gap
- Spikar: `spikeStart` + `spikeWidth` properties på plattformar
- `update(playerY)` — genererar nya plattformar uppåt, rensar gamla nedåt

### Level-rendering (levelRenderer.js)
- `drawLevel(ctx, level, cameraY, canvasHeight)` — huvudfunktion, anropas från game.js
- **Tvåpass-rendering**: först klippmassa (drawRockBody), sen ytor (drawLedgeSurface)
- Standalone-funktioner (inte klassmetoder): drawRockBody, drawLedgeSurface, drawBridge, drawSpikes, drawLadder

### `Bear` (bear.js)
- Spawnas var 100:e meter på spelarens plattform
- Patrullerar sin plattform (`platformX`, `platformWidth`)
- `speed=2.8` (långsammare än spelaren)
- Kan inte klättra stegar eller hoppa

### Bakgrund (background.js)
- `drawBackground(ctx, canvas, cameraY)` — himmel, parallax-berg, klippväggar
- `drawCliffFace(ctx, canvas, side, cameraY)` — jagged klippkanter med stentextur

### Input (input.js)
- `keys` — globalt objekt som läses av Player och game.js
- `setupInput(canvas, getGameState, getStateTimer, restartFn)` — kopplar events
- `touchButtons` — knapp-state för touch-rendering i ui.js

### UI (ui.js)
- `drawUI(ctx, canvas, player, bearWarning, gameState)` — höjdmätare, starthjälp, björnvarning
- `drawDeathScreen(ctx, canvas, stateTimer, deathCause, player)` — dödsoverlay
- `drawTouchControls(ctx)` — touch-knappar (använder globala `touchButtons` från input.js)

### `game.js` — koordinator
- **Kamera**: smooth follow (`cameraY += (target - cameraY) * 0.08`)
- **Björn-spawning**: `nextBearHeight` ökar med 100 varje gång
- **Dödsorsaker**: spikar, björn, fallit för långt (500px under lastGroundY)
- Anropar alla andra modulers draw/update-funktioner i rätt ordning

## Koordinatsystem

- Canvas: y=0 är toppen, y ökar neråt
- Spelaren startar vid y≈528 (groundY=560 minus spelarens höjd)
- Klättring = y minskar. Höjd i meter: `(startY - y) / 10`
- Kamera-offset: `cameraY` subtraheras vid rendering

## Viktigt att veta

- **Script-laddningsordning**: utils → input → background → level → levelRenderer → player → bear → ui → game
- **Cache-busting**: `?v=N` på alla script/CSS-taggar i index.html — öka N vid varje push
- **Touch vs tangentbord**: touch-knappen ↑ mappar till `ArrowUp` (inte Space), så den fungerar för både hopp och klättring
- **Spike-kollision**: hanteras i `Player.updateNormal()` vid plattformslandning, INTE som separat check
- **Plattformstyper**: `ground` (startmark), `ledge` (klippavsats med fromWall), `bridge` (träbro, hela bredden)

## Regler

- Koden ska vara lättförståelig — detta är ett lärprojekt
- Kommentera på svenska där det hjälper
- Inga externa beroenden
- Bumpa `?v=N` i index.html vid ändringar som ska synas direkt
- Testa på både dator och iPad (touch)
