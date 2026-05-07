import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';

// GET /api/photos/:id — stream photo bytes from R2
// HEAD is handled automatically by Astro (runs GET, strips body).
export const GET: APIRoute = async ({ params, locals }) => {
  const { PHOTOS } = locals.runtime.env;
  const obj = await PHOTOS.get(params.id!);
  if (!obj) return new Response(null, { status: 404 });

  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

// POST /api/photos/:id — upload image bytes to R2
export const POST: APIRoute = async ({ request, params, locals }) => {
  const guard = requireAuth(request, locals.runtime.env as any);
  if (guard) return guard;

  const { PHOTOS } = locals.runtime.env;
  const body = await request.arrayBuffer();

  await PHOTOS.put(params.id!, body, {
    httpMetadata: {
      contentType: request.headers.get('Content-Type') ?? 'image/jpeg',
    },
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// DELETE /api/photos/:id — remove photo from R2
export const DELETE: APIRoute = async ({ request, params, locals }) => {
  const guard = requireAuth(request, locals.runtime.env as any);
  if (guard) return guard;

  const { PHOTOS } = locals.runtime.env;
  await PHOTOS.delete(params.id!);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
