import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// The launcher page, built into one self-contained dist/index.html
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
});
