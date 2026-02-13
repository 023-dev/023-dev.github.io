import { getCollection } from 'astro:content';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';

export async function GET({ params, props }: { params: any; props: any }) {
    const { title, date, tags } = props;

    const fontData = await fs.readFile(path.join(process.cwd(), 'public/fonts/UberMoveBold.otf'));

    // NOTE: This endpoint uses the local 'UberMove' font.
    // Korean characters will render as tofu (plain boxes) because UberMove does not support them.
    // To support Korean, please download 'NotoSansKR-Bold.otf' (or similar) to 'public/fonts/'
    // and add it to the fonts array in the satori options below.

    const markup = html`
    <div style="display: flex; flex-direction: column; height: 100%; width: 100%; background-color: #121212; color: white; padding: 80px; justify-content: space-between; font-family: 'UberMove', sans-serif;">
      <div style="display: flex; flex-direction: column;">
        <div style="font-size: 32px; color: #a1a1aa; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;">
            ${date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
        </div>
        <div style="font-size: 72px; font-weight: bold; line-height: 1.1; display: flex;">
            ${title}
        </div>
      </div>

      <div style="display: flex; gap: 20px;">
        ${tags && tags.map((tag: string) => html`<div style="padding: 10px 24px; background-color: #333; border-radius: 100px; font-size: 28px; color: #e4e4e7;">#${tag}</div>`)}
      </div>
      
      <div style="position: absolute; bottom: 80px; right: 80px; font-size: 32px; color: #71717a;">
          023-dev.github.io
      </div>
    </div>
  `;

    const svg = await satori(markup as any, {
        width: 1200,
        height: 630,
        fonts: [
            {
                name: 'UberMove',
                data: fontData,
                weight: 700,
                style: 'normal',
            }
        ],
    });

    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer as any, {
        headers: {
            'Content-Type': 'image/png',
        },
    });
}

export async function getStaticPaths() {
    const posts = await getCollection('blog');
    return posts.map((post) => ({
        params: { slug: post.slug },
        props: post.data,
    }));
}
