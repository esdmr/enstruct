import {
	DeepTypeData, DeepTypeProvider, ParseDeepType,
	TypeProvider,
} from '../typedef';
import { UndefinedIndexError } from '../error';

export class StructType<T extends Record<string, TypeProvider>>
implements DeepTypeProvider<T, string> {
	constructor (private readonly struct: [keyof T, T[keyof T]][]) { }

	getLength (data: Buffer, offset: number): number {
		let length = 0;

		for (const [, value] of this.struct) {
			length += value.getLength(data, offset + length);
		}

		return length;
	}

	parse (data: Buffer, offset: number): ParseDeepType<T> {
		const result: {
			[x in keyof T]?: unknown;
		} = {};
		let currentOffset = offset;

		for (const [key, value] of this.struct) {
			result[key] = value.parse(data, currentOffset);
			currentOffset += value.getLength(data, currentOffset);
		}

		return result as ParseDeepType<T>;
	}

	stringify (data: ParseDeepType<T>): Buffer[] {
		const buffers: Buffer[][] = [];

		for (const [key, value] of this.struct) {
			if (!Object.prototype.hasOwnProperty.call(data, key)) {
				throw new UndefinedIndexError(String(key));
			}

			buffers.push(value.stringify(data[key]));
		}

		return buffers.flat();
	}

	getIndex<S extends string> (data: Buffer, offset: number, index: S):
	DeepTypeData<T[S]> {
		let type;
		let currentOffset = offset;

		for (const [key, value] of this.struct) {
			if (key === index) {
				type = value as T[S];
				break;
			}

			currentOffset += value.getLength(data, currentOffset);
		}

		if (type == null) {
			throw new UndefinedIndexError(String(index));
		}

		return { type: type, offset: currentOffset };
	}
}
