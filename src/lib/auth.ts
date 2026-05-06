export function getAuthEmail(request: Request): string | null {
  return request.headers.get('cf-access-authenticated-user-email');
}

// Returns a 401 Response if unauthenticated, or null if the request is allowed.
// In dev, always returns null so mutations work without Cloudflare Access.
export function requireAuth(request: Request): Response | null {
  if (import.meta.env.DEV) return null;
  const email = getAuthEmail(request);
  if (!email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
