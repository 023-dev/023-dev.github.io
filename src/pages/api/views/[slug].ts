export const prerender = false;

import type { APIRoute } from 'astro';
import { getPageViews } from '../../../lib/ga4';

export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;

    if (!slug) {
        return new Response(JSON.stringify({ error: 'Slug is required' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    const views = await getPageViews(slug);

    return new Response(JSON.stringify({ views }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
    });
};
