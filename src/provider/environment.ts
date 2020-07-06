import type { TypeProvider } from './typedef';
import { BigIntType, BooleanType, FloatType, IntegerType } from './types';

const uint32be = new IntegerType(32, false, false);
const uint32le = new IntegerType(32, false, true);

export const defaultBuiltins = new Map<string, TypeProvider>([
	['bool', new BooleanType()],
	['float32be', new FloatType(32, false)],
	['float32le', new FloatType(32, true)],
	['float64be', new FloatType(64, false)],
	['float64le', new FloatType(64, true)],
	['sint8', new IntegerType(8, true)],
	['sint16be', new IntegerType(16, true, false)],
	['sint16le', new IntegerType(16, true, true)],
	['sint32be', new IntegerType(32, true, false)],
	['sint32le', new IntegerType(32, true, true)],
	['sint64be', new BigIntType(true, false)],
	['sint64le', new BigIntType(true, true)],
	['arrsizebe', uint32be],
	['arrsizele', uint32le],
	['uint8', new IntegerType(8, false)],
	['uint16be', new IntegerType(16, false, false)],
	['uint16le', new IntegerType(16, false, true)],
	['uint32be', uint32be],
	['uint32le', uint32le],
	['uint64be', new BigIntType(false, false)],
	['uint64le', new BigIntType(false, true)],
]);

const defaultOptions = new Map([
	['be', new Map([
		['float32', defaultBuiltins.get('float32be')],
		['float32', defaultBuiltins.get('float32be')],
		['float64', defaultBuiltins.get('float64be')],
		['sint16', defaultBuiltins.get('sint16be')],
		['sint32', defaultBuiltins.get('sint32be')],
		['sint64', defaultBuiltins.get('sint64be')],
		['arrsize', defaultBuiltins.get('arrsizebe')],
		['uint16', defaultBuiltins.get('uint16be')],
		['uint32', defaultBuiltins.get('uint32be')],
		['uint64', defaultBuiltins.get('uint64be')],
	])],
	['le', new Map([
		['float32', defaultBuiltins.get('float32le')],
		['float32', defaultBuiltins.get('float32le')],
		['float64', defaultBuiltins.get('float64le')],
		['sint16', defaultBuiltins.get('sint16le')],
		['sint32', defaultBuiltins.get('sint32le')],
		['sint64', defaultBuiltins.get('sint64le')],
		['arrsize', defaultBuiltins.get('arrsizele')],
		['uint16', defaultBuiltins.get('uint16le')],
		['uint32', defaultBuiltins.get('uint32le')],
		['uint64', defaultBuiltins.get('uint64le')],
	])],
]);

export class Environment {
	readonly builtins = new Map(defaultBuiltins);
	readonly types = new Map<string, TypeProvider>();
	readonly options = new Map(defaultOptions);

	constructor ({ clearBuiltins = false } = {}) {
		if (clearBuiltins) this.builtins.clear();
	}

	getType (name: string, fallback?: string): TypeProvider {
		const type = this.types.get(name) ?? this.builtins.get(name);
		if (type != null) return type;
		if (fallback != null) return this.getType(fallback);
		throw new Error('Type does not exist.');
	}

	applyOption (name: string): this {
		const option = this.options.get(name);

		if (option != null) {
			for (const [key, value] of option) {
				if (value == null) {
					this.builtins.delete(key);
				} else {
					this.builtins.set(key, value);
				}
			}
		}

		return this;
	}
}
