import { DeepTypeProvider, Environment, TypeProvider } from './provider';
import { ArrayBufferArray } from './arraybuffer-array';
import type { GetValue } from './typedef';
import { SchemaParser } from './schema';

function isDeep (type: TypeProvider): type is DeepTypeProvider {
	return Object.prototype.hasOwnProperty.call(type, 'getIndex');
}

class Enstruct<T extends {[x: string]: unknown}> {
	private readonly schemaParser: SchemaParser;
	private readonly environment: Environment;

	constructor (source: string) {
		this.schemaParser = new SchemaParser(source);
		this.environment = new Environment();
	}

	compile (): this {
		this.schemaParser.start().compile(this.environment);

		return this;
	}

	parse<E extends keyof T>(
		data: ArrayBuffer | ArrayBufferView | ArrayBufferArray,
		entry: E,
	): T[E];

	parse<E extends keyof T, K extends readonly (number | string)[]>(
		data: ArrayBuffer | ArrayBufferView | ArrayBufferArray,
		entry: E,
		indecies: K,
	): GetValue<T[E], K>;

	parse (
		data: ArrayBuffer | ArrayBufferView,
		entry: string,
		indecies?: unknown[],
	): unknown {
		let currentType = this.environment.getType(entry ?? 'default');
		let currentOffset = 0;
		const buf = new DataView('buffer' in data ? data.buffer : data);

		for (const item of indecies ?? []) {
			if (!isDeep(currentType)) {
				throw new TypeError('Index type is not deep.');
			}

			({
				type: currentType,
				offset: currentOffset,
			} = currentType.getIndex(buf, currentOffset, item));
		}

		return currentType.parse(buf, currentOffset);
	}

	stringify<K extends keyof T & string> (entry: K, data: T[K]):
	ArrayBufferArray {
		const array = this.environment.getType(entry).stringify(data);

		return new ArrayBufferArray(array);
	}
}

export default Enstruct;
export { DeepTypeProvider, TypeProvider } from './provider/typedef';
