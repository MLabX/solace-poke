import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // Vite options tailored for this project
    define: {
      // Make env variables available to the client
      'process.env': env
    },
    server: {
      // This ensures that the browser opens when you run npm run dev
      open: true,
      // This sets up the dev server to proxy API requests to our backend
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5050',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
