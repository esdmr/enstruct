import {
	incorrectLength, indexOutOfBounds, unexpectedProvider,
} from '../../error';
import type {
	DeepTypeData, DeepTypeProvider, TypeProvider,
} from '../../typedef';
import { checkInt } from '../../helpers';

export class ArrayFixType implements DeepTypeProvider {
	constructor (
		private type: TypeProvider,
		private length: number,
	) {
		checkInt(length, 'length');
	}

	getLength (data: DataView, offset: number): number {
		let length = 0;

		for (let index = 0; index < this.length; index++) {
			length += this.type.getLength(data, offset + length);
		}

		return length;
	}

	parse (data: DataView, offset: number): unknown[] {
		const result: unknown[] = [];
		let currentOffset = offset;

		for (let index = 0; index < this.length; index++) {
			result.push(this.type.parse(data, currentOffset));
			currentOffset += this.type.getLength(data, currentOffset);
		}

		return result;
	}

	stringify (data: unknown): ArrayBuffer[] {
		const buffers: ArrayBuffer[][] = [];
		if (!Array.isArray(data)) throw unexpectedProvider('data', 'array');

		if (data.length !== this.length) {
			throw incorrectLength(this.length, data.length);
		}

		for (const item of data) {
			buffers.push(this.type.stringify(item));
		}

		return buffers.flat();
	}

	getIndex (data: DataView, offset: number, index: number): DeepTypeData {
		let currentOffset = offset;
		checkInt(index, 'index');
		if (index > this.length) throw indexOutOfBounds(index);

		for (let iteration = 0; true; iteration++) {
			if (iteration === index) {
				return { offset: currentOffset, type: this.type };
			}

			currentOffset += this.type.getLength(data, currentOffset);
		}
	}
}
