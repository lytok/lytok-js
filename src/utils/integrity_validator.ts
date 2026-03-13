export function validateIntegrity(original: any, parsed: any, context: string = ''): boolean {
	const errors: string[] = [];

	function compare(a: any, b: any, path: string) {
		if ((a === undefined && b === null) || (a === null && b === undefined)) {
			return;
		}

		if (typeof a !== typeof b) {
			errors.push(
				`[TYPE_MISMATCH] en ${path}: Original era ${typeof a} (${a}), Parsed es ${typeof b} (${b})`,
			);
			return;
		}

		if (a === null || b === null) {
			if (a !== b)
				errors.push(`[VALUE_MISMATCH] en ${path}: Uno es null y el otro no.`);
			return;
		}

		if (a instanceof Date) {
			if (!(b instanceof Date) || a.getTime() !== b.getTime()) {
				errors.push(
					`[DATE_MISMATCH] en ${path}: ${a.toISOString()} vs ${b?.toISOString ? b.toISOString() : b}`,
				);
			}
			return;
		}

		if (Array.isArray(a)) {
			if (!Array.isArray(b)) {
				errors.push(`[STRUCT_MISMATCH] en ${path}: Se esperaba Array.`);
				return;
			}
			if (a.length !== b.length) {
				errors.push(
					`[LEN_MISMATCH] en ${path}: Original len ${a.length}, Parsed len ${b.length}`,
				);
			}
			for (let i = 0; i < Math.max(a.length, b.length); i++) {
				compare(a[i], b[i], `${path}[${i}]`);
			}
			return;
		}

		if (typeof a === 'object') {
			const keysA = Object.keys(a);
			const keysB = Object.keys(b);

			keysA.forEach((k) => {
				if (!(k in b)) {
					if (a[k] !== undefined) {
						errors.push(
							`[MISSING_KEY] en ${path}: Llave "${k}" no existe en el resultado.`,
						);
					}
				}
			});

			keysB.forEach((k) => {
				compare(a[k], b[k], `${path}.${k}`);
			});
			return;
		}

		if (a !== b) {
			errors.push(
				`[VALUE_MISMATCH] en ${path}: ${a} (${typeof a}) !== ${b} (${typeof b})`,
			);
		}
	}

	compare(original, parsed, 'root');

	if (errors.length === 0) {
		console.log(` ✅ [INTEGRIDAD OK]: ${context}`);
		return true;
	} else {
		console.error(` ❌ [ERROR DE INTEGRIDAD]: ${context}`);
		errors.forEach((e) => console.error(`    -> ${e}`));
		return false;
	}
}
