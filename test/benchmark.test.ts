import { LYTOK } from '../index.js';
import fs from 'fs';
import path from 'path';
import { encoding_for_model } from 'tiktoken';

/**
 * LYTOK PERFORMANCE & ROI BENCHMARK
 * Compara JSON vs LYTOK (Min, Formatted, Binary).
 */

const enc = encoding_for_model('gpt-4o');
const PRICE_PER_1M_TOKENS_USD = 5.0;
const NETWORK_SPEED_MBPS = 20;

const countTokens = (text: string) => {
	const tokens = enc.encode(text);
	return tokens.length;
};

const calculateDownloadTime = (bytes: number) => {
	const bits = bytes * 8;
	const speedBps = NETWORK_SPEED_MBPS * 1_000_000;
	return (bits / speedBps) * 1000;
};

const runBenchmark = (jsonData: any, schemaName: string, typeLabel: string) => {
	console.log(`\n🚀 BENCHMARK LYTOK: ${typeLabel.toUpperCase()}`);
	console.log(`📋 Escenario: ${schemaName} | Registros: ${jsonData.length}`);
	console.log(`🌐 Red Simulada: ${NETWORK_SPEED_MBPS} Mbps`);
	console.log(`----------------------------------------------------------`);

	const iterations = 100;


	const jsonString = JSON.stringify(jsonData);
	const byteJSON = Buffer.byteLength(jsonString);

	const lytokMin = LYTOK.stringify(jsonData, false);
	const byteMin = Buffer.byteLength(lytokMin);

	const lytokFormatted = LYTOK.stringify(jsonData, true);
	const byteFormatted = Buffer.byteLength(lytokFormatted);

	const lytokBin = LYTOK.encode(jsonData);
	const byteBin = lytokBin.byteLength;


	const startJSON = performance.now();
	for (let i = 0; i < iterations; i++) JSON.parse(jsonString);
	const timeJSON = (performance.now() - startJSON) / iterations;

	const startForm = performance.now();
	for (let i = 0; i < iterations; i++) {
		LYTOK.parse(lytokFormatted, true);
	}
	const timeForm = (performance.now() - startForm) / iterations;

	const startMin = performance.now();
	for (let i = 0; i < iterations; i++) {
		LYTOK.parse(lytokMin, false);
	}
	const timeMin = (performance.now() - startMin) / iterations;

	const startBin = performance.now();
	for (let i = 0; i < iterations; i++) {
		LYTOK.parse(lytokBin);
	}
	const timeBin = (performance.now() - startBin) / iterations;


	const dlJSON = calculateDownloadTime(byteJSON);
	const dlMin = calculateDownloadTime(byteMin);
	const dlFormatted = calculateDownloadTime(byteFormatted);
	const dlBin = calculateDownloadTime(byteBin);

	const tkJSON = countTokens(jsonString);
	const tkMin = countTokens(lytokMin);
	const tkFormatted = countTokens(lytokFormatted);

	const calculateCost = (tokens: number) =>
		((tokens / 1_000_000) * PRICE_PER_1M_TOKENS_USD * 1000).toFixed(2);

	const savingPerc = (cur: number, orig: number) =>
		(((orig - cur) / orig) * 100).toFixed(2) + '%';

	const uxJSON = dlJSON + timeJSON;
	const uxForm = dlFormatted + timeForm;
	const uxMin = dlMin + timeMin;
	const uxBin = dlBin + timeBin;


	const results = [
		{
			Formato: 'JSON Minificado',
			Bytes: byteJSON,
			'T. Descarga': `${dlJSON.toFixed(2)}ms`,
			'T. Proc Local': `${timeJSON.toFixed(3)}ms`,
			'UX Total': `${uxJSON.toFixed(2)}ms`,
			'% Perf': 'Baseline',
			Tokens: tkJSON,
			'Ahorro Tkn': '0.00%',
			'Costo (1M Req)': `$${calculateCost(tkJSON)}`,
		},
		{
			Formato: 'LYTOK Formatted',
			Bytes: byteFormatted,
			'T. Descarga': `${dlFormatted.toFixed(2)}ms`,
			'T. Proc Local': `${timeForm.toFixed(3)}ms`,
			'UX Total': `${uxForm.toFixed(2)}ms`,
			'% Perf': savingPerc(uxForm, uxJSON),
			Tokens: tkFormatted,
			'Ahorro Tkn': savingPerc(tkFormatted, tkJSON),
			'Costo (1M Req)': `$${calculateCost(tkFormatted)}`,
		},
		{
			Formato: 'LYTOK Minificado',
			Bytes: byteMin,
			'T. Descarga': `${dlMin.toFixed(2)}ms`,
			'T. Proc Local': `${timeMin.toFixed(3)}ms`,
			'UX Total': `${uxMin.toFixed(2)}ms`,
			'% Perf': savingPerc(uxMin, uxJSON),
			Tokens: tkMin,
			'Ahorro Tkn': savingPerc(tkMin, tkJSON),
			'Costo (1M Req)': `$${calculateCost(tkMin)}`,
		},
		{
			Formato: 'LYTOK Binario',
			Bytes: byteBin,
			'T. Descarga': `${dlBin.toFixed(2)}ms`,
			'T. Proc Local': `${timeBin.toFixed(3)}ms`,
			'UX Total': `${uxBin.toFixed(2)}ms`,
			'% Perf': savingPerc(uxBin, uxJSON),
			Tokens: '---',
			'Ahorro Tkn': 'N/A (Bin)',
			'Costo (1M Req)': `---`,
		},
	];

	console.table(results);


	console.log(`📦 COMPARATIVA DE CARGA (PAYLOAD):`);
	console.log(
		`   🔹 Binario vs JSON:     ${savingPerc(byteBin, byteJSON)} de reducción.`,
	);
	console.log(
		`   🔹 Binario vs LTK Min:  ${savingPerc(byteBin, byteMin)} de reducción.`,
	);
}

function main() {
	try {
		const fixturesDir = 'test/fixtures';


		const uniformPath = path.resolve(fixturesDir, 'ejemplo1000.json');
		if (fs.existsSync(uniformPath)) {
			const uniformData = JSON.parse(fs.readFileSync(uniformPath, 'utf8'));
			runBenchmark(uniformData, 'loteProduccion', 'Datos Uniformes');
		}


		const plainPath = path.resolve(fixturesDir, 'ejemploPlano1000.json');
		if (fs.existsSync(plainPath)) {
			const plainData = JSON.parse(fs.readFileSync(plainPath, 'utf8'));
			runBenchmark(plainData, 'dataPlana', 'Datos Planos');
		}

		enc.free();
	} catch (e: any) {
		console.error('❌ Error en ejecución del benchmark:', e.message);
	}
}

main();
