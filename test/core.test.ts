import fs from 'fs';
import path from 'path';
import { LYTOK } from '../index.js';

/**
 * Ejecuta la suite de pruebas de forma síncrona pura
 */

function setCustomMap() {
	const map: Uint8Array = new Uint8Array([
		0x72, 0x6f, 0x6c, 0x04, 0x78, 0x0e, 0x27, 0xb3, 0xf9, 0xfa, 0xba, 0x76, 0xae,
		0xf7, 0xf3, 0x70,
	]);
	const versionMap: number = 1;

	LYTOK.SetCustomMap(map, versionMap);
}

function runLoteTest() {
	try {
		const jsonPath = path.resolve('test/fixtures/ejemplo1000.json');
		const originalData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

		console.log(`📦 Dataset: ${originalData.length} registros.`);


		const startBin = performance.now();
		const binaryLtk = LYTOK.encode(originalData);
		console.log(
			`⚡ Binary Encode: ${(performance.now() - startBin).toFixed(3)}ms | ${binaryLtk.length} bytes`,
		);

		const startMin = performance.now();
		const minifiedLtk = LYTOK.stringify(originalData, false);
		console.log(
			`⚡ Minified Stringify: ${(performance.now() - startMin).toFixed(3)}ms | ${Buffer.byteLength(minifiedLtk)} bytes`,
		);

		const startForm = performance.now();
		const formattedLtk = LYTOK.stringify(originalData, true);
		console.log(
			`⚡ Formatted Stringify: ${(performance.now() - startForm).toFixed(3)}ms | ${Buffer.byteLength(formattedLtk)} bytes`,
		);




		const pBinStart = performance.now();
		const parsedFromBin = LYTOK.parse(binaryLtk);
		console.log(
			`\n⚡ Parse (Binary): ${(performance.now() - pBinStart).toFixed(3)}ms`,
		);
		LYTOK.validate(originalData, parsedFromBin);



		const pMinStart = performance.now();
		const parsedFromMin = LYTOK.parse(minifiedLtk, false);
		console.log(
			`⚡ Parse (Minified): ${(performance.now() - pMinStart).toFixed(3)}ms`,
		);
		LYTOK.validate(originalData, parsedFromMin);


		const pFormStart = performance.now();
		const parsedFromForm = LYTOK.parse(formattedLtk, true);
		console.log(
			`⚡ Parse (Formatted): ${(performance.now() - pFormStart).toFixed(3)}ms`,
		);
		LYTOK.validate(originalData, parsedFromForm);


		console.log('\n🧪 Benchmark: LytokSmartReader (100 iteraciones)...');
		const startReader = performance.now();
		for (let i = 0; i < 100; i++) {
			LYTOK.parse(binaryLtk);
		}
		console.log(
			`Avg Reader: ${((performance.now() - startReader) / 100).toFixed(3)}ms`,
		);


		console.log('\n🧪 Benchmark: JSON Nivel de JS vs Motor Rust...');
		const jsonString = JSON.stringify(originalData);
		const startJson = performance.now();
		for (let i = 0; i < 100; i++) {
			JSON.parse(jsonString);
		}
		console.log(
			`Avg JSON.parse: ${((performance.now() - startJson) / 100).toFixed(3)}ms`,
		);

	} catch (err) {
		console.error('💥 Error en la suite:', err);
	}
}

setCustomMap();
runLoteTest();
