import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    // Base public path when served in production
    base: '/',
    // Define environment variables to expose to the client
    define: {
      'process.env': process.env
    },
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
