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

## Live zetten en testen

Zolang dit niet staat, is er geen plek waar de klant het CMS kan gebruiken: de
editor werkt dan wel lokaal, maar een wijziging komt nergens terecht. Er staat
een `netlify.toml` in de repo, dus Netlify leest de bouwinstellingen zelf.
Netlify is hier de aanrader om één reden: het regelt de GitHub-login voor
`/admin` zonder dat je zelf een auth-proxy moet draaien.

Reken op een half uur, eenmalig.

1. **Repo koppelen.** Netlify → *Add new site* → *Import an existing project* →
   GitHub → deze repo → branch `main`. Build command en publish directory komen
   uit `netlify.toml`; niets in te vullen. Deploy.
2. **Controleer de site.** Open het `*.netlify.app`-adres. De homepage moet er
   staan zoals hij hoort.
3. **GitHub OAuth App maken.** GitHub → *Settings* → *Developer settings* →
   *OAuth Apps* → *New OAuth App*. Homepage URL: je Netlify-adres. Authorization
   callback URL: `https://api.netlify.com/auth/done`. Bewaar de Client ID en
   genereer een Client Secret.
4. **Provider in Netlify zetten.** Netlify → *Site configuration* →
   *Access control* → *OAuth* → *Install provider* → GitHub, en vul de Client ID
   en Secret in. Hierna werkt "Sign In with GitHub" op `/admin`; de
   `base_url` in `config.yml` hoeft niet aangepast te worden.
5. **De klant toegang geven.** GitHub → repo → *Settings* → *Collaborators* →
   *Add people*. De klant heeft een GitHub-account met schrijfrechten nodig;
   dat is inherent aan een git-based CMS.
6. **Zelf de hele keten testen.** Ga naar `https://<jouw-site>/admin/`, log in,
   verander de ondertitel in de hero, klik *Save*. Er hoort nu een commit op
   `main` te staan, Netlify hoort te gaan bouwen en na één tot twee minuten
   hoort de nieuwe tekst op de homepage te staan. Werkt dit, dan werkt het CMS.
7. **Build-notificaties aanzetten.** Netlify → *Notifications* →
   *Deploy failed* → e-mail naar jezelf. Nodig, want bij een leeggemaakt
   verplicht veld faalt de build met opzet en verandert de live site niet. Zonder
   melding blijft dat onopgemerkt en snapt de klant niet waarom hij niets ziet.
8. **Eigen domein.** Netlify → *Domain management*, zodra het domein bekend is.
   Zet daarna ook `site_url` in `public/admin/config.yml`, dan werkt de knop
   "Bekijk site" in de beheeromgeving.

### Andere hosting

Cloudflare Pages en Vercel werken net zo goed en bouwen ook bij elke push
(build command `npm run build`, output directory `dist`). Daar heb je stap 3 en 4
niet, maar moet je in plaats daarvan zelf een OAuth-proxy draaien: maak een
GitHub OAuth App en deploy
[`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) als Cloudflare
Worker, en zet de URL daarvan als `base_url` onder `backend` in
`public/admin/config.yml` (staat er als commentaar klaar).

Snel iets willen proberen zonder dat alles staat? De klant kan op `/admin`
kiezen voor "Sign In Using Access Token" met een fine-grained personal access
token dat `Contents: read and write` op deze repo heeft. Geen proxy nodig, maar
je laat een niet-technische gebruiker met een token werken — alleen tijdelijk.

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
