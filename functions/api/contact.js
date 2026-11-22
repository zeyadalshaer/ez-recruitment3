// Receives the contact form and emails it to the business inbox using Resend (resend.com).
// Runs on Cloudflare Pages at  /api/contact
//
// Environment variables (Cloudflare Pages → Settings → Variables and Secrets):
//   RESEND_API_KEY  — required. Create it in the Resend dashboard (store as a Secret).
//   CONTACT_TO      — optional. Where enquiries are delivered. Default: zeyad@ez-recruitment.com
//   CONTACT_FROM    — optional. Sender, e.g. "EZ Recruitment Website <website@ez-recruitment.com>".
//                     The domain must be verified in Resend. Default: Resend's test sender
//                     (works only while testing, and only delivers to your own Resend account email).

const DEFAULT_TO = 'zeyad@ez-recruitment.com';
const DEFAULT_FROM = 'EZ Recruitment Website <onboarding@resend.dev>';

const LIMITS = { name: 120, company: 160, email: 160, phone: 40, industry: 80, requirements: 3000, message: 4000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (v, max) => String(v ?? '').replace(/\r\n/g, '\n').trim().slice(0, max);
const oneLine = (v) => v.replace(/[\r\n]+/g, ' ');

function respond(request, ok, status, body) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify({ ok, ...body }), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
  if (ok) return Response.redirect(new URL('/contact/thank-you/', request.url).href, 303);
  const html = `<!doctype html><meta charset="utf-8"><title>Enquiry not sent</title><body style="font-family:system-ui,sans-serif;padding:2rem;color:#142D4E"><h1>Your enquiry could not be sent</h1><p>Please go back and try again, or email us directly at <a href="mailto:${DEFAULT_TO}">${DEFAULT_TO}</a>.</p></body>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function onRequestPost({ request, env }) {
  // Only accept submissions that come from this website.
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    return respond(request, false, 403, { error: 'forbidden' });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return respond(request, false, 400, { error: 'invalid_request' });
  }

  // Spam trap: bots fill in the hidden "website" field. Pretend success and drop it.
  if (clean(form.get('website'), 200)) return respond(request, true, 200, {});

  const data = Object.fromEntries(Object.entries(LIMITS).map(([k, max]) => [k, clean(form.get(k), max)]));
  const missing = ['name', 'company', 'email', 'industry', 'requirements'].filter((k) => !data[k]);
  if (missing.length || !EMAIL_RE.test(data.email)) {
    return respond(request, false, 422, { error: 'validation', fields: missing });
  }

  if (!env.RESEND_API_KEY) {
    return respond(request, false, 503, { error: 'not_configured' });
  }

  const text = [
    'New enquiry from the EZ Recruitment website',
    '',
    `Name: ${data.name}`,
    `Company: ${data.company}`,
    `Business email: ${data.email}`,
    `Phone: ${data.phone || '—'}`,
    `Industry: ${data.industry}`,
    '',
    'Workforce requirements:',
    data.requirements,
    '',
    'Message:',
    data.message || '—',
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM || DEFAULT_FROM,
      to: [env.CONTACT_TO || DEFAULT_TO],
      reply_to: data.email,
      subject: oneLine(`Website enquiry: ${data.company} (${data.industry})`),
      text,
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    return respond(request, false, 502, { error: 'delivery_failed' });
  }
  return respond(request, true, 200, {});
}

// Anything other than POST is not allowed.
export async function onRequest({ request }) {
  return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
}
