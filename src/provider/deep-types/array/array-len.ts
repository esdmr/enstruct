import {
	indexOutOfBounds, unexpectedProvider, unexpectedType,
} from '../../error';
import type {
	DeepTypeData, DeepTypeProvider, TypeProvider,
} from '../../typedef';

export class ArrayLenType implements DeepTypeProvider {
	constructor (
		private type: TypeProvider,
		private lengthType: TypeProvider,
	) { }

	getLength (data: DataView, offset: number): number {
		const itemLength = this.getItemLength(data, offset);
		let length = this.lengthType.getLength(data, offset);

		for (let index = 0; index < itemLength; index++) {
			length += this.type.getLength(data, offset + length);
		}

		return length;
	}

	parse (data: DataView, offset: number): unknown[] {
		const itemLength = this.getItemLength(data, offset);
		const result: unknown[] = [];
		let currentOffset = offset + this.lengthType.getLength(data, offset);

		for (let index = 0; index < itemLength; index++) {
			result[index] = this.type.parse(data, currentOffset);
			currentOffset += this.type.getLength(data, currentOffset);
		}

		return result;
	}

	stringify (data: unknown): ArrayBuffer[] {
		if (typeof data !== 'object' || !(data instanceof Array)) {
			throw unexpectedType('data', 'array');
		}

		const buffers = [this.lengthType.stringify(data.length)];

		for (const item of data) {
			buffers.push(this.type.stringify(item));
		}

		return buffers.flat();
	}

	getIndex (data: DataView, offset: number, index: number): DeepTypeData {
		const itemLength = this.getItemLength(data, offset);
		this.checkInt(index, 'index');
		if (index >= itemLength) throw indexOutOfBounds(index);
		let currentOffset = offset;
		currentOffset += this.lengthType.getLength(data, offset);

		for (let iteration = 0; true; iteration++) {
			if (iteration === index) {
				return { offset: currentOffset, type: this.type };
			}

			currentOffset += this.type.getLength(data, currentOffset);
		}
	}

	private getItemLength (data: DataView, offset: number): number {
		const itemLength = this.lengthType.parse(data, offset);

		if (typeof itemLength !== 'number') {
			throw unexpectedProvider('itemLength', 'number');
		}

		this.checkInt(itemLength, 'length');
		return itemLength;
	}

	private checkInt (int: number, what = 'integer') {
		if (int < 0 || !isFinite(int) || int % 1 !== 0) {
			throw new RangeError(`Given ${what} is incorrect.`);
		}
	}
}
