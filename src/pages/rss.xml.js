import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const posts = await getCollection('blog');
    return rss({
        title: 'Antigravity Tech Blog',
        description: 'A tech blog about engineering, backend, and DevOps.',
        site: context.site,
        items: posts.map((post) => ({
            ...post.data,
            link: `/blog/${post.slug}/`,
            pubDate: post.data.date,
        })),
    });
}
