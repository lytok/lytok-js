import util from 'util';
import fs from 'fs';
import path from 'path';
import { LYTOK } from '../index.js';

import { LytokSmartReader } from '../src/utils/smart_reader.js';

/**
 * Validador de Integridad Estricta
 */
const validateIntegrity = (original, parsed, context = 'General') => {
	if (original.length !== parsed.length) {
		console.error(
			`❌ [${context}] Error de longitud: Original ${original.length} vs Parsed ${parsed.length}`,
		);
		return false;
	}

	for (let i = 0; i < original.length; i++) {
		if (!util.isDeepStrictEqual(original[i], parsed[i])) {
			console.error(`❌ [${context}] Integridad fallida en el registro #${i}`);
			console.log(
				'Esperado:',
				JSON.stringify(
					original[i],
					(k, v) => (typeof v === 'bigint' ? v.toString() : v),
					2,
				),
			);
			console.log('Obtenido:', JSON.stringify(parsed[i], null, 2));
			return false;
		}
	}

	console.log(`✅ [${context}] ¡Integridad de datos confirmada al 100%!`);
	return true;
};

const jsonPath = path.resolve('test/fixtures/ejemplo1000.json');
const originalData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function runBenchmark() {
	console.log(
		`🚀 Iniciando pruebas con dataset de ${originalData.length} registros...`,
	);

	const startBin = performance.now();
	const binaryLtk = await LYTOK.stringify(originalData, {
		binary: true,
	});
	const endBin = performance.now();
	console.log(
		`⚡ LYTOK stringify (Binary): ${(endBin - startBin).toFixed(3)}ms`,
	);

	const startParse = performance.now();
	const parsedData = await LYTOK.parse(binaryLtk);
	const endParse = performance.now();
	console.log(
		`⚡ LYTOK parse (Direct): ${(endParse - startParse).toFixed(3)}ms`,
	);

	validateIntegrity(originalData, parsedData, 'Dataset 1000');

	console.log(`\n🧪 Estresando LytokSmartReader (100 iteraciones)...`);
	let stressParsed;
	const stressStart = performance.now();
	for (let i = 0; i < 100; i++) {
		const reader = new LytokSmartReader(binaryLtk);
		stressParsed = reader.parse();
	}
	const stressEnd = performance.now();
	console.log(
		`Tiempo Promedio Reader: ${((stressEnd - stressStart) / 100).toFixed(3)}ms`,
	);

	const complexData = [
		{
			id: 125853265656235595232n,
			nombre: 'P|rueba',
			ocupacion: 'Estudiante`',
			activo: true,
			fecNac: new Date('1995-10-15'),
			edad: 28,
			fecGraduacion: null,
			fecRegistro: '2023-05-20',
			puntuaciones: [85, 90, 78],
			amigos: ['p|edro', 'lucia', 15, true],
			padres: {},
			hermanos: [],
			mascotas: null,
			comidaFavorita: 'machaca',
			seriesFavoritas: ['Breaking Bad', 'Game of Thrones', 'The Office'],
			hobbies: ['futbol', 'lectura', 'cine'],
			direccion: { calle: 'Calle Falsa 123', ciudad: 'CDMX', pais: 'MX' },
		},
		{
			id: 125853265656235595232n,
			nombre: ' P``rueba',
			fecNac: new Date('1995-10-15'),
			ocupacion: '``Estudiante```',
			activo: true,
			edad: 28,
			comidaFavorita: ' machaca',
			seriesFavoritas: [
				'Breaking Bad ',
				'Game of Thrones',
				'The Office',
				{ name: 'las pistas de blu|e', fechaEmision: new Date() },
			],
			fecGraduacion: null,
			fecRegistro: '2023-05-20',
			puntuaciones: [85, 90, 78],
			amigos: ['p|edro', 'l$ucia', 15, true],
			padres: {},
			hermanos: [],
			mascotas: ['firulais`{}[]^|$;'],
			hobbies: ['futbol', 'lectura', 'cine'],
			direccion: { calle: 'Calle Falsa 123 ', ciudad: 'CDMX', pais: 'MX' },
		},
	];

	console.log(`\n🧪 Probando tipos complejos y autodelimitación...`);
	const complexBin = await LYTOK.stringify(complexData, {
		binary: true,
	});
	const complexParsed = await LYTOK.parse(complexBin);

	validateIntegrity(complexData, complexParsed, 'Tipos Complejos');
}

runBenchmark().catch(console.error);
