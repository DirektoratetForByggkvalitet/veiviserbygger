import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = mode === 'development' ? loadEnv(mode, process.cwd(), '') : {}

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
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
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
  }
})
