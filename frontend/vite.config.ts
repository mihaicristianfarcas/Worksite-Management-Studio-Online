import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables for the current mode (development | production)
  const env = loadEnv(mode, process.cwd())

  // Set the API URL to the backend URL hardcoded because it does not read?
  env.VITE_API_URL = 'https://backend-c9ng.onrender.com/api'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 5173,
      cors: true
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: 'terser',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      terserOptions: {
        compress: {
          drop_console: mode === 'production'
        }
      }
    }
  }
})
