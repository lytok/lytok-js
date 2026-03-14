/**
 * Implementación del Bridge exclusiva para Navegador (WASM)
 * Soporte para Next.js y React sin Top-Level Await.
 */

let bindings: any = null;
let initPromise: Promise<void> | null = null;

/**
 * Espera a que el motor WASM esté completamente cargado.
 * Útil en Client Components de React/Next.js.
 */
export async function ready(): Promise<void> {
  if (bindings) return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // @ts-ignore
      const wasm = await import('@lytok/core/bin/wasm/lytok.js');
      if (typeof wasm.default === 'function') {
        // En bundlers modernos (Webpack/Next.js) se reemplaza esto por la URL estática final.
        // Si no hay bundler (como en tests crudos de navegador), esto producirá una URL inválida 
        // con '/@lytok/core/'. En ese caso, dejamos que wasm-bindgen resuelva nativamente.
        let wasmUrl: string | undefined = new URL('@lytok/core/bin/wasm/lytok_bg.wasm', import.meta.url).href;
        
        if (wasmUrl.includes('/@lytok/core/')) {
           wasmUrl = undefined;
        }

        const initArgs = wasmUrl ? { module_or_path: wasmUrl } : undefined;
        await (wasm.default as any)(initArgs);
      }
      bindings = wasm;
    } catch (err: any) {
      console.error('❌ LYTOK: Error cargando WebAssembly:', err);
      throw err;
    }
  })();

  return initPromise;
}

// Auto-inicialización al importar, sin bloquear (No Top-Level Await)
if (typeof window !== 'undefined' || typeof self !== 'undefined') {
  ready().catch(() => {});
}

const checkReady = () => {
  if (!bindings) {
    throw new Error('❌ LYTOK: El motor WASM aún no está listo. En el navegador, el motor se carga de forma asíncrona. Si necesitas usarlo inmediatamente al cargar la página, usa `await LYTOK.ready()`.');
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

/**
 * Wrapper para LytokSmartReader que asegura que el motor esté listo.
 */
export class LytokSmartReader {
  private instance: any;
  constructor(bytes: Uint8Array) {
    checkReady();
    this.instance = new bindings.LytokSmartReader(bytes);
  }
  decode() {
    return this.instance.decode();
  }
}

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
