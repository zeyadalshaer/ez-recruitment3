import { getCollection, type CollectionEntry } from 'astro:content';
import site from '../data/site.json';
import nav from '../data/navigation.json';
import pages from '../data/pages.json';

export { site, nav, pages };

export type Post = CollectionEntry<'blog'>;

export function readingTime(text = ''): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

/** Published articles, newest first. Unpublished articles never reach the website. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => data.published);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getCategories() {
  const [cats, posts] = await Promise.all([getCollection('categories'), getPosts()]);
  return cats
    .map((c) => ({ id: c.id, title: c.data.title, description: c.data.description, count: posts.filter((p) => p.data.category === c.id).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function categoryTitle(id: string): Promise<string> {
  const cats = await getCollection('categories');
  return cats.find((c) => c.id === id)?.data.title ?? id;
}

export function getRelated(current: Post, all: Post[], limit = 3): Post[] {
  const others = all.filter((p) => p.id !== current.id);
  const same = others.filter((p) => p.data.category === current.data.category);
  const rest = others.filter((p) => p.data.category !== current.data.category);
  return [...same, ...rest].slice(0, limit);
}

export const absUrl = (path: string) => new URL(path, site.url).href;
