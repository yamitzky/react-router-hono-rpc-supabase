import build from '@hono/vite-build'
import devServer, { defaultOptions } from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/node'
import { reactRouter } from '@react-router/dev/vite'
import autoprefixer from 'autoprefixer'
import { fileURLToPath } from 'node:url'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  if (mode === 'hono') {
    return {
      build: {
        copyPublicDir: false,
      },
      plugins: [
        build({
          entry: './server.ts',
          outputDir: './build',
          external: ['react', 'react-dom', fileURLToPath(new URL('./build/server/index.js', import.meta.url))],
          minify: false,
          emptyOutDir: false,
        }),
      ],
    }
  }
  return {
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
    plugins: [
      reactRouter(),
      tsconfigPaths(),
      devServer({
        adapter,
        entry: 'server.ts',
        exclude: [...defaultOptions.exclude, '/assets/**', '/app/**'],
        injectClientScript: false,
      }),
    ],
  }
})
