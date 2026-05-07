import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const { password } = (await request.json()) as { password: string };
  const env = locals.runtime.env as { GARDEN_PASSWORD?: string };

  if (!env.GARDEN_PASSWORD || password !== env.GARDEN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Wrong password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parts = [
    `garden_auth=${encodeURIComponent(password)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=31536000',
  ];
  if (import.meta.env.PROD) parts.push('Secure');

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Set-Cookie': parts.join('; '),
      'Content-Type': 'application/json',
    },
  });
};
