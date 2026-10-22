import { getCollection, type CollectionEntry } from 'astro:content';
import { instante, temporada } from './formato';

export type Concierto = CollectionEntry<'conciertos'>;

/** Momento del build: decide qué conciertos son próximos y cuáles pasados. */
const ahora = Date.now();

function ms(c: Concierto): number {
  return instante(c.data.fecha, c.data.zonaHoraria).getTime();
}

/** Próximos conciertos (incluidos los cancelados), del más cercano al más lejano. */
export async function proximos(limite?: number): Promise<Concierto[]> {
  const todos = await getCollection('conciertos', (c) => ms(c) >= ahora);
  const orden = todos.sort((a, b) => ms(a) - ms(b));
  return limite === undefined ? orden : orden.slice(0, limite);
}

/** Conciertos pasados, del más reciente al más antiguo, agrupados por temporada. */
export async function pasadosPorTemporada(): Promise<{ temporada: string; conciertos: Concierto[] }[]> {
  const pasados = (await getCollection('conciertos', (c) => ms(c) < ahora)).sort((a, b) => ms(b) - ms(a));
  const grupos = new Map<string, Concierto[]>();
  for (const c of pasados) {
    const t = temporada(c.data.fecha);
    grupos.set(t, [...(grupos.get(t) ?? []), c]);
  }
  return [...grupos].map(([t, conciertos]) => ({ temporada: t, conciertos }));
}
