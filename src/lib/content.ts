import { z } from "astro/zod";
import homeJson from "../content/home.json";
import siteJson from "../content/site.json";
import testimonialsJson from "../content/testimonials.json";

/**
 * Schema's over de CMS-inhoud. Ze doen twee dingen:
 *  1. typeveiligheid in de templates;
 *  2. een duidelijke, vroege fout wanneer iemand in het CMS een verplicht
 *     veld leegmaakt. De build faalt dan met een leesbare melding en de
 *     LIVE site blijft staan zoals hij was. Dat is bewust: liever een
 *     mislukte deploy dan een stukgelopen pagina.
 */

const iconSchema = z.string().min(1);

const homeSchema = z.object({
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  hero: z.object({
    image: z.string().optional().default(""),
    imageAlt: z.string().optional().default(""),
    titleLine1: z.string().min(1),
    titleLine2: z.string().optional().default(""),
    subtitle: z.string().optional().default(""),
    ctaLabel: z.string().min(1),
  }),
  usps: z
    .array(
      z.object({
        icon: iconSchema,
        title: z.string().min(1),
        text: z.string().optional().default(""),
      }),
    )
    .default([]),
  process: z.object({
    heading: z.string().min(1),
    steps: z
      .array(
        z.object({
          icon: iconSchema,
          step: z.string().min(1),
          desc: z.string().optional().default(""),
        }),
      )
      .default([]),
  }),
  reviews: z.object({
    heading: z.string().min(1),
  }),
  pricing: z.object({
    heading: z.string().min(1),
    priceLabel: z.string().optional().default(""),
    price: z.string().optional().default(""),
    priceNote: z.string().optional().default(""),
    faq: z
      .array(
        z.object({
          q: z.string().min(1),
          a: z.string().optional().default(""),
        }),
      )
      .default([]),
  }),
  contact: z.object({
    heading: z.string().min(1),
    text: z.string().optional().default(""),
  }),
});

const siteSchema = z.object({
  logo: z.string().optional().default(""),
  logoAlt: z.string().optional().default("Logo"),
  contact: z.object({
    whatsapp: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    email: z.string().optional().default(""),
  }),
  footer: z.object({
    text: z.string().optional().default(""),
  }),
});

const testimonialsSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        quote: z.string().min(1),
        image: z.string().optional().default(""),
      }),
    )
    .default([]),
});

function parse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  bestand: string,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Inhoud in ${bestand} is niet geldig. Vul in het CMS de volgende velden (opnieuw) in:\n${issues}`,
    );
  }
  return result.data;
}

export const home = parse(homeSchema, homeJson, "src/content/home.json");
export const site = parse(siteSchema, siteJson, "src/content/site.json");
export const testimonials = parse(
  testimonialsSchema,
  testimonialsJson,
  "src/content/testimonials.json",
).items;

/** Telefoonnummer/WhatsApp naar een bruikbare href, of null als leeg. */
export const contactLinks = {
  whatsapp: site.contact.whatsapp
    ? `https://wa.me/${site.contact.whatsapp.replace(/[^0-9]/g, "")}`
    : null,
  phone: site.contact.phone
    ? `tel:${site.contact.phone.replace(/[^0-9+]/g, "")}`
    : null,
  email: site.contact.email ? `mailto:${site.contact.email}` : null,
};
