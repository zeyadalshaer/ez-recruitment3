// Step 2 of the CMS login: GitHub sends the editor back here with a one-time code.
// We swap the code for an access token and hand it to the CMS window that opened this popup.
// Runs on Cloudflare Pages at  /api/callback
//
// Optional environment variable:
//   ALLOWED_GITHUB_USERS — comma-separated GitHub usernames allowed to log in (extra safety).
//   Even without it, only people with write access to the repository can save changes.

const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function popupPage(origin, status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const ok = status === 'success';
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>CMS login</title><meta name="robots" content="noindex"></head>
<body style="font-family:system-ui,sans-serif;padding:2rem;color:#142D4E">
<p>${ok ? 'Signed in. This window will close automatically.' : 'Sign-in failed. You can close this window and try again.'}</p>
<script>
(function () {
  var message = ${safeJson(message)};
  var allowed = ${safeJson(origin)};
  function receive(e) {
    if (e.origin !== allowed) return;
    window.opener.postMessage(message, e.origin);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  if (window.opener) window.opener.postMessage('authorizing:github', allowed);
})();
</script></body></html>`;
  return new Response(html, {
    status: ok ? 200 : 400,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0',
    },
  });
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : '';
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return popupPage(origin, 'error', { message: 'CMS login is not configured.' });
  }
  if (!code || !state || state !== readCookie(request, 'oauth_state')) {
    return popupPage(origin, 'error', { message: 'Invalid or expired login attempt.' });
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'ez-recruitment-cms' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${origin}/api/callback`,
    }),
  });
  const data = await tokenResponse.json().catch(() => ({}));
  if (!data.access_token) {
    return popupPage(origin, 'error', { message: 'GitHub did not return an access token.' });
  }

  if (env.ALLOWED_GITHUB_USERS) {
    const allowed = env.ALLOWED_GITHUB_USERS.split(',').map((u) => u.trim().toLowerCase()).filter(Boolean);
    const who = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${data.access_token}`, 'User-Agent': 'ez-recruitment-cms', Accept: 'application/vnd.github+json' },
    });
    const profile = await who.json().catch(() => ({}));
    if (!profile.login || !allowed.includes(String(profile.login).toLowerCase())) {
      return popupPage(origin, 'error', { message: 'This GitHub account is not allowed to edit the website.' });
    }
  }

  return popupPage(origin, 'success', { token: data.access_token, provider: 'github' });
}
