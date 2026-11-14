import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'reject-runtime-mocks',
        apply: 'build',
        moduleParsed({ id }) {
          const normalized = id.replaceAll('\\', '/')
          if (
            normalized.includes('/src/') &&
            (normalized.includes('/mock/') || /mockEmailGateway/.test(normalized))
          ) {
            this.error('Dados simulados não podem integrar o bundle de produção.')
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: { sourcemap: false },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
