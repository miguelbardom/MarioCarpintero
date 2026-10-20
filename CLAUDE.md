# CLAUDE.md

## Proyecto

Web oficial de Mario Carpintero, violista profesional dedicado/a a la música clásica.
Público principal: programadores de festivales y temporadas, orquestas, agencias, prensa y público aficionado.
Prioridades: elegancia sobria, legibilidad, carga muy rápida y materiales oficiales (bio, fotos, prensa) fáciles de encontrar y descargar.

Secciones: Home · Bio · Schedule · Press · Media · Contact

## Stack

- **Astro 7** + TypeScript (modo estricto, `astro/tsconfigs/strict`)
- **Tailwind CSS 4** vía `@tailwindcss/vite` (sin `tailwind.config`; el tema se define con `@theme` en `src/styles/global.css`) + `@tailwindcss/typography` para textos largos (bio)
- **Content Collections** de Astro (loader `glob`) para todo el contenido editable. Zod 4: importar siempre `import { z } from 'astro/zod'` (el `z` de `astro:content` está obsoleto)
- `astro:assets` (`<Image />` / `<Picture />`) para imágenes
- **PhotoSwipe** para la galería (lightbox)
- **lite-youtube-embed** para vídeos (y equivalente ligero para Vimeo si hace falta)
- **Fontsource** (variables) para tipografías alojadas localmente: `@fontsource-variable/cormorant-garamond` (normal + `wght-italic.css`) e `@fontsource-variable/inter`, importadas en `Base.astro`
- `@astrojs/sitemap`
- Formulario de contacto: **[PENDIENTE: Formspree | Web3Forms]** (aún no implementado)

### Restricciones de stack

- **Salida 100% estática.** Sin adaptadores (Vercel, Netlify, Node…), sin SSR, sin funciones serverless ni edge.
- **Ninguna funcionalidad propia de un proveedor de hosting** (nada de Netlify Forms, optimización de imágenes de Vercel, etc.). El resultado de `npm run build` (`dist/`) debe poder servirse desde cualquier servidor estático (Caddy/Nginx en un VPS).
- Sin React, Vue ni otros frameworks de componentes salvo que se pida explícitamente. JavaScript en cliente solo donde sea imprescindible (galería, menú móvil).
- No añadir dependencias nuevas sin mencionarlo y justificarlo.
- Sin analíticas ni cookies de terceros salvo petición expresa. Los embeds externos (YouTube, Spotify…) se cargan solo al interactuar.

## Configuración clave

- `site` en `astro.config.mjs`: provisionalmente `https://www.example.com` — **[PENDIENTE: dominio definitivo]**.
- URLs con barra final (`trailingSlash: 'always'`, `build.format: 'directory'`). Mantener coherente en todos los enlaces internos: generarlos siempre con `localizePath()` (nunca escribir rutas a mano).
- **Bilingüe desde el inicio** con el enrutado i18n de Astro:
  - Idiomas: `en` y `es`. Idioma por defecto: `en` provisional — **[PENDIENTE: confirmar en | es]**. Si cambia, actualizar a la vez `DEFAULT_LOCALE` en `astro.config.mjs` y `defaultLang` en `src/i18n/ui.ts` (igual con la lista de idiomas: `LOCALES` ↔ `languages`).
  - `prefixDefaultLocale: true`: todas las páginas llevan prefijo `/en/...` y `/es/...`. La raíz `/` es `src/pages/index.astro`, una redirección estática (meta refresh, `noindex`) al idioma por defecto, excluida del sitemap.
  - **Slugs traducidos**: cada sección tiene su segmento por idioma en `routes` de `src/i18n/ui.ts` (`/en/schedule/` ↔ `/es/agenda/`, `/en/bio/` ↔ `/es/biografia/`, `/en/contact/` ↔ `/es/contacto/`…). Una sección nueva se añade ahí (y en `navItems` si va en el menú) y con un archivo en `pages/en/` y otro en `pages/es/`.
  - El selector de idioma y los `hreflang` usan la prop `route` (`RouteKey`) que recibe `Base.astro`; toda página de sección debe pasarla.
  - Textos de interfaz (menú, botones, etiquetas, títulos y meta descriptions de las páginas) en `ui` de `src/i18n/ui.ts`, con las mismas claves en `en` y `es`; nunca hardcodeados en componentes. Acceso con `useTranslations(lang)`.
  - El contenido de las colecciones tiene versión por idioma cuando aplique (bio, textos de prensa traducidos, notas de conciertos). Datos neutros (fechas, salas, obras) no se duplican.

## Estructura de carpetas

