import { 
	stringify as stringifyNative, 
	compile, 
	encode as encodeNative, 
	LytokSmartReader, 
	setCustomMap as SetCustomMapNative, 
	resetCustomMap as ResetCustomMapNative,
	ready as ReadyNative
} from './bridge.js';
import { validateIntegrity } from './utils/integrity_validator.js';

/**
 * Espera a que el motor de LYTOK esté listo.
 * En Node.js resuelve inmediatamente. En el navegador espera a la carga del WASM.
 * @returns {Promise<void>}
 */
export async function ready(): Promise<void> {
	return ReadyNative();
}

/**
 * Serializa datos a formato LYTOK (.ltk text format).
 * @template T
 * @param {T} data El objeto o arreglo a serializar.
 * @param {boolean} [format=false] Si es verdadero, aplica indentación.
 * @returns {string} El texto serializado en formato LYTOK.
 */
export function stringify<T>(data: T, format?: boolean): string {
	return stringifyNative(data, format);
}

/**
 * Serializa datos a formato LYTOK Binario.
 * @template T
 * @param {T} data El objeto o arreglo a serializar.
 * @returns {Uint8Array} El buffer binario serializado.
 */
export function encode<T>(data: T): Uint8Array {
	return encodeNative(data);
}

/**
 * Parsea contenido LYTOK a objeto JavaScript.
 * Maneja tanto texto (.ltk) como binarios nativos.
 * @param {string | Uint8Array} input Contenido .ltk (string) o buffer binario.
 * @param {boolean} [formatted=false] (Solo texto) Indica si el string está formateado/indentado.
 * @returns {any} El objeto resultante del parseo.
 */
export function parse(input: string | Uint8Array, formatted?: boolean): any {
	let bytes: Uint8Array;
	if (typeof input === 'string') {
		bytes = compile(input, formatted);
	} else if (input instanceof Uint8Array || Buffer.isBuffer(input)) {
		bytes = input;
	} else {
		throw new Error('Formato de entrada no soportado. Debe ser string o Uint8Array.');
	}

	const reader = new LytokSmartReader(bytes);
	return reader.decode();
}

/**
 * Configura un mapa de compresión personalizado para el motor de LYTOK.
 * @param {Uint8Array} map El buffer binario del mapa custom generado o cargado externamente.
 */
export function SetCustomMap(map: Uint8Array, version: number): void {
	if (!version) {
		throw new Error('La versión del mapa es requerida.');
	}
	if (!map) {
		throw new Error('El mapa es requerido.');
	}
	SetCustomMapNative(map, version);
}

/**
 * Restablece y elimina el diccionario de cadenas customizadas del motor de LYTOK.
 */
export function ResetCustomMap(): void {
	ResetCustomMapNative();
}

/**
 * Valida la integridad de los datos comparando el original con el resultado del parseo.
 * @param {any} original El objeto o arreglo original.
 * @param {any} parsed El resultado obtenido tras parsear el LTK.
 * @returns {boolean}
 */
export function validate(original: any, parsed: any): boolean {
	return validateIntegrity(original, parsed);
}
