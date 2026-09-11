import type { ImageMetadata } from "astro";

/**
 * Alle afbeeldingen die via het CMS geüpload kunnen worden staan in
 * src/assets/uploads, zodat Astro ze kan verkleinen en omzetten naar webp.
 * Een klant die een foto van 6 MB uit de telefoon uploadt, levert zo alsnog
 * een snelle pagina op.
 */
const bitmaps = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/uploads/**/*.{jpeg,JPEG,jpg,JPG,png,PNG,gif,GIF,webp,WEBP,avif,AVIF}",
  { eager: true },
);

/**
 * SVG's kunnen niet worden geoptimaliseerd en worden in Astro 5 als component
 * geïmporteerd. Wij hebben alleen de URL nodig, dus vragen we die expliciet op.
 */
const vectors = import.meta.glob<string>("/src/assets/uploads/**/*.{svg,SVG}", {
  eager: true,
  query: "?url",
  import: "default",
});

/**
 * Zet een pad uit het CMS om naar een bruikbare afbeelding.
 * - `/src/assets/uploads/foto.jpg` -> ImageMetadata (wordt geoptimaliseerd)
 * - `/src/assets/uploads/logo.svg` -> string (URL, ongewijzigd geserveerd)
 * - `/iets-in-public.jpg`          -> string (ongewijzigd geserveerd)
 * - leeg of onvindbaar             -> undefined (component toont fallback)
 */
export function resolveImage(
  path?: string | null,
): ImageMetadata | string | undefined {
  if (!path) return undefined;

  const candidates = [path];

  // Vangnet: als public_folder in het CMS ooit anders wordt ingesteld,
  // zoeken we alsnog op bestandsnaam binnen de uploads-map.
  const filename = path.split("/").pop();
  if (filename) candidates.push(`/src/assets/uploads/${filename}`);

  for (const key of candidates) {
    if (vectors[key]) return vectors[key];
    if (bitmaps[key]) return bitmaps[key].default;
  }

  // Absolute URL of een bestand dat nog in /public staat.
  if (path.startsWith("/") || path.startsWith("http")) return path;

  return undefined;
}
