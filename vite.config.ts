import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { imagetools } from "vite-imagetools";
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
  const port = Number(process.env.VITE_PORT) ?? 5173;
  return {
    plugins: [qwikCity(), qwikVite(), tsconfigPaths(), imagetools()],
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
      hmr: { clientPort: port },
      port,
      strictPort: true,
      host: "0.0.0.0"
    },
    server: {
      hmr: { clientPort: port },
      port,
      strictPort: true,
      host: "0.0.0.0"
    }
  };
});
