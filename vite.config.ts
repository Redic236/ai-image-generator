import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Explicit IPv4 bind — default "localhost" resolves to IPv6-only on
    // some Node 22 + Windows setups, which causes Chrome to ERR_ABORTED
    // when it retries over IPv4.
    host: '127.0.0.1',
    port: 5174,
    strictPort: false,
    open: false,
  },
});
