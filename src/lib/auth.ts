interface Env {
  GARDEN_PASSWORD?: string;
}

function getCookieToken(request: Request): string | null {
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)garden_auth=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function getAuthEmail(request: Request, env: Env = {}): string | null {
  const cfEmail = request.headers.get('cf-access-authenticated-user-email');
  if (cfEmail) return cfEmail;
  const token = getCookieToken(request);
  if (token && env.GARDEN_PASSWORD && token === env.GARDEN_PASSWORD) return 'josie';
  return null;
}

export function requireAuth(request: Request, env: Env = {}): Response | null {
  if (import.meta.env.DEV) return null;
  if (!getAuthEmail(request, env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
