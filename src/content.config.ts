import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const md = (base: string) => glob({ pattern: '**/*.md', base: `./src/content/${base}` });

// Blog articles: one Markdown file per article. `published: false` keeps an article off the website.
const blog = defineCollection({
  loader: md('blog'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    author: z.string().optional(),
    published: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

const categories = defineCollection({
  loader: md('categories'),
  schema: z.object({ title: z.string(), description: z.string().optional() }),
});

const services = defineCollection({
  loader: md('services'),
  schema: z.object({
    order: z.number().default(99),
    title: z.string(),
    summary: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    benefits: z.array(z.string()).optional(),
  }),
});

const industries = defineCollection({
  loader: md('industries'),
  schema: z.object({
    order: z.number().default(99),
    title: z.string(),
    summary: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    roles: z.array(z.string()).optional(),
  }),
});

const process = defineCollection({
  loader: md('process'),
  schema: z.object({
    order: z.number().default(99),
    title: z.string(),
    summary: z.string(),
    points: z.array(z.string()).optional(),
  }),
});

// Extra pages created in the CMS (e.g. Privacy Policy).
const pages = defineCollection({
  loader: md('pages'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { blog, categories, services, industries, process, pages };
