/**
 * Implementación del Bridge exclusiva para Navegador (WASM)
 */
let bindings: any = {};

async function init() {
  try {
    const wasm = await import('../bin/wasm/lytok.js');
    if (typeof wasm.default === 'function') {
      const wasmUrl = new URL('../bin/wasm/lytok_bg.wasm', import.meta.url).href;
      await wasm.default({ module_or_path: wasmUrl });
    }
    bindings = wasm;
  } catch (err: any) {
    console.error('❌ LYTOK: Error cargando WebAssembly:', err);
  }
}


await init();

export const stringify = (data: any, format?: boolean): string =>
  bindings.stringify?.(data, format);
export const encode = (data: any): Uint8Array => bindings.encode?.(data);
export const compile = (input: string, formatted?: boolean): Uint8Array =>
  bindings.compile?.(input, formatted);
export const LytokSmartReader = bindings.LytokSmartReader;
export const setCustomMap = (mapData: Uint8Array, version: number): void =>
  bindings.setCustomMap?.(mapData, version);
export const getCustomMap = (): { map: Uint8Array; version: number } =>
  bindings.getCustomMap?.();
export const resetCustomMap = (): void => bindings.resetCustomMap?.();
