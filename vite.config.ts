import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Local Real Market bridge:
// - Browser calls /securepay-api/* on the same Vite origin.
// - Vite forwards those requests to the local SecurePayAPI on :8080.
// - The /securepay-api prefix is removed before forwarding, so
//   /securepay-api/api/v1/auth/login -> http://localhost:8080/api/v1/auth/login.
// Production/staging deployments should set VITE_SECUREPAY_API_BASE_URL to the
// approved external API origin instead of relying on this development proxy.
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/securepay-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/securepay-api/, ''),
      },
    },
  },
});
