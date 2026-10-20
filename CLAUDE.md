# CLAUDE.md

## Proyecto

Web oficial de Mario Carpintero, violista profesional dedicado/a a la música clásica.
Público principal: programadores de festivales y temporadas, orquestas, agencias, prensa y público aficionado.
Prioridades: elegancia sobria, legibilidad, carga muy rápida y materiales oficiales (bio, fotos, prensa) fáciles de encontrar y descargar.

Secciones: Home · Bio · Schedule · Press · Media · Contact

## Stack

- **Astro** + TypeScript (modo estricto)
- **Tailwind CSS** para estilos
- **Content Collections** de Astro para todo el contenido editable
- `astro:assets` (`<Image />` / `<Picture />`) para imágenes
- **PhotoSwipe** para la galería (lightbox)
- **lite-youtube-embed** para vídeos (y equivalente ligero para Vimeo si hace falta)
- **Fontsource** para tipografías alojadas localmente
- `@astrojs/sitemap`
- Formulario de contacto: **[Formspree | Web3Forms]**

### Restricciones de stack

- **Salida 100% estática.** Sin adaptadores (Vercel, Netlify, Node…), sin SSR, sin funciones serverless ni edge.
- **Ninguna funcionalidad propia de un proveedor de hosting** (nada de Netlify Forms, optimización de imágenes de Vercel, etc.). El resultado de `npm run build` (`dist/`) debe poder servirse desde cualquier servidor estático (Caddy/Nginx en un VPS).
- Sin React, Vue ni otros frameworks de componentes salvo que se pida explícitamente. JavaScript en cliente solo donde sea imprescindible (galería, menú móvil).
- No añadir dependencias nuevas sin mencionarlo y justificarlo.
- Sin analíticas ni cookies de terceros salvo petición expresa. Los embeds externos (YouTube, Spotify…) se cargan solo al interactuar.

## Configuración clave

- `site` en `astro.config.mjs`: `https://[DOMINIO]`
- URLs con barra final (`trailingSlash: 'always'`, `build.format: 'directory'`). Mantener coherente en todos los enlaces internos.
- **Bilingüe desde el inicio** con el enrutado i18n de Astro:
  - Idiomas: `en` y `es`. Idioma por defecto: **[en | es]**.
  - Rutas: `/en/...` y `/es/...`, con selector de idioma en el header que lleve a la página equivalente.
  - Textos de interfaz (menú, botones, etiquetas) en `src/i18n/ui.ts`; nunca hardcodeados en componentes.
  - El contenido de las colecciones tiene versión por idioma cuando aplique (bio, textos de prensa traducidos, notas de conciertos). Datos neutros (fechas, salas, obras) no se duplican.

## Estructura de carpetas

```
src/
├── content.config.ts      # esquemas Zod de las colecciones
├── content/
│   ├── conciertos/        # un .md por concierto: AAAA-MM-DD-ciudad.md
│   ├── prensa/            # citas de crítica
│   ├── bio/               # versiones por longitud e idioma
│   └── media/             # vídeos y audios destacados
├── data/
│   └── site.json          # nombre, redes, emails, management, instrumento
├── i18n/
│   └── ui.ts
├── assets/
│   └── fotos/             # imágenes optimizadas por Astro
├── components/
├── layouts/
│   └── Base.astro         # <head>, SEO, header, footer, selector de idioma
├── pages/
│   ├── en/
│   └── es/
└── styles/
    └── global.css
public/
└── presskit/              # descargables tal cual: fotos HD, bios PDF, rider
```

**Regla principal: todo el contenido editable vive en `src/content` o `src/data`.** Ningún texto, fecha, enlace o dato del artista hardcodeado en componentes o páginas. Añadir un concierto, una crítica o un disco debe consistir solo en crear un archivo.

## Modelo de contenido

### Conciertos (`conciertos`)
- `fecha` (datetime, con hora local), `ciudad`, `pais`, `sala`
- `rol`: `solista` | `camara` | `recital` | `orquesta` | `otro`
- `con`: orquesta / ensemble / pianista / director (texto o lista)
- `programa`: lista de `{ compositor, obra }`
- `entradas` (URL, opcional), `agotado` (bool, opcional), `cancelado` (bool, opcional)
- Cuerpo opcional con notas, por idioma si es necesario.
- Próximos y pasados se separan automáticamente por fecha en tiempo de build. Los pasados se agrupan por temporada (sep–ago, p. ej. "2026/27").
- Generar datos estructurados schema.org `MusicEvent` para cada concierto próximo.

### Prensa (`prensa`)
- `cita` (por idioma si hay traducción), `medio`, `autor` (opcional), `fecha`, `url` (opcional), `destacada` (bool)
- Las destacadas aparecen en la Home.

### Bio (`bio`)
- Una sola versión (extensa) por idioma: bio/en.md y bio/es.md. No crear - versiones cortas ni resúmenes.
- Se muestra completa en la página Bio. En la Home, como mucho un párrafo introductivo propio (definido en site.json o en la Home), nunca un recorte automático de la bio.
- temporada (p. ej. "2026/27") visible junto a la bio.

### Media (`media`)
- Vídeos: `plataforma` (youtube | vimeo), `id`, `titulo`, `obra`/`compositor`, `destacado`
- Audio: enlaces o embeds ligeros.

### Datos generales (`site.json`)
- Nombre, email de contacto, redes sociales
- Management / agencia por territorio (`territorio`, `agencia`, `contacto`, `email`, `web`)
- Instrumento: constructor, año, cesión (fundación o mecenas), si aplica

## Fotos

- `alt` descriptivo y obligatorio en todas las imágenes (por idioma).
- Versiones web optimizadas vía `astro:assets`; versiones en alta resolución solo como descarga en `public/presskit/`.

## Diseño

- Estética: estilo clásico, sobrio, luminoso. Mucho espacio en blanco, fotografía protagonista.
- Tipografía: serif de calidad para títulos (**[Cormorant Garamond | EB Garamond | Playfair Display]**) + sans-serif legible para texto (**[Inter | Source Sans 3]**)
- Paleta: blanco, detalles asociados a un instrumento como la viola, como el marrón y el dorado.
- Webs de referencia: algunos ejemplos, de manera aproximada, https://www.thomas-dunford.com/, https://www.leadesandre.com/.
- Mobile-first. Debe verse impecable en móvil, tablet y escritorio.
- Accesibilidad: contraste AA, navegación por teclado, foco visible, `lang` correcto por página, menú móvil accesible.
- Evitar animaciones llamativas; transiciones discretas como máximo, respetando `prefers-reduced-motion`.

## SEO

- `<title>` y meta description únicos por página e idioma
- Open Graph / Twitter cards con imagen por defecto y específica cuando aplique
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
- `npx astro check`: comprobación de tipos

## Despliegue (pendiente de decidir)

Destino previsto: VPS con IP propia u hosting europeo, servido con Caddy/Nginx, desplegado con rsync o GitHub Action.
Motivo: evitar los bloqueos de IPs compartidas en España (Cloudflare, Vercel, Netlify…) durante los partidos de LaLiga.
Durante el desarrollo se puede usar una URL de prueba en cualquier proveedor.
