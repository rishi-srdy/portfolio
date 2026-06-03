// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(),
  fonts: [
    { provider: fontProviders.fontsource(), name: 'Space Grotesk', cssVariable: '--font-display', weights: [400, 500, 600, 700], styles: ['normal'] },
    { provider: fontProviders.fontsource(), name: 'Geist', cssVariable: '--font-body', weights: [400, 500, 600], styles: ['normal'] },
    { provider: fontProviders.fontsource(), name: 'Geist Mono', cssVariable: '--font-mono', weights: [400, 500], styles: ['normal'] },
  ],
});