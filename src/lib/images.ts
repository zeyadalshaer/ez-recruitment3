import type { ImageMetadata } from 'astro';

// Every image uploaded through the CMS lives in src/assets/uploads. Content files refer to
// images by path (for example "/src/assets/uploads/hero.svg"); this turns that path into an
// optimized image at build time.
const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{jpg,jpeg,png,webp,avif,gif,svg}',
  { eager: true },
);

export function resolveImage(path?: string): ImageMetadata | string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  const key = path.startsWith('/') ? path : `/${path}`;
  return files[key]?.default;
}
