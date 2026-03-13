import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts', 'src/**/*.ts'],
  format: ['esm'],
  dts: true,
  bundle: false,
  clean: true,
  minify: false,
  splitting: false,
  target: 'esnext',
  outDir: 'dist',
  shims: true,
  esbuildOptions(options: any) {
    options.logOverride = {
      'empty-import-meta': 'silent',
    };
  },
});
