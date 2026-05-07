import type { APIRoute } from 'astro';
import { requireAuth } from '../../lib/auth';

const FALLBACK_WEIGHTS = {
  josie: {
    café:       { ambiance: 0.50, taste: 0.30, originality: 0.20 },
    restaurant: { ambiance: 0.25, taste: 0.50, originality: 0.25 },
  },
  sammy: {
    café:       { ambiance: 0.30, taste: 0.35, originality: 0.35 },
    restaurant: { ambiance: 0.10, taste: 0.60, originality: 0.30 },
  },
};

export const GET: APIRoute = async ({ locals }) => {
  const { SETTINGS } = locals.runtime.env;
  const weights = await SETTINGS.get('DEFAULT_WEIGHTS', 'json');
  return new Response(JSON.stringify(weights ?? FALLBACK_WEIGHTS), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const guard = requireAuth(request, locals.runtime.env as any);
  if (guard) return guard;

  const { SETTINGS } = locals.runtime.env;
  const body = await request.json();
  await SETTINGS.put('DEFAULT_WEIGHTS', JSON.stringify(body));
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
