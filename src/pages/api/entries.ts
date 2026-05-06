import type { APIRoute } from 'astro';

interface EntryBody {
  id: string;
  category: string;
  name: string;
  date: string;
  notes?: string | null;
  score?: number | null;
  [key: string]: unknown;
}

function rowToEntry(row: Record<string, unknown>) {
  const metadata = JSON.parse((row.metadata as string) || '{}');
  return {
    ...metadata,
    id: row.id,
    category: row.category,
    name: row.name,
    date: row.date,
    notes: row.notes ?? null,
    score: row.score ?? null,
  };
}

export const GET: APIRoute = async ({ request, locals }) => {
  const { DB } = locals.runtime.env;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  const stmt = category
    ? DB.prepare('SELECT * FROM entries WHERE category = ? ORDER BY date DESC').bind(category)
    : DB.prepare('SELECT * FROM entries ORDER BY date DESC');

  const { results } = await stmt.all<Record<string, unknown>>();
  return new Response(JSON.stringify(results.map(rowToEntry)), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { DB } = locals.runtime.env;
  const body = (await request.json()) as EntryBody;
  const { id, category, name, date, notes = null, score = null, ...metadata } = body;

  await DB.prepare(`
    INSERT INTO entries (id, category, name, date, notes, score, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name     = excluded.name,
      date     = excluded.date,
      notes    = excluded.notes,
      score    = excluded.score,
      metadata = excluded.metadata
  `).bind(id, category, name, date, notes, score, JSON.stringify(metadata)).run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const { DB } = locals.runtime.env;
  const { id } = (await request.json()) as { id: string };

  await DB.prepare('DELETE FROM entries WHERE id = ?').bind(id).run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
