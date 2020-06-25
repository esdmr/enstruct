import {
	BigIntType, BooleanType, CharType, FloatType, IntegerType,
} from './types';
import { TypeProvider } from './typedef';

export const defaultBuiltins = new Map<string, TypeProvider>([
	['bool', new BooleanType()],
	['char8', new CharType(8)],
	['char16be', new CharType(16, 'BE')],
	['char16le', new CharType(16, 'LE')],
	['float32be', new FloatType(32, 'BE')],
	['float32le', new FloatType(32, 'LE')],
	['float64be', new FloatType(64, 'BE')],
	['float64le', new FloatType(64, 'LE')],
	['sint8', new IntegerType(8, 'BE', true)],
	['sint16be', new IntegerType(16, 'BE', true)],
	['sint16le', new IntegerType(16, 'LE', true)],
	['sint32be', new IntegerType(32, 'BE', true)],
	['sint32le', new IntegerType(32, 'LE', true)],
	['sint64be', new BigIntType(64, 'BE', true)],
	['sint64le', new BigIntType(64, 'LE', true)],
	['uint8', new IntegerType(8, 'BE', false)],
	['uint16be', new IntegerType(16, 'BE', false)],
	['uint16le', new IntegerType(16, 'LE', false)],
	['uint32be', new IntegerType(32, 'BE', false)],
	['uint32le', new IntegerType(32, 'LE', false)],
	['uint64be', new BigIntType(64, 'BE', false)],
	['uint64le', new BigIntType(64, 'LE', false)],
]);

const defaultOptions = new Map([
	['be', new Map([
		['char16', defaultBuiltins.get('char16be')],
		['float32', defaultBuiltins.get('float32be')],
		['float32', defaultBuiltins.get('float32be')],
		['float64', defaultBuiltins.get('float64be')],
		['sint16', defaultBuiltins.get('sint16be')],
		['sint32', defaultBuiltins.get('sint32be')],
		['sint64', defaultBuiltins.get('sint64be')],
		['sint8', defaultBuiltins.get('sint8be')],
		['uint16', defaultBuiltins.get('uint16be')],
		['uint32', defaultBuiltins.get('uint32be')],
		['uint64', defaultBuiltins.get('uint64be')],
		['uint8', defaultBuiltins.get('uint8be')],
	])],
	['le', new Map([
		['char16', defaultBuiltins.get('char16le')],
		['float32', defaultBuiltins.get('float32le')],
		['float32', defaultBuiltins.get('float32le')],
		['float64', defaultBuiltins.get('float64le')],
		['sint16', defaultBuiltins.get('sint16le')],
		['sint32', defaultBuiltins.get('sint32le')],
		['sint64', defaultBuiltins.get('sint64le')],
		['sint8', defaultBuiltins.get('sint8le')],
		['uint16', defaultBuiltins.get('uint16le')],
		['uint32', defaultBuiltins.get('uint32le')],
		['uint64', defaultBuiltins.get('uint64le')],
		['uint8', defaultBuiltins.get('uint8le')],
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
