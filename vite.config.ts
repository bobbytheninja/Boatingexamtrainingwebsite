import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Makes the Tailwind CSS link non-blocking so it no longer delays FCP.
// The browser downloads CSS in parallel with JS; `onload` swaps it to a
// real stylesheet once available. FOUC is negligible since #root is empty
// until React mounts, and React's JS is several times larger than the CSS,
// so the stylesheet effectively always wins that race.
//
// fetchpriority="high" matters here: a `preload as=style` is given lower
// priority than a render-blocking stylesheet would be. On a repeat visit
// (JS served from cache, CSS revalidating) that gap is the only realistic
// window for a flash, so we ask the browser to treat it as urgent.
function nonBlockingCSSPlugin() {
  return {
    name: 'non-blocking-css',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      return html.replace(
        /<link rel="stylesheet"(\s[^>]*)?href="([^"]+\.css)"([^>]*)>/g,
        (_, before = '', href, after = '') =>
          `<link rel="preload" as="style" fetchpriority="high"${before}href="${href}"${after} onload="this.onload=null;this.rel='stylesheet'">` +
          `<noscript><link rel="stylesheet"${before}href="${href}"${after}></noscript>`
      );
    },
  };
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    nonBlockingCSSPlugin(),
  ],
  // Point to the correct public directory
  publicDir: path.resolve(__dirname, './src/app/public'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
