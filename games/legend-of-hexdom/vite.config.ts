import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { buildStamp } from '../../scripts/build-stamp.mjs';

// Builds the whole game into one self-contained dist/index.html
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  // Which build a screenshot came from. See scripts/build-stamp.mjs for why.
  define: { __BUILD__: JSON.stringify(buildStamp()) },
});
