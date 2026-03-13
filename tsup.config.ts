import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: false,
  splitting: false,
  target: 'es2020',
  outDir: 'dist',
  shims: true,
  esbuildOptions(options: any) {
    options.logOverride = {
      'empty-import-meta': 'silent',
    };
  },
});
