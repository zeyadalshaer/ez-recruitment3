// Step 1 of the CMS login: send the editor to GitHub to approve access.
// Runs on Cloudflare Pages at  /api/auth
//
// Needs two environment variables (Cloudflare Pages → Settings → Variables and Secrets):
//   GITHUB_CLIENT_ID      — from your GitHub OAuth App
//   GITHUB_CLIENT_SECRET  — from your GitHub OAuth App (store as a Secret)

function randomState() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response(
      'CMS login is not configured yet. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Cloudflare Pages settings.',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const url = new URL(request.url);
  const state = randomState();

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  authorize.searchParams.set('scope', 'repo,user'); // fixed on purpose; never taken from the request
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=600`,
      'Cache-Control': 'no-store',
    },
  });
}
