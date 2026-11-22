import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Production domain. Change it here if the domain ever changes.
export default defineConfig({
  site: 'https://ez-recruitment.com',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') && !page.includes('/thank-you') })],
});
