import { getCollection } from 'astro:content';

export async function getStaticPaths() {
    const posts = await getCollection('blog');
    return posts.map((post) => ({
        params: { slug: post.slug },
    }));
}

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
    return new Response(JSON.stringify({ views: 0 }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
