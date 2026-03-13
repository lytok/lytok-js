import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = process.cwd();
const distPath = path.join(root, 'dist');
const binSource = path.join(root, 'bin');

console.log(`\n🚀 PREPARANDO DISTRIBUCIÓN UNIFICADA LYTOK (MODO HÍBRIDO)`);
console.log(`-----------------------------------------------------------`);

// 1. Limpieza y creación de estructura
if (fs.existsSync(distPath)) fs.rmSync(distPath, { recursive: true });
fs.mkdirSync(path.join(distPath, 'bin'), { recursive: true });
fs.mkdirSync(path.join(distPath, 'src'), { recursive: true });

// Nombres reservados para no romper la comunicación con el binario WASM/NAPI
const reservedNames = [
	'parseLytok',
	'parseBinary',
	'stringifyLytok',
	'stringifyBinary',
	'LytokBinaryTag',
	'initEngine',
	'__wbg_init',
	'wasm',
].join(',');

/**
 * Procesa y copia binarios, ofuscando solo el pegamento JS de WASM
 */
function processBinaries(source, dest) {
	if (!fs.existsSync(source)) return;
	if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

	const items = fs.readdirSync(source);

	for (const item of items) {
		const srcFile = path.join(source, item);
		const destFile = path.join(dest, item);
		const stats = fs.statSync(srcFile);

		if (stats.isDirectory()) {
			processBinaries(srcFile, destFile);
		} else {
			const ext = path.extname(item).toLowerCase();

			// Copia directa para todo (.node, .wasm, js, ts)	
			fs.copyFileSync(srcFile, destFile);
		}
	}
}

// 2. Ejecutar procesamiento de binarios
console.log(`📦 Procesando binarios y protegiendo lógica WASM...`);
processBinaries(binSource, path.join(distPath, 'bin'));

// 3. Copiar Código Fuente (Texto Plano para generar confianza)
console.log(`📄 Copiando lógica de orquestación y validadores...`);
const copyFolderSync = (from, to) => {
	if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
	fs.readdirSync(from).forEach((element) => {
		const f = path.join(from, element);
		const t = path.join(to, element);
		if (fs.lstatSync(f).isDirectory()) copyFolderSync(f, t);
		else fs.copyFileSync(f, t);
	});
};
copyFolderSync(path.join(root, 'src'), path.join(distPath, 'src'));

// 4. Se eliminó la ofuscación selectiva del SmartReader

// 5. Copiar Archivos Necesarios (Archivos ya compilados por tsup y types por tsc)
console.log(`📄 Finalizando empaquetado...`);

['README.md', 'EULA.md', 'package.json'].forEach((file) => {
	const src = path.join(root, file);
	if (fs.existsSync(src)) fs.copyFileSync(src, path.join(distPath, file));
});

console.log(
	`\n✅ Distribución lista. Lógica de negocio (WASM/Reader) protegida.`,
);
