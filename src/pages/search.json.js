import { getCollection } from 'astro:content';

export async function GET({ }) {
    const posts = await getCollection('blog');
    const searchList = posts.map((post) => ({
        title: post.data.title,
        description: post.data.description,
        slug: post.slug,
        tags: post.data.tags,
        date: post.data.date,
        heroImage: post.data.heroImage,
    }));

    return new Response(JSON.stringify(searchList), {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
        },
    });
}
