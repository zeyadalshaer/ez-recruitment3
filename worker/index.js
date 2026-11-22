// Cloudflare Worker entry. Serves the static website (from /dist) and handles the three
// small server endpoints: CMS login (/api/auth, /api/callback) and the contact form (/api/contact).
import * as auth from '../functions/api/auth.js';
import * as callback from '../functions/api/callback.js';
import * as contact from '../functions/api/contact.js';

const routes = {
  '/api/auth': auth,
  '/api/callback': callback,
  '/api/contact': contact,
};

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname.replace(/\/$/, '');
    const mod = routes[path];
    if (mod) {
      const handler = mod['onRequest' + request.method[0] + request.method.slice(1).toLowerCase()] || mod.onRequest;
      if (handler) return handler({ request, env, ctx });
      return new Response('Method not allowed', { status: 405 });
    }
    return env.ASSETS.fetch(request);
  },
};
