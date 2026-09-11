# CMS – technische opzet

Voor wie de site onderhoudt. De handleiding voor de klant staat in
[HANDLEIDING-KLANT.md](./HANDLEIDING-KLANT.md).

## Hoe het werkt

Dit is een **git-based CMS**: er is geen database en geen server die kan omvallen.

```
klant opent /admin  →  wijzigt tekst of foto  →  klikt Opslaan
        ↓
Sveltia CMS schrijft een commit naar GitHub (branch main)
        ↓
de hosting ziet de commit, bouwt de Astro-site opnieuw
        ↓
1–2 minuten later staat de wijziging live
```

Gevolgen van die keuze:

- Geen maandkosten, geen updates van een CMS-server, geen inlog die gehackt kan
  worden: schrijfrechten lopen via GitHub.
- Elke wijziging is een commit, dus volledige historie en met één klik terug te
  draaien.
- Een wijziging staat **niet direct** live. Reken op 1–2 minuten build.

## Waar de inhoud staat

| Bestand | Wat erin staat |
| --- | --- |
| `src/content/home.json` | Hero, voordelen, stappenplan, tarief, FAQ, contactblok, SEO |
| `src/content/pages/over.md` | "Over Jasper" – kop, foto, quote en de lopende tekst (Markdown) |
| `src/content/testimonials.json` | De reviews |
| `src/content/site.json` | Logo, contactgegevens, footer |
| `src/assets/uploads/` | Alle afbeeldingen die via het CMS geüpload worden |

`src/lib/content.ts` valideert die bestanden met Zod. Maakt iemand een verplicht
veld leeg, dan **faalt de build met een leesbare melding en blijft de live site
staan zoals hij was**. Dat is bewust gekozen: liever een mislukte deploy dan een
stukgelopen pagina. Zet daarom wel build-notificaties aan bij je hosting,
anders blijft zo'n fout onopgemerkt.

Afbeeldingen staan in `src/assets/uploads` en niet in `public/`, zodat Astro ze
verkleint en naar webp omzet. De hero ging daardoor van 2,5 MB naar 148 kB.
`src/lib/images.ts` zet het CMS-pad om naar de geoptimaliseerde variant; staat
er een bestand niet, dan valt het `CmsImage`-component terug op een `fallback`-slot
in plaats van een kapotte afbeelding.

## Nog te doen: hosting met automatische rebuild

**Dit is de ontbrekende schakel.** In de repo zit nu geen hosting- of
CI-configuratie, dus een commit van de klant leidt nog nergens tot een nieuwe
build. Zonder deze stap werkt het CMS wel, maar verandert de live site niet.

Kies één van de drie; alle drie bouwen automatisch bij een push naar `main`:

| Hosting | Build command | Publish directory | Inloggen op /admin |
| --- | --- | --- | --- |
| Netlify | `npm run build` | `dist` | Ingebouwd, geen extra werk |
| Cloudflare Pages | `npm run build` | `dist` | Eigen auth-worker nodig |
| Vercel | `npm run build` | `dist` | Eigen auth-worker nodig |

## Inloggen op /admin

De klant heeft een **GitHub-account met schrijfrechten op deze repo** nodig
(Settings → Collaborators → Add people). Dat is de belangrijkste horde van deze
opzet: een git-based CMS zonder GitHub-account bestaat niet. Drie manieren:

1. **Netlify hosting (eenvoudigst).** Zet in Netlify onder
   *Site configuration → Access control → OAuth* GitHub als provider. Daarna
   werkt "Sign In with GitHub" zonder verdere configuratie: de standaard
   `base_url` van het CMS wijst al naar Netlify.
2. **Eigen auth-proxy (elke hosting).** Maak een GitHub OAuth App en deploy
   [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) als
   Cloudflare Worker. Zet de URL daarvan in `public/admin/config.yml` bij
   `base_url` (staat er als commentaar klaar).
3. **Access token (snelste om te testen).** De klant maakt een fine-grained
   personal access token met `Contents: read and write` op deze repo en kiest
   "Sign In Using Access Token". Geen proxy nodig, maar je laat een
   niet-technische gebruiker met een token rommelen — doe dit alleen tijdelijk.

### Zelf redigeren zonder inloggen

```bash
npm install
npm run dev
```

Ga naar <http://localhost:4321/admin/> en klik **Work with Local Repository**
(werkt in Chrome en Edge). Je bewerkt dan de bestanden op je eigen schijf; daarna
zelf committen.

## Een veld toevoegen

Drie plekken, altijd in deze volgorde:

1. `public/admin/config.yml` – het veld voor de klant (label en hint in het
   Nederlands, `required: false` als het leeg mag zijn).
2. `src/lib/content.ts` – het veld in het Zod-schema.
3. `src/pages/index.astro` of `src/layouts/BaseLayout.astro` – het veld gebruiken.

Vergeet je stap 2, dan faalt de build met een typefout. Dat is de bedoeling.

## Onderhoud

- De CMS-bundle staat vast op de versie in `package.json` en wordt door
  `npm run cms:sync` (draait automatisch bij `dev` en `build`) uit
  `node_modules` naar `public/admin/` gekopieerd. Geen externe CDN, dus een
  upgrade is een bewuste `npm update @sveltia/cms` plus een testronde.
- De beheeromgeving laadt haar icoontjes wel van Google Fonts (Material
  Symbols). Zonder internet zie je tekst in plaats van icoontjes.
- `/admin` is `noindex`, maar publiek bereikbaar. Dat is geen probleem: lezen
  kan iedereen toch al via de site, en schrijven vereist GitHub-rechten.
- Sveltia CMS is Decap-CMS-compatibel. Mocht je ooit willen wisselen, dan blijft
  dezelfde `config.yml` werken.