```
src/
├── content.config.ts      # esquemas Zod de las colecciones
├── content/
│   ├── conciertos/        # un .md por concierto: AAAA-MM-DD-ciudad.md
│   ├── prensa/            # citas de crítica
│   ├── bio/               # en.md y es.md (una sola versión por idioma)
│   └── media/             # vídeos y audios destacados
├── data/
│   └── site.json          # nombre, redes, emails, management, instrumento
├── lib/
│   └── site.ts            # valida site.json con Zod y exporta `site` tipado
├── i18n/
│   └── ui.ts              # idiomas, rutas por idioma, textos de interfaz y utilidades
├── assets/
│   └── fotos/             # imágenes optimizadas por Astro
├── components/            # Header, Footer, PageHeading y la página real de cada sección (HomePage, SectionPage…)
├── layouts/
│   └── Base.astro         # <head>, SEO, header, footer, selector de idioma
├── pages/
│   ├── index.astro        # redirección estática al idioma por defecto
│   ├── 404.astro          # bilingüe (un único 404.html para todo el sitio)
│   ├── en/                # envoltorios finos: solo pasan `lang` y `route`
│   └── es/
└── styles/
    └── global.css         # Tailwind, @theme (fuentes y paleta), estilos base
public/
└── presskit/              # descargables tal cual: fotos HD, bios PDF, rider
```

**Regla principal: todo el contenido editable vive en `src/content` o `src/data`.** Ningún texto, fecha, enlace o dato del artista hardcodeado en componentes o páginas. Añadir un concierto, una crítica o un disco debe consistir solo en crear un archivo.

**Páginas por idioma sin duplicar marcado:** los archivos de `src/pages/en/` y `src/pages/es/` solo importan un componente de `src/components/` y le pasan `lang` (y `route`). Toda la lógica y el marcado viven en el componente compartido.

## Modelo de contenido

Los esquemas viven en `src/content.config.ts`; ante cualquier duda, el esquema manda.

### Convenciones comunes
- **Textos localizables** (`localizado` en el esquema, tipo `Localized` en `ui.ts`): un campo puede ser una cadena neutra (`ciudad: "Madrid"`) o un objeto por idioma (`ciudad: { en: "Vienna", es: "Viena" }`, al menos una versión). Usar el objeto solo cuando el texto cambia de verdad entre idiomas. Para mostrarlo, siempre `localize(valor, lang)`, que cae al idioma por defecto y luego a la primera versión disponible.
- Los textos de `site.json` que dependen del idioma (`profesion`, `introHome`, `territorio`…) son siempre `{ en, es }` con ambas versiones.
- Las cadenas con `[`, `:` o `#` van entre comillas en YAML.
- Placeholders: `"[PENDIENTE: …]"` como valor y, si el campo tiene formato (código de país, fecha, URL), un comentario YAML `# [PENDIENTE: …]` junto a un valor válido provisional. `esPendiente()` (`src/lib/site.ts`) detecta placeholders para no renderizar enlaces rotos.

### Conciertos (`conciertos`)
- Nombre de archivo: `AAAA-MM-DD-ciudad.md`.
- `fecha`: **hora local de la sala, sin zona**, como cadena entre comillas: `"2026-11-21T19:30"`. Nunca convertirla a otra zona para mostrarla.
- `zonaHoraria`: zona IANA de la sala (por defecto `Europe/Madrid`). Sirve para decidir próximo/pasado y para el `startDate` con desfase de schema.org (aún sin implementar).
- `pais`: código **ISO 3166-1 alfa-2** en mayúsculas (`ES`, `DE`, `GB`). El nombre del país se mostrará traducido con `Intl.DisplayNames` (aún sin implementar); no escribirlo en el archivo.
- `ciudad`, `sala`: localizables.
- `rol`: `solista` | `camara` | `recital` | `orquesta` | `otro`
- `con`: orquesta / ensemble / pianista / director (localizable o lista de localizables)
- `programa`: lista de `{ compositor, obra }` (`obra` localizable; `compositor` neutro)
- `entradas` (URL, opcional), `agotado` (bool, por defecto `false`), `cancelado` (bool, por defecto `false`)
- `notas` (localizable, opcional) en el frontmatter. El cuerpo del `.md` no se usa.
- Próximos y pasados se separan automáticamente por fecha en tiempo de build. Los pasados se agrupan por temporada (sep–ago, p. ej. "2026/27").
- Generar datos estructurados schema.org `MusicEvent` para cada concierto próximo.

### Prensa (`prensa`)
- `cita`: objeto por código de idioma de dos letras; puede incluir el original en cualquier idioma y las traducciones: `cita: { de: "…", en: "…", es: "…" }`.
- `idiomaOriginal`: idioma en que se publicó la crítica; **debe existir como clave en `cita`** (el esquema lo valida). Al mostrar: la versión en el idioma de la página si existe; si no, el original.
- `medio`, `autor` (opcional), `fecha` (YAML `AAAA-MM-DD`), `url` (opcional), `destacada` (bool, por defecto `false`)
- Las destacadas aparecen en la Home.

### Bio (`bio`)
- Una sola versión (extensa) por idioma: bio/en.md y bio/es.md. No crear versiones cortas ni resúmenes. El id de la entrada (`en`/`es`) es el idioma.
- Se muestra completa en la página Bio. En la Home, como mucho el párrafo introductivo propio `introHome` de `site.json`, nunca un recorte automático de la bio.
- Frontmatter `temporada` (formato `"2026/27"`), visible junto a la bio.

