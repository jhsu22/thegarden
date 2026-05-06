import type { APIRoute } from 'astro';
import { getAuthEmail } from '../../../lib/auth';

export const GET: APIRoute = ({ request }) => {
  // In dev, report as authenticated so edit controls are visible.
  if (import.meta.env.DEV) {
    return new Response(JSON.stringify({ authenticated: true, email: 'dev@local' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = getAuthEmail(request);
  return new Response(JSON.stringify({ authenticated: !!email, email: email ?? null }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
