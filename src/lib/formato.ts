/**
 * Formato de fechas, horas y países con `Intl`.
 *
 * Las fechas de concierto son hora local de la sala ("2026-11-21T19:30") y se
 * muestran tal cual: se formatean como si fueran UTC para que `Intl` no las
 * desplace a la zona de quien hace el build o visita la web.
 */
import { intlLocales, type Lang } from '../i18n/ui';

interface PartesFecha {
  anio: number;
  mes: number;
  dia: number;
  hora: number;
  minuto: number;
}

function partes(fechaLocal: string): PartesFecha {
  const [fecha = '', hora = '00:00'] = fechaLocal.split('T');
  const [anio = 0, mes = 1, dia = 1] = fecha.split('-').map(Number);
  const [h = 0, m = 0] = hora.split(':').map(Number);
  return { anio, mes, dia, hora: h, minuto: m };
}

/** La hora de pared como Date en UTC (solo para formatear con `timeZone: 'UTC'`). */
function comoUTC(fechaLocal: string): Date {
  const p = partes(fechaLocal);
  return new Date(Date.UTC(p.anio, p.mes - 1, p.dia, p.hora, p.minuto));
}

function formatear(fechaLocal: string, lang: Lang, opciones: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(intlLocales[lang], { ...opciones, timeZone: 'UTC' }).format(comoUTC(fechaLocal));
}

/** Piezas sueltas para maquetar una fecha de concierto. */
export function piezasFecha(fechaLocal: string, lang: Lang) {
  return {
    dia: formatear(fechaLocal, lang, { day: 'numeric' }),
    mes: formatear(fechaLocal, lang, { month: 'short' }).replace('.', ''),
    anio: formatear(fechaLocal, lang, { year: 'numeric' }),
    diaSemana: formatear(fechaLocal, lang, { weekday: 'short' }).replace('.', ''),
    hora: formatear(fechaLocal, lang, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
  };
}

/** Fecha completa legible: "Saturday 21 November 2026" / "sábado, 21 de noviembre de 2026". */
export function fechaLarga(fechaLocal: string, lang: Lang): string {
  return formatear(fechaLocal, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Fecha de un Date (p. ej. críticas): "November 2026" / "noviembre de 2026". */
export function mesAnio(fecha: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(intlLocales[lang], { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(fecha);
}

/** Nombre del país traducido a partir de su código ISO ("DE" → "Germany" / "Alemania"). */
export function nombrePais(codigo: string, lang: Lang): string {
  return new Intl.DisplayNames([intlLocales[lang]], { type: 'region' }).of(codigo) ?? codigo;
}

/** Desfase de `zona` respecto a UTC, en minutos, en el instante `ms`. */
function desfaseMinutos(ms: number, zona: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: zona,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const v = Object.fromEntries(dtf.formatToParts(new Date(ms)).map((p) => [p.type, p.value]));
  const pared = Date.UTC(Number(v.year), Number(v.month) - 1, Number(v.day), Number(v.hour), Number(v.minute));
  return Math.round((pared - ms) / 60000);
}

/** Instante real del concierto (hora local de la sala en su zona horaria). */
export function instante(fechaLocal: string, zona: string): Date {
  const pared = comoUTC(fechaLocal).getTime();
  // Dos pasadas para acertar el desfase en los cambios de horario.
  let ms = pared - desfaseMinutos(pared, zona) * 60000;
  ms = pared - desfaseMinutos(ms, zona) * 60000;
  return new Date(ms);
}

/** ISO 8601 con desfase, para `<time datetime>` y schema.org: "2026-11-21T19:30:00+01:00". */
export function isoConDesfase(fechaLocal: string, zona: string): string {
  const min = desfaseMinutos(instante(fechaLocal, zona).getTime(), zona);
  const signo = min < 0 ? '-' : '+';
  const abs = Math.abs(min);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${fechaLocal}:00${signo}${hh}:${mm}`;
}

/** Temporada (septiembre–agosto) de una fecha local: "2026-11-21T19:30" → "2026/27". */
export function temporada(fechaLocal: string): string {
  const { anio, mes } = partes(fechaLocal);
  const inicio = mes >= 9 ? anio : anio - 1;
  return `${inicio}/${String((inicio + 1) % 100).padStart(2, '0')}`;
}
