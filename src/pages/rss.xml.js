import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const posts = await getCollection('blog');
    return rss({
        title: 'Antigravity Tech Blog',

        site: context.site,
        items: posts.map((post) => ({
            ...post.data,
            link: `/blog/${post.slug}/`,
            pubDate: post.data.createdAt,
        })),
    });
}