### Media (`media`)
- Unión discriminada por `tipo`:
  - `tipo: video`: `plataforma` (`youtube` | `vimeo`), `id` (solo el ID, no la URL), `titulo` (localizable), `compositor`, `obra` (localizable), `fecha`, `destacado`, `orden`
  - `tipo: audio`: `plataforma` (`spotify` | `apple-music` | `soundcloud` | `bandcamp` | `otra`), `url`, `titulo`, `compositor`, `obra`, `sello`, `fecha`, `destacado`, `orden`
- Todo el contenido va en el frontmatter; el cuerpo no se usa.

### Datos generales (`site.json`)
- Se valida al hacer build con el esquema de `src/lib/site.ts`; importar siempre `site` desde ahí, nunca el JSON directamente. Si se añade un campo a `site.json`, añadirlo también al esquema.
- `nombre`, `profesion` `{ en, es }`, `email`, `introHome` `{ en, es }` (párrafo de la Home)
- `redes`: lista de `{ red, url, etiqueta? }`, con `red` en `instagram` | `facebook` | `youtube` | `spotify` | `x` | `bluesky` | `linkedin` | `tiktok` | `otra`. Las que siguen pendientes no se muestran.
- `management`: lista por territorio (`territorio` `{ en, es }`, `agencia`, `contacto`, `email`, `web`)
- `instrumento` (opcional): `constructor`, `anio`, `cesion` (fundación o mecenas), si aplica

## Fotos

- `alt` descriptivo y obligatorio en todas las imágenes (por idioma).
- Versiones web optimizadas vía `astro:assets`; versiones en alta resolución solo como descarga en `public/presskit/`.

## Diseño

- Estética: estilo clásico, sobrio, luminoso. Mucho espacio en blanco, fotografía protagonista.
- Tipografía: **Cormorant Garamond** para títulos (`font-serif`, peso 500; cursiva disponible para citas) + **Inter** para texto (`font-sans`).
- Paleta: blanco, detalles asociados a un instrumento como la viola, como el marrón y el dorado. Tokens en `@theme` de `global.css`; usar siempre estos, no colores sueltos:
  - `paper` (fondo), `ink` (texto), `muted` (texto secundario), `line` (bordes)
  - `wood-900` / `wood-700` / `wood-500` (títulos, enlaces, hover)
  - `gold-700` (dorado **para texto**, AA sobre `paper`), `gold-400` (**solo decorativo**: filetes y líneas, no pasa AA como texto), `gold-100` (fondos suaves)
- Motivos recurrentes: títulos con filete dorado corto debajo (`PageHeading`), etiquetas en versalitas espaciadas (`uppercase tracking-[0.12em]`), contenedor `max-w-6xl` con `px-5 sm:px-8`.
- Webs de referencia: algunos ejemplos, de manera aproximada, https://www.thomas-dunford.com/, https://www.leadesandre.com/.
- Mobile-first. Debe verse impecable en móvil, tablet y escritorio.
- Accesibilidad: contraste AA, navegación por teclado, foco visible, `lang` correcto por página, menú móvil accesible.
- Evitar animaciones llamativas; transiciones discretas como máximo, respetando `prefers-reduced-motion`.

## SEO

- `<title>` y meta description únicos por página e idioma (claves `meta.<sección>.title` / `meta.<sección>.description` en `ui.ts`; `Base.astro` añade ` · Mario Carpintero` al título)
- Todo lo del `<head>` (canonical, hreflang + `x-default`, Open Graph, Twitter, JSON-LD vía prop `jsonLd`) se genera en `Base.astro`; las páginas solo pasan props.
- Open Graph / Twitter cards con imagen por defecto (**[PENDIENTE]**) y específica cuando aplique (prop `image`)
- `hreflang` entre versiones ES/EN y URL canónica
- schema.org: `Person` (con instrumento y redes) en la Home; `MusicEvent` en conciertos
- Sitemap generado con `@astrojs/sitemap`

## Forma de trabajar

- Antes de una tarea grande, proponer un plan breve y esperar confirmación.
- Trabajar por secciones; con mensajes claros en español.
- Antes de dar algo por terminado:
  1. `npm run build` sin errores ni warnings
  2. `npx astro check` sin errores de tipos
  3. Revisar la página en móvil y escritorio (con el navegador o capturas si están disponibles)
- Si falta contenido real, usar placeholders claramente marcados (`[PENDIENTE: …]`) y listarlos al final, nunca inventar datos biográficos, críticas, fechas ni grabaciones.
- Comunicación y mensajes de commit en español. Textos de la web en ambos idiomas.

## Comandos

- `npm run dev`: servidor de desarrollo
- `npm run build`: build estático en `dist/`
- `npm run preview`: previsualizar el build
- `npx astro check` (o `npm run check`): comprobación de tipos

## Despliegue (pendiente de decidir)

Destino previsto: VPS con IP propia u hosting europeo, servido con Caddy/Nginx, desplegado con rsync o GitHub Action.
Motivo: evitar los bloqueos de IPs compartidas en España (Cloudflare, Vercel, Netlify…) durante los partidos de LaLiga.
Durante el desarrollo se puede usar una URL de prueba en cualquier proveedor.
