import { incorrectLength, indexOutOfBounds } from '../../error';
import type {
	DeepTypeData, DeepTypeProvider, TypeProvider,
} from '../../typedef';

export class ArrayFixType implements DeepTypeProvider {
	constructor (
		private type: TypeProvider,
		private length: number,
	) {
		this.checkInt(length, 'length');
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

	stringify (data: readonly unknown[]): ArrayBuffer[] {
		const buffers: ArrayBuffer[][] = [];

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
		this.checkInt(index, 'index');
		if (index > this.length) throw indexOutOfBounds(index);

		for (let iteration = 0; true; iteration++) {
			if (iteration === index) {
				return { offset: currentOffset, type: this.type };
			}

			currentOffset += this.type.getLength(data, currentOffset);
		}
	}

	private checkInt (int: number, what = 'integer') {
		if (int < 0 || !isFinite(int) || int % 1 !== 0) {
			throw new RangeError(`Given ${what} is incorrect.`);
		}
	}
}
