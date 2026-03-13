import { createRequire } from 'module';
import { platform, arch } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';


const isESM = typeof import.meta !== 'undefined' && import.meta.url;
const _dirname = isESM ? path.dirname(fileURLToPath(import.meta.url)) : __dirname;
const _require = isESM ? createRequire(import.meta.url) : require;

const platformMap: Record<string, string> = {
  'linux-x64': 'linux-x64',
  'win32-x64': 'win32-x64',
  'darwin-x64': 'darwin-x64',
  'darwin-arm64': 'darwin-arm64',
};

const currentKey = `${platform()}-${arch()}`;
const suffix = platformMap[currentKey] || currentKey;
const binaryPath = path.join(
  _dirname,
  '..',
  'bin',
  'node',
  `lytok.${suffix}.node`
);

let bindings: any = {};
try {
  bindings = _require(binaryPath);
} catch (e: any) {
  console.error(`❌ LYTOK: Error cargando binario nativo en ${binaryPath}`);
}

export const stringify = (data: any, format?: boolean): string =>
  bindings.stringify(data, format);
export const encode = (data: any): Uint8Array => bindings.encode(data);
export const compile = (input: string, formatted?: boolean): Uint8Array =>
  bindings.compile(input, formatted);
export const LytokSmartReader = bindings.LytokSmartReader;
export const setCustomMap = (mapData: Uint8Array, version: number): void =>
  bindings.setCustomMap(mapData, version);
export const getCustomMap = (): { map: Uint8Array; version: number } =>
  bindings.getCustomMap();
export const resetCustomMap = (): void => bindings.resetCustomMap();
