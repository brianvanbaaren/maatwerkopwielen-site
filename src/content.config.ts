import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Alleen lange lopende tekst staat in Markdown, zodat de klant in het CMS
 * een echte tekstverwerker krijgt (vet, links, alinea's). Alle overige
 * inhoud staat in JSON en wordt gevalideerd in src/lib/content.ts.
 */
const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/pages" }),
  schema: z.object({
    heading: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    quote: z.string().optional(),
  }),
});

export const collections = { pages };
