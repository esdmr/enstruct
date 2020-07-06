import { DeepTypeProvider, Environment, TypeProvider } from './provider';
import { SchemaParser } from './schema';
import type { GetValue } from './typedef';

function isDeep (type: TypeProvider): type is DeepTypeProvider {
	return Object.prototype.hasOwnProperty.call(type, 'getIndex');
}

export class Enstruct<T extends {[x: string]: unknown}> {
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
		data: DataView,
		entry: E,
	): T[E];

	parse<E extends keyof T, K extends readonly (number | string)[]>(
		data: DataView,
		entry: E,
		indecies: K,
	): GetValue<T[E], K>;

	parse (
		data: DataView,
		entry?: string | null,
		indecies?: unknown[],
	): unknown {
		let currentType = this.environment.getType(entry ?? 'default');
		let currentOffset = 0;

		for (const item of indecies ?? []) {
			if (!isDeep(currentType)) {
				throw new TypeError('Index type is not deep.');
			}

			({
				type: currentType,
				offset: currentOffset,
			} = currentType.getIndex(data, currentOffset, item));
		}

		return currentType.parse(data, currentOffset);
	}

	stringify<K extends keyof T & string> (entry: K, data: T[K]):
	ArrayBuffer[] {
		return this.environment.getType(entry).stringify(data);
	}
}

export { DeepTypeProvider, TypeProvider } from './provider/typedef';
