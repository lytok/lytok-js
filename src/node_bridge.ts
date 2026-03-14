import { createRequire } from 'module';
import { platform, arch } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const isESM = typeof import.meta !== 'undefined' && import.meta.url;
const _require = isESM ? createRequire(import.meta.url) : require;

// Intentar localizar el paquete @lytok/core
let corePath: string;
try {
  // Encontrar el package.json de @lytok/core para obtener su directorio raíz
  const packagePath = _require.resolve('@lytok/core/package.json');
  corePath = path.dirname(packagePath);
} catch (e) {
  // Fallback a ruta relativa si falla el resolve (por ejemplo en entornos de vinculación complejos)
  const _dirname = isESM ? path.dirname(fileURLToPath(import.meta.url)) : __dirname;
  corePath = path.join(_dirname, '..', 'node_modules', '@lytok/core');
}

const platformMap: Record<string, string> = {
  'linux-x64': 'linux-x64',
  'win32-x64': 'win32-x64',
  'darwin-x64': 'darwin-x64',
  'darwin-arm64': 'darwin-arm64',
};

const currentKey = `${platform()}-${arch()}`;
const suffix = platformMap[currentKey] || currentKey;
const binaryPath = path.join(corePath, 'bin', 'node', `lytok.${suffix}.node`);

let bindings: any = null;

try {
  bindings = _require(binaryPath);
} catch (e: any) {
  console.error(`❌ LYTOK: Error cargando binario nativo en ${binaryPath}`);
  // Fallback mínimo para evitar crashes catastróficos al importar
  bindings = {};
}

const checkReady = () => {
  if (!bindings || Object.keys(bindings).length === 0) {
    throw new Error('❌ LYTOK: El motor nativo no se cargó correctamente. Revisa la instalación de @lytok/core.');
  }
};

export const stringify = (data: any, format?: boolean): string => {
  checkReady();
  return bindings.stringify(data, format);
};
export const encode = (data: any): Uint8Array => {
  checkReady();
  return bindings.encode(data);
};
export const compile = (input: string, formatted?: boolean): Uint8Array => {
  checkReady();
  return bindings.compile(input, formatted);
};
export const LytokSmartReader = bindings.LytokSmartReader;
export const setCustomMap = (mapData: Uint8Array, version: number): void => {
  checkReady();
  bindings.setCustomMap(mapData, version);
};
export const getCustomMap = (): { map: Uint8Array; version: number } => {
  checkReady();
  return bindings.getCustomMap();
};
export const resetCustomMap = (): void => {
  checkReady();
  bindings.resetCustomMap();
};

export const ready = async () => Promise.resolve();
