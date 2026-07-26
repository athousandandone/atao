import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogSchema } from './lib/schema';

// One collection, flat directory, filename = slug (collisions impossible;
// nested ids would change URLs).
const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: blogSchema,
});

export const collections = { blog };
