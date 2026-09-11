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

> **Let op:** er is nog geen hosting ingericht die automatisch bouwt bij een
> push naar `main`. Zolang dat niet staat, schrijft het CMS wel commits maar
> verandert de live site niet. Zie `docs/CMS-SETUP.md`.
