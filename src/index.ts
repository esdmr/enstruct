import { SchemaParser } from './schema';
import { DeepTypeProvider, TypeProvider, Environment } from './provider';
import { GetValue } from './typedef';

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

	parse (data: Buffer, entry?: null | undefined): T['default'];

	parse<K extends readonly (number | string)[]> (
		data: Buffer,
		entry: null | undefined,
		indecies: K,
	): GetValue<T['default'], K>;

	parse<E extends keyof T>(
		data: Buffer,
		entry: E,
	): T[E];

	parse<E extends keyof T, K extends readonly (number | string)[]>(
		data: Buffer,
		entry: E,
		indecies: K,
	): GetValue<T[E], K>;

	parse (
		data: Buffer,
		entry?: string | null | undefined,
		indecies?: unknown[],
	): unknown {
		let currentType;
		let currentOffset = 0;

		if (entry == null) {
			const defaultType = this.environment.default;

			if (defaultType == null) {
				throw new Error('Entry point not set.');
			}

			currentType = defaultType;
		} else {
			currentType = this.environment.getType(entry);
		}

		for (const item of indecies ?? []) {
			if (!isDeep(currentType)) {
				throw new TypeError('Index type is not deep.');
			}

			({
				type: currentType,
				offset: currentOffset,
			} = currentType.getIndex(data, currentOffset, item as never));
		}

		return currentType.parse(data, currentOffset);
	}
}

export {
	TypeProvider, DeepTypeData, DeepTypeProvider, ParseDeepType, ParseType,
	Endianness,
} from './provider/typedef';
