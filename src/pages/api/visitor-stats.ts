import type { APIRoute } from 'astro';
import { getVisitorStats } from '../../lib/ga4';

export const GET: APIRoute = async () => {
    const stats = await getVisitorStats();

    return new Response(JSON.stringify(stats), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            // Optional: Add cache control headers if you want browser caching
            // 'Cache-Control': 'public, max-age=60', 
        },
    });
};
