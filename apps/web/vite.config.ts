import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = mode === 'development' ? loadEnv(mode, process.cwd(), '') : {}
  const isEmbedBuild = process.env.BUILD_TARGET === 'embed'

  return {
    clearScreen: false,
    logLevel: 'info',
    server: {
      port: Number(env.PORT) || 3000,
      proxy: {
        '/api': {
          target: env.API_ROOT,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    plugins: [react()],
    ...(isEmbedBuild
      ? {
          define: {
            'process.env': {},
            process: 'process',
          },
        }
      : {}),
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        ...(isEmbedBuild
          ? {
              process: 'process/browser',
            }
          : {}),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['mixed-decls'],
          api: 'modern',
        },
      },
    },
    build: {
      emptyOutDir: false,
      ...(isEmbedBuild
        ? {
            sourcemap: true,
            outDir: 'dist',
            lib: {
              entry: resolve(__dirname, 'src/embed/main.tsx'),
              name: 'ResourceEmbed',
              formats: ['iife'],
              fileName: () => `embed.js`,
            },
            rollupOptions: {
              output: {
                globals: {
                  react: 'React',
                  'react-dom': 'ReactDOM',
                },
              },
            },
          }
        : {}),
    },
  }
})
