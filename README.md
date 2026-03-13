# LYTOK-JS:

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-Propietary-red)
![Platform](https://img.shields.io/badge/platform-Node.js_|_Browser-lightgrey)

### SDK Oficial de Serialización de Alta Densidad para JavaScript

**LYTOK-JS** es la implementación oficial para JavaScript del protocolo LYTOK. Diseñado para maximizar el ahorro de tokens en arquitecturas de IA y ofrecer un rendimiento nativo mediante un núcleo híbrido en Rust.

#### ⚠️ AVISO LEGAL: Al instalar, copiar o utilizar este SDK, aceptas de manera expresa los términos y condiciones establecidos en el [EULA.md](/EULA.md). Durante la fase de Early Access, el procesamiento es ilimitado.

## Características Principales

- **Eficiencia de Tokens:** Ahorro de hasta un ~50% en comparación con JSON para contextos de LLM.
- **Rendimiento Nativo:** Procesamiento directo a nivel de bits mediante binarios optimizados en Rust.
- **Tipado Real:** Soporte nativo para BigInt, Date y tipos numéricos de alta precisión.
- **Carga Inteligente:** Conmutación automática entre motor NAPI (Node.js) y WASM (Navegador).
- **Validación Integrada:** Herramientas para asegurar la integridad de datos post-proceso.
- **Diccionario Custom:** Soporte para mapas de compresión personalizados via `SetCustomMap`.

## 📦 Instalación

Instala el SDK desde el registro oficial de LYTOK:

```bash
npm install @lytok/js
```

## 🛠️ API de Referencia

El SDK expone seis métodos a través del objeto `LYTOK` (default export) o como named exports individuales.

### `stringify(data, format?): string`

Serializa datos a formato de texto LYTOK (`.ltk`).

```typescript
import LYTOK from '@lytok/js';

const data = { id: 1, user: 'Mike', active: true };

// Minificado (por defecto)
const ltkMin = LYTOK.stringify(data);

// Formateado / indentado
const ltkFormatted = LYTOK.stringify(data, true);
```

---

### `encode(data): Uint8Array`

Serializa datos directamente al formato **binario LYTOK**. Máximo rendimiento y la mayor reducción de payload.

```typescript
const binary: Uint8Array = LYTOK.encode(data);
```

---

### `parse(input, formatted?): T`

Parsea contenido LYTOK de vuelta a un objeto JavaScript. Acepta tanto texto (`.ltk`) como buffer binario (`Uint8Array`).

```typescript
// Desde texto minificado
const obj = LYTOK.parse(ltkMin);

// Desde texto formateado
const objFormatted = LYTOK.parse(ltkFormatted, true);

// Desde binario
const objFromBinary = LYTOK.parse(binary);
```

---

### `validate(original, parsed): boolean`

Valida la integridad de los datos comparando el objeto original con el resultado del parseo. Útil para testing y auditoría.

```typescript
const isValid = LYTOK.validate(data, objFromBinary);
console.log(isValid ? '✅ Integridad OK' : '❌ Error de integridad');
```

---

### `SetCustomMap(map: Uint8Array): void`

Configura un mapa de compresión personalizado para el motor LYTOK. Recibe el binario del mapa (`Uint8Array`) generado o cargado externamente.

```typescript
import { readFileSync } from 'fs';

// Cargar mapa custom desde disco (generado previamente por el motor)
const customMap: Uint8Array = new Uint8Array(readFileSync('./my_dict.ltk.bin'));
const versionMap: number = 1;
LYTOK.SetCustomMap(customMap, versionMap);

// A partir de aquí, stringify/encode/parse usarán el diccionario custom
const compressed = LYTOK.stringify(largeDataset);
```

---

### `ResetCustomMap(): void`

Restablece el motor al diccionario por defecto, eliminando cualquier mapa personalizado previo.

```typescript
LYTOK.ResetCustomMap();
```

---

## 🔄 Ejemplo Completo (Round-Trip)

```typescript
import LYTOK from '@lytok/js';

const data = {
	id: 125853265656235595232n, // BigInt nativo
	user: 'Mike',
	active: true,
	scores: [9.8, 7.5, 10.0],
	createdAt: new Date(),
};

// Serializar a binario
const binary = LYTOK.encode(data);

// Deserializar
const recovered = LYTOK.parse(binary);

// Validar integridad
const ok = LYTOK.validate(data, recovered);
console.log(ok ? '✅ Integridad OK' : '❌ Error');
```

## ⚖️ Licencia

Este SDK es **software propietario**.

- **Especificación LYTOK:** Apache License 2.0
- **Motor / SDK:** Propiedad privada de Jose Miguel Silva Castro (@joguel96).

---

**LYTOK: Eficiencia bruta a nivel de bit.** Maintainer: Jose Miguel Silva Castro ([@joguel96](https://www.github.com/joguel96))
