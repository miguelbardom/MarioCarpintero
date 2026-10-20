// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// [PENDIENTE: dominio definitivo] Sustituir por https://[DOMINIO] cuando se decida.
const SITE = 'https://www.example.com';

// Mantener sincronizado con `languages` y `defaultLang` en src/i18n/ui.ts.
const LOCALES = ['en', 'es'];
const DEFAULT_LOCALE = 'en';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  i18n: {
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    routing: {
      prefixDefaultLocale: true,
      // La raíz (/) la resuelve src/pages/index.astro con una redirección estática.
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      // La raíz solo redirige al idioma por defecto: no se indexa.
      filter: (page) => page !== `${SITE}/`,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
