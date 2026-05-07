import type { APIRoute } from 'astro';

export const POST: APIRoute = () =>
  new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Set-Cookie': 'garden_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      'Content-Type': 'application/json',
    },
  });
