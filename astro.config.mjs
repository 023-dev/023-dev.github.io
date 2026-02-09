// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import node from '@astrojs/node';

import mdx from '@astrojs/mdx';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://old-023-dev.github.io',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap(), mdx(), react()],

  adapter: node({
    mode: 'standalone'
  })
});