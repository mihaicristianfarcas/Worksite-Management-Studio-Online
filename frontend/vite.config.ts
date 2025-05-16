import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '')

  // Set the API URL to the backend URL hardcoded
  env.VITE_API_URL = 'https://backend-c9ng.onrender.com/api'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    // Base public path when served in production
    base: '/',
    // Build configuration
    build: {
      // Output directory for production build
      outDir: 'dist',
      // Minify for production
      minify: 'terser',
      // Add source maps for debugging
      sourcemap: mode !== 'production',
      // Enable/disable CSS code splitting
      cssCodeSplit: true,
      // Terser options
      terserOptions: {
        compress: {
          // Remove console.log in production
          drop_console: mode === 'production'
        }
      },
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000
    },
    // Server configuration
    server: {
      // Configure CORS for development server
      cors: true,
      // Set port
      port: 5173
    }
  }
})
