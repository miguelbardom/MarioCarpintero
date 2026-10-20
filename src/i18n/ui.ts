/**
 * Textos de interfaz y utilidades de idioma.
 * Mantener `languages` y `defaultLang` sincronizados con `i18n` en astro.config.mjs.
 */

export const languages = {
  en: 'English',
  es: 'Español',
} as const;

export type Lang = keyof typeof languages;

export const locales = Object.keys(languages) as Lang[];

// [PENDIENTE: confirmar idioma por defecto (en | es)]
export const defaultLang: Lang = 'en';

/** Código de idioma para Open Graph (`og:locale`). */
export const ogLocales: Record<Lang, string> = {
  en: 'en_GB',
  es: 'es_ES',
};

/**
 * Segmento de URL de cada sección por idioma.
 * Permite que el selector de idioma lleve a la página equivalente.
 */
export const routes = {
  home: { en: '', es: '' },
  bio: { en: 'bio', es: 'biografia' },
  schedule: { en: 'schedule', es: 'agenda' },
  press: { en: 'press', es: 'prensa' },
  media: { en: 'media', es: 'media' },
  contact: { en: 'contact', es: 'contacto' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof routes;

/** Secciones del menú principal, en orden. */
export const navItems: RouteKey[] = ['home', 'bio', 'schedule', 'press', 'media', 'contact'];

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.bio': 'Biography',
    'nav.schedule': 'Schedule',
    'nav.press': 'Press',
    'nav.media': 'Media',
    'nav.contact': 'Contact',
    'nav.label': 'Main navigation',
    'nav.open': 'Open menu',
    'nav.close': 'Close menu',
    'a11y.skip': 'Skip to content',
    'lang.label': 'Language',
    'lang.switch': 'Ver esta página en español',
    'footer.contact': 'Contact',
    'footer.management': 'Management',
    'footer.social': 'Social media',
    'footer.rights': 'All rights reserved.',
    'meta.home.title': 'Violist',
    'meta.home.description': '[PENDIENTE: meta description of the home page]',
    'meta.bio.title': 'Biography',
    'meta.bio.description': '[PENDIENTE: meta description of the biography page]',
    'meta.schedule.title': 'Schedule',
    'meta.schedule.description': '[PENDIENTE: meta description of the schedule page]',
    'meta.press.title': 'Press',
    'meta.press.description': '[PENDIENTE: meta description of the press page]',
    'meta.media.title': 'Media',
    'meta.media.description': '[PENDIENTE: meta description of the media page]',
    'meta.contact.title': 'Contact',
    'meta.contact.description': '[PENDIENTE: meta description of the contact page]',
    'page.wip': 'This section is under construction.',
    '404.title': 'Page not found',
    '404.text': 'The page you are looking for does not exist or has moved.',
    '404.back': 'Back to the home page',
    'root.choose': 'Choose a language',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.bio': 'Biografía',
    'nav.schedule': 'Agenda',
    'nav.press': 'Prensa',
    'nav.media': 'Media',
    'nav.contact': 'Contacto',
    'nav.label': 'Navegación principal',
    'nav.open': 'Abrir menú',
    'nav.close': 'Cerrar menú',
    'a11y.skip': 'Saltar al contenido',
    'lang.label': 'Idioma',
    'lang.switch': 'View this page in English',
    'footer.contact': 'Contacto',
    'footer.management': 'Representación',
    'footer.social': 'Redes sociales',
    'footer.rights': 'Todos los derechos reservados.',
    'meta.home.title': 'Viola',
    'meta.home.description': '[PENDIENTE: meta description de la página de inicio]',
    'meta.bio.title': 'Biografía',
    'meta.bio.description': '[PENDIENTE: meta description de la biografía]',
    'meta.schedule.title': 'Agenda',
    'meta.schedule.description': '[PENDIENTE: meta description de la agenda]',
    'meta.press.title': 'Prensa',
    'meta.press.description': '[PENDIENTE: meta description de prensa]',
    'meta.media.title': 'Media',
    'meta.media.description': '[PENDIENTE: meta description de media]',
    'meta.contact.title': 'Contacto',
    'meta.contact.description': '[PENDIENTE: meta description de contacto]',
    'page.wip': 'Esta sección está en construcción.',
    '404.title': 'Página no encontrada',
    '404.text': 'La página que buscas no existe o ha cambiado de dirección.',
    '404.back': 'Volver a la página de inicio',
    'root.choose': 'Elige un idioma',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)[typeof defaultLang];

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && value in languages;
}

/** Idioma a partir de la URL (`/en/...`, `/es/...`). */
export function getLangFromUrl(url: URL): Lang {
  const [, segment] = url.pathname.split('/');
  return isLang(segment) ? segment : defaultLang;
}

/** Ruta interna de una sección, siempre con barra final. */
export function localizePath(route: RouteKey, lang: Lang): string {
  const slug = routes[route][lang];
  return slug ? `/${lang}/${slug}/` : `/${lang}/`;
}

/** Texto que puede ser neutro (una sola cadena) o traducido por idioma. */
export type Localized = string | Partial<Record<Lang, string>>;

/** Devuelve la versión en `lang`, o la del idioma por defecto, o la primera disponible. */
export function localize(value: Localized, lang: Lang): string {
  if (typeof value === 'string') return value;
  return value[lang] ?? value[defaultLang] ?? Object.values(value)[0] ?? '';
}
