# EZ Recruitment website

Astro static site, Decap CMS at `/admin`, hosted on Cloudflare Pages. Content is kept separate from design.

## Run it locally
```
npm install
npm run dev        # http://localhost:4321
npm run build      # production build into /dist
```
To use the CMS locally: run `npm run cms` in a second terminal, then open http://localhost:4321/admin.

## Where things live
| What | Where |
|---|---|
| Site name, email, footer text | `src/data/site.json` |
| Navigation menu and footer links | `src/data/navigation.json` |
| Homepage / About / Contact text | `src/data/home.json`, `about.json`, `contact.json` |
| Services, Industries, Process steps | `src/content/services`, `industries`, `process` |
| Articles and categories | `src/content/blog`, `src/content/categories` |
| Extra pages (e.g. Privacy Policy) | `src/content/pages` |
| Uploaded images | `src/assets/uploads` |
| Design (colours, fonts, layout) | `src/styles/global.css`, `src/components`, `src/pages` |
| Contact email delivery | `functions/api/contact.js` |
| CMS login | `functions/api/auth.js`, `callback.js`, `public/admin/config.yml` |

## Managing content (no code)
Go to `https://ez-recruitment.com/admin`, sign in with GitHub, and edit. Saving commits to GitHub and Cloudflare republishes in about a minute.
- **Articles:** *Insights Articles* → New. Set a category, upload a featured image, and use the **Published** switch to publish or unpublish. Delete removes it.
- **Categories:** *Categories* collection.
- **Text, navigation, services, industries, process:** the matching collections in the sidebar.
- **New page:** *Extra Pages* → New, then add a link in *Navigation*.
- **Replace a photo:** open the item and upload a new image. The site currently uses branded placeholder graphics; real photography is not included (see below).

## One-time setup
1. **GitHub:** create a repository (private is fine), then `git init`, `git add .`, `git commit`, add the remote and `git push -u origin main`.
2. **Edit `public/admin/config.yml`:** replace `YOUR-GITHUB-USERNAME/ez-recruitment` with your repository.
3. **Cloudflare Pages:** Workers & Pages → Create → Pages → connect the repo. Build command `npm run build`, output directory `dist`, environment variable `NODE_VERSION=22`.
4. **Custom domain:** in the Pages project → Custom domains → add `ez-recruitment.com` (and `www`). If the domain's DNS is on Cloudflare this is automatic; otherwise add the CNAME shown there.
5. **CMS login (free):** GitHub → Settings → Developer settings → OAuth Apps → New. Homepage `https://ez-recruitment.com`, callback `https://ez-recruitment.com/api/callback`. In Cloudflare Pages → Settings → Variables and Secrets add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (secret). Only GitHub accounts with write access to the repo can save.
6. **Contact form email:** create a free Resend account (resend.com), verify `ez-recruitment.com`, and add `RESEND_API_KEY` (secret) plus optionally `CONTACT_FROM` (e.g. `EZ Recruitment Website <website@ez-recruitment.com>`) in Cloudflare. An outside email service is needed because a static site cannot send mail by itself; Resend's free tier is sufficient for enquiry volume.

Redeploy once after adding variables.

## Notes
- No passwords or keys are in the code; all secrets are Cloudflare variables.
- Add a privacy policy review: `src/content/pages/privacy-policy.md` is a starting draft and should be checked by you or a lawyer.
- Placeholder graphics can be regenerated with `npm run art`.
