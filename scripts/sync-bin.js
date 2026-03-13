/**
 * sync-bin.js
 * Copia los binarios compilados del motor lytok al SDK lytok-js.
 * Ejecutar antes de cada build/release: npm run sync:bin
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const motorRoot = path.resolve(root, '..', 'lytok');

const SOURCES = [
	// [origen en lytok, destino en lytok-js]
	// NAPI binarios por plataforma
	{ from: 'dist/node/lytok.linux-x64-gnu.node', to: 'bin/node/lytok.linux-x64.node' },
	{ from: 'dist/node/lytok.darwin-x64.node',    to: 'bin/node/lytok.darwin-x64.node' },
	{ from: 'dist/node/lytok.win32-x64-msvc.node',to: 'bin/node/lytok.win32-x64.node' },
	// Bridge JS y tipos NAPI
	{ from: 'dist/node/index.js',                  to: 'bin/node/index.js' },
	{ from: 'dist/node/index.d.ts',                to: 'bin/node/index.d.ts' },
	// WASM
	{ from: 'dist/wasm/lytok_bg.wasm',             to: 'bin/wasm/lytok_bg.wasm' },
	{ from: 'dist/wasm/lytok.js',                  to: 'bin/wasm/lytok.js' },
	{ from: 'dist/wasm/lytok.d.ts',                to: 'bin/wasm/lytok.d.ts' },
];

let copied = 0;
let skipped = 0;

console.log('🔄 Sincronizando binarios del motor LYTOK...\n');

for (const { from, to } of SOURCES) {
	const src = path.join(motorRoot, from);
	const dest = path.join(root, to);

	if (!fs.existsSync(src)) {
		console.warn(`⚠️  No encontrado (skipping): ${from}`);
		skipped++;
		continue;
	}

	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.copyFileSync(src, dest);
	console.log(`  ✅ ${from.padEnd(45)} → ${to}`);
	copied++;
}

console.log(`\n📦 ${copied} archivo(s) copiado(s), ${skipped} omitido(s).`);

if (skipped > 0) {
	console.warn('\n⚠️  Algunos binarios no se encontraron. Asegúrate de haber compilado el motor con:');
	console.warn('   cd ../lytok && npm run build:node && npm run build:wasm\n');
}
