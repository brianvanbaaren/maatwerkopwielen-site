<!-- README.md -->
# Maatwerk op Wielen – Auto-makelaar

Onafhankelijk, persoonlijk en transparant advies bij het kopen of verkopen van uw auto.

## Ontwikkelen

```bash
npm install
npm run dev          # lokaal, inclusief CMS op /admin
npm run build        # productie-build
npm run preview      # de productie-build bekijken
```

## Inhoud aanpassen

De teksten en afbeeldingen staan niet in de templates, maar in `src/content/`.
De site-eigenaar past die aan via het CMS op `/admin`.

- Handleiding voor de klant: [`docs/HANDLEIDING-KLANT.md`](docs/HANDLEIDING-KLANT.md)
- Technische opzet en installatie: [`docs/CMS-SETUP.md`](docs/CMS-SETUP.md)

## Waar je het kunt testen

Het CMS heeft hosting nodig die bouwt bij elke push. Er staat een
`netlify.toml` klaar; het stappenplan om de site live te zetten en de hele
keten te testen staat in [`docs/CMS-SETUP.md`](docs/CMS-SETUP.md#live-zetten-en-testen).

Lokaal, zonder hosting:

```bash
npm install
npm run dev
```

Open <http://localhost:4321/admin/> en kies **Work with Local Repository**
(Chrome of Edge). Je bewerkt dan de bestanden op je eigen schijf.
