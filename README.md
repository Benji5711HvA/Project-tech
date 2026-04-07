# Collego

Collego is een job-matching platform voor volwassenen die op zoek zijn naar werk of zich willen oriënteren op een nieuwe baan. Gebruikers maken een account aan, vullen hun profiel in en krijgen vacatures te zien die passen bij hun voorkeuren.

## Wat kan het?

**Voor werkzoekenden**
- Account aanmaken en inloggen
- Profiel invullen (opleiding, vaardigheden, cv-upload)
- Vacatures bekijken, liken of skippen
- Vacatures filteren op salaris, locatie, uren, sector en opleidingsniveau
- Vacatures opslaan als favoriet

**Voor bedrijven**
- Bedrijfsprofiel aanmaken
- Vacatures toevoegen (met salarisadvies via Adzuna)
- Kandidaten bekijken en liken

Wanneer een werkzoekende én een bedrijf elkaar liken, is er een match.

## Tech stack

| Laag | Technologie |
|------|-------------|
| Frontend | HTML, CSS (PostCSS), Vanilla JS |
| Templating | EJS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Vacature-data | Adzuna API |
| Adres-autofill | Postcode.tech API |
| Uploads | Multer |
| Authenticatie | bcryptjs + express-session |

## Installatie

```bash
git clone https://github.com/Benji5711HvA/Project-tech.git
cd Project-tech
npm install
```

Zet het bijbehorende `.env` bestand in de root van het project:

```
URI=mongodb+srv://...
DB_NAME=collego
SESSION_SECRET=jouw-secret
ADZUNA_APP_ID=jouw-id
ADZUNA_APP_KEY=jouw-key
POSTCODE_API_TOKEN=jouw-token
```

CSS bouwen:

```bash
npm run build:css
```

Server starten:

```bash
npm start
```

Ontwikkelen (met live reload):

```bash
npm run dev
```

Ga naar `http://localhost:3000`

## Team

| Naam | Component |
|------|-----------|
| Benjamin Sadri Milani | Account, authenticatie & vacatures toevoegen |
| Sanna Khan Ghauri | Matching & filteren |
| Mehmet Yasa | Favorieten & homepage |