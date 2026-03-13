// index.d.ts

/**
 * Serializa datos a formato LYTOK (.ltk text format).
 * @param data - El objeto o arreglo a serializar.
 * @param format - Si es verdadero, aplica indentación.
 */
export function stringify<T>(data: T, format?: boolean): string;

/**
 * Serializa datos a formato LYTOK Binario.
 * @param data - El objeto o arreglo a serializar.
 */
export function encode<T>(data: T): Uint8Array;

/**
 * Parsea contenido LYTOK y retorna el objeto original.
 * @param input - String (.ltk) o Buffer binario.
 * @param formatted - (Solo texto) Indica si el string está formateado/indentado.
 */
export function parse<T = any>(input: string | Uint8Array, formatted?: boolean): T;

/**
 * Configura un mapa de compresión personalizado para el motor de LYTOK.
 * @param map - El buffer binario del mapa custom (Uint8Array generado o cargado externamente).
 */
export function SetCustomMap(map: Uint8Array, version: number): void;

/**
 * Restablece y elimina el diccionario de cadenas customizadas del motor de LYTOK.
 */
export function ResetCustomMap(): void;

/**
 * Valida la integridad de los datos comparando el original con el resultado del parseo.
 */
export function validate(original: any, parsed: any): boolean;

declare const LYTOK: {
    stringify: typeof stringify;
    encode: typeof encode;
    parse: typeof parse;
    SetCustomMap: typeof SetCustomMap;
    ResetCustomMap: typeof ResetCustomMap;
    validate: typeof validate;
};

export default LYTOK;