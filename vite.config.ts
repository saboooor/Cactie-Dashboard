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
        target: 'es2022'
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2022'
      }
    },
    server: {
      hmr: {
        clientPort: dashboard.domain.endsWith(`:${dashboard.port}`) ? dashboard.port : 443
      },
      port: dashboard.port,
      strictPort: true,
      host: '0.0.0.0'
    }
  };
});
