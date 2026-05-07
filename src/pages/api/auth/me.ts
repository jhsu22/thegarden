import type { APIRoute } from 'astro';
import { getAuthEmail } from '../../../lib/auth';

export const GET: APIRoute = ({ request, locals }) => {
  // In dev, report as authenticated so edit controls are visible.
  if (import.meta.env.DEV) {
    return new Response(JSON.stringify({ authenticated: true, email: 'dev@local' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = locals.runtime.env as { GARDEN_PASSWORD?: string };
  const email = getAuthEmail(request, env);
  return new Response(JSON.stringify({ authenticated: !!email, email: email ?? null }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
