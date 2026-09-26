# D&D - Cercasi avventurieri

Piccola pagina pubblica per prenotare uno dei cinque personaggi disponibili per una partita introduttiva di Dungeons & Dragons.

## Personaggi
- Guerriero
- Paladino
- Ladro
- Mago
- Chierico

## Architettura
- GitHub Pages: interfaccia pubblica
- HTML/CSS/JavaScript: frontend
- Google Apps Script: API minima
- Google Sheet: stato condiviso delle prenotazioni

## Google Sheet
Creare un foglio chiamato `Prenotazioni` con:

| personaggio | giocatore |
|---|---|
| Guerriero | |
| Paladino | |
| Ladro | |
| Mago | |
| Chierico | |

## Collegamento Apps Script
1. Dal Google Sheet aprire **Estensioni > Apps Script**.
2. Copiare il contenuto di `apps-script/Code.gs`.
3. Distribuire come **Web app**.
4. Esecuzione: **come proprietario**.
5. Accesso: consentire l'accesso necessario ai giocatori tramite link.
6. Copiare l'URL della Web App.
7. Inserirlo in `js/app.js` nella proprietà `CONFIG.apiUrl`.

## Immagini
Aggiungere le locandine in:
- `images/guerriero.png`
- `images/paladino.png`
- `images/ladro.png`
- `images/mago.png`
- `images/chierico.png`

## GitHub Pages
Pubblicare il branch `main` dalla cartella root tramite **Settings > Pages**.
