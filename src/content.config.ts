import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/* ---------- Tipos auxiliares ---------- */

/** Texto neutro o traducido: `"Viena"` o `{ en: "Vienna", es: "Viena" }`. */
const localizado = z.union([
  z.string().min(1),
  z
    .object({ en: z.string().min(1).optional(), es: z.string().min(1).optional() })
    .refine((v) => v.en !== undefined || v.es !== undefined, {
      message: 'Indica al menos una versión (en o es).',
    }),
]);

/** Fecha y hora local de la sala, sin zona: "2026-11-21T19:30" (entre comillas en YAML). */
const fechaHoraLocal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Formato esperado: "AAAA-MM-DDTHH:MM" (hora local).');

/* ---------- Conciertos ---------- */

const conciertos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/conciertos' }),
  schema: z.object({
    fecha: fechaHoraLocal,
    /** Zona horaria IANA de la sala; sirve para separar próximos/pasados y para schema.org. */
    zonaHoraria: z.string().default('Europe/Madrid'),
    ciudad: localizado,
    /** Código ISO 3166-1 alfa-2 (ES, DE, GB…). El nombre se traduce automáticamente. */
    pais: z.string().regex(/^[A-Z]{2}$/, 'Código de país ISO de dos letras, p. ej. "ES".'),
    sala: localizado,
    rol: z.enum(['solista', 'camara', 'recital', 'orquesta', 'otro']),
    con: z.union([localizado, z.array(localizado)]).optional(),
    programa: z
      .array(z.object({ compositor: z.string().min(1), obra: localizado }))
      .default([]),
    entradas: z.url().optional(),
    agotado: z.boolean().default(false),
    cancelado: z.boolean().default(false),
    /** Notas breves por idioma (el cuerpo del .md no se usa). */
    notas: localizado.optional(),
  }),
});

/* ---------- Prensa ---------- */

const prensa = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/prensa' }),
  schema: z
    .object({
      /** Cita por código de idioma; puede incluir el original (de, fr…) y traducciones. */
      cita: z.record(z.string().regex(/^[a-z]{2}$/), z.string().min(1)),
      /** Idioma en que se publicó la crítica; debe existir en `cita`. */
      idiomaOriginal: z.string().regex(/^[a-z]{2}$/),
      medio: z.string().min(1),
      autor: z.string().optional(),
      fecha: z.coerce.date(),
      url: z.url().optional(),
      destacada: z.boolean().default(false),
    })
    .refine((v) => v.idiomaOriginal in v.cita, {
      message: '`cita` debe incluir el texto en `idiomaOriginal`.',
      path: ['cita'],
    }),
});

/* ---------- Bio ---------- */

const bio = defineCollection({
  // Una sola versión completa por idioma: en.md y es.md (el id de la entrada es el idioma).
  loader: glob({ pattern: '{en,es}.md', base: './src/content/bio' }),
  schema: z.object({
    /** Temporada a la que corresponde la bio, p. ej. "2026/27". */
    temporada: z.string().regex(/^\d{4}\/\d{2}$/, 'Formato esperado: "2026/27".'),
  }),
});

/* ---------- Media ---------- */

const video = z.object({
  tipo: z.literal('video'),
  plataforma: z.enum(['youtube', 'vimeo']),
  /** ID del vídeo en la plataforma (no la URL completa). */
  id: z.string().min(1),
  titulo: localizado,
  compositor: z.string().optional(),
  obra: localizado.optional(),
  fecha: z.coerce.date().optional(),
  destacado: z.boolean().default(false),
  orden: z.number().default(0),
});

const audio = z.object({
  tipo: z.literal('audio'),
  plataforma: z.enum(['spotify', 'apple-music', 'soundcloud', 'bandcamp', 'otra']),
  url: z.url(),
  titulo: localizado,
  compositor: z.string().optional(),
  obra: localizado.optional(),
  sello: z.string().optional(),
  fecha: z.coerce.date().optional(),
  destacado: z.boolean().default(false),
  orden: z.number().default(0),
});

const media = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/media' }),
  schema: z.discriminatedUnion('tipo', [video, audio]),
});

export const collections = { conciertos, prensa, bio, media };
