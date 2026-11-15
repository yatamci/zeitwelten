# Zeitwelten

Eine responsive, clientseitige Website mit vier synchronen Zeitsystemen:
- Standardzeit: 24 / 60 / 60
- Dreifach-Tag: 36 / 60 / 40
- Feinzeit: 36 / 48 / 50
- Zehner-Zeit: 30 / 60 / 48

Alle Systeme haben 86.400 Einheiten-Sekunden pro realem Tag. Die Umrechnung basiert auf dem Anteil der vergangenen realen Tageszeit.

## Lokal starten
Die Seite ist statisch und benötigt keinen Build-Schritt. `index.html` direkt öffnen oder lokal einen Server starten:

```bash
npx serve .
```

## GitHub & Vercel
1. Repository auf GitHub erstellen.
2. Alle Projektdateien in das Repository hochladen.
3. In Vercel **Add New → Project** wählen und das GitHub-Repository importieren.
4. Framework Preset: **Other**.
5. Build Command leer lassen; Output Directory `.` verwenden.
6. Deploy klicken.

## Projektstruktur
- `index.html` – Seitenstruktur
- `styles.css` – Glassmorphism-Design, responsive Layout und Themes
- `app.js` – Umrechnung, Live-Uhren und SVG-Zifferblätter
- `package.json` – Projektmetadaten und optionale Startskripte
- `vercel.json` – Vercel-Konfiguration
- `.gitignore` – ignorierte lokale Dateien

## Hinweis zur Anzeige
Die Zeiger sind proportional zur jeweiligen Uhr aufgebaut: Der Stundenzeiger durchläuft das Zifferblatt über den jeweiligen 12er- bzw. 10er-Zyklus; der Minutenzeiger eine Umdrehung pro Systemstunde; der Sekundenzeiger eine Umdrehung pro Systemminute. Die digitale Anzeige zeigt die jeweilige Stunde, Minute und Sekunde.
