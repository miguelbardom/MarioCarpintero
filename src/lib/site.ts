import { z } from 'astro/zod';
import datos from '../data/site.json';

/**
 * Valida src/data/site.json en tiempo de build.
 * Mientras falten datos reales se aceptan placeholders "[PENDIENTE: …]".
 */
const pendiente = z.string().startsWith('[PENDIENTE');
const email = z.union([z.email(), pendiente]);
const url = z.union([z.url(), pendiente]);
const traducido = z.object({ en: z.string().min(1), es: z.string().min(1) });

const siteSchema = z.object({
  nombre: z.string().min(1),
  profesion: traducido,
  email,
  introHome: traducido,
  redes: z.array(
    z.object({
      red: z.enum(['instagram', 'facebook', 'youtube', 'spotify', 'x', 'bluesky', 'linkedin', 'tiktok', 'otra']),
      url,
      etiqueta: z.string().optional(),
    }),
  ),
  management: z.array(
    z.object({
      territorio: traducido,
      agencia: z.string().min(1),
      contacto: z.string().optional(),
      email: email.optional(),
      web: url.optional(),
    }),
  ),
  instrumento: z
    .object({
      constructor: z.string().min(1),
      anio: z.string().min(1),
      cesion: z.string().optional(),
    })
    .optional(),
});

export type Site = z.infer<typeof siteSchema>;

export const site: Site = siteSchema.parse(datos);

/** true si el valor es un placeholder todavía sin rellenar. */
export function esPendiente(valor: string | undefined): boolean {
  return valor === undefined || valor.startsWith('[PENDIENTE');
}
