import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    // Type-check frontmatter using a schema
    schema: ({ image }) => z.object({
        title: z.string(),
        // Transformer string tags into array
        tags: z.array(z.string()).default([]),
        series: z.string().optional(),
        heroImage: image().optional(),
        date: z.coerce.date(),
    }),
});

export const collections = { blog };
