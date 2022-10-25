import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { readFileSync } from 'fs';
import YAML from 'yaml';
const { dashboard } = YAML.parse(readFileSync('./config.yml', 'utf8'));

export default defineConfig(() => {
  return {
    plugins: [qwikCity(), qwikVite(), tsconfigPaths()],
    build: {
        target: 'es2020'
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020'
      }
    },
    server: {
      hmr: { clientPort: 443 },
      port: dashboard.port,
      strictPort: true,
      host: 'localhost'
    }
  };
});
