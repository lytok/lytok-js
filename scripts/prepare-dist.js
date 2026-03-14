import fs from 'fs';
import path from 'path';

const root = process.cwd();
const distPath = path.join(root, 'dist');

console.log(`\n🚀 PREPARANDO DISTRIBUCIÓN FLATTENED LYTOK (MODO PUBLICACIÓN)`);
console.log(`-----------------------------------------------------------`);

// 1. Asegurar estructura (NO borrar dist, tsup ya escribió ahí)
if (!fs.existsSync(distPath)) fs.mkdirSync(distPath);
if (!fs.existsSync(path.join(distPath, 'src'))) fs.mkdirSync(path.join(distPath, 'src'), { recursive: true });

// 2. Copiar Código Fuente a dist/src
console.log(`📄 Copiando lógica src a dist/src...`);
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

// 3. Generar package.json FLATTENED para publicación
console.log(`📝 Generando package.json aplanado en dist/`);
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));

// Modificar rutas para que apunten a la raíz del paquete publicado
pkg.main = "./index.js";
pkg.module = "./index.js";
pkg.types = "./index.d.ts";
pkg.exports = {
  ".": {
    "types": "./index.d.ts",
    "browser": "./index.js",
    "node": "./index.js",
    "default": "./index.js"
  }
};

// Eliminar scripts innecesarios en el paquete publicado
delete pkg.scripts;
delete pkg.devDependencies;

// Ajustar el mapeo de browser si existe
if (pkg.browser) {
  pkg.browser = {
    "./src/bridge.js": "./src/browser_bridge.js"
  };
}

// El campo 'files' se puede simplificar o eliminar ya que publicaremos el contenido de dist
pkg.files = ["*"];

fs.writeFileSync(path.join(distPath, 'package.json'), JSON.stringify(pkg, null, 2));

// 4. Copiar Archivos Necesarios
console.log(`📄 Copiando README, LICENCIA y EULA a dist/`);
['README.md', 'EULA.md', 'LICENSE'].forEach((file) => {
	const src = path.join(root, file);
	if (fs.existsSync(src)) fs.copyFileSync(src, path.join(distPath, file));
});

console.log(`\n✅ Distribución aplanada lista en carpeta /dist.`);
console.log(`💡 Para publicar: cd dist && npm publish\n`);
