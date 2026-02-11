import { getCollection } from 'astro:content';

export async function getStaticPaths() {
    const posts = (await getCollection('blog')).filter((post) => post.data.visible !== false);
    return posts.map((post) => ({
        params: { slug: post.slug },
    }));
}

import { getPageViews } from '../../../lib/ga4';

export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;
    if (!slug) {
        return new Response(JSON.stringify({ error: 'Slug is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const views = await getPageViews(slug);

    return new Response(JSON.stringify({ views }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30'
        },
    });
}
