import { undefinedIndex, unexpectedType } from '../error';
import type { DeepTypeData, DeepTypeProvider, TypeProvider } from '../typedef';

export class StructType implements DeepTypeProvider {
	constructor (private readonly struct: [string, TypeProvider][]) { }

	getLength (data: DataView, offset: number): number {
		return this.struct.reduce(
			(prev, [, value]) => prev + value.getLength(data, offset + prev),
			0,
		);
	}

	parse (data: DataView, offset: number): Record<string, unknown> {
		const result: Record<string, unknown> = {};
		let currentOffset = offset;

		for (const [key, value] of this.struct) {
			result[key] = value.parse(data, currentOffset);
			currentOffset += value.getLength(data, currentOffset);
		}

		return result;
	}

	stringify (data: unknown): ArrayBuffer[] {
		const buffers: ArrayBuffer[][] = [];
		const record = data as Record<string, unknown>;

		if (typeof data !== 'object' || data == null) {
			throw unexpectedType('data', 'object');
		}

		for (const [key, value] of this.struct) {
			if (!Object.prototype.hasOwnProperty.call(data, key)) {
				throw undefinedIndex(key);
			}

			buffers.push(value.stringify(record[key]));
		}

		return buffers.flat();
	}

	getIndex (data: DataView, offset: number, index: string): DeepTypeData {
		let type: TypeProvider | undefined;
		let currentOffset = offset;

		for (const [key, value] of this.struct) {
			if (key === index) {
				type = value;
				break;
			}

			currentOffset += value.getLength(data, currentOffset);
		}

		if (type == null) throw undefinedIndex(index);

		return { type: type, offset: currentOffset };
	}
}
