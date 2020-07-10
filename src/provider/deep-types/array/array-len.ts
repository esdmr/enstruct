import type {
	DeepTypeData, DeepTypeProvider, TypeProvider,
} from '../../typedef';
import { checkInt, getItemLength } from '../../helpers';
import { indexOutOfBounds, unexpectedType } from '../../error';

class ArrayLenType implements DeepTypeProvider {
	constructor (
		private type: TypeProvider,
		private lengthType: TypeProvider,
	) { }

	getLength (data: DataView, offset: number): number {
		const itemLength = getItemLength(this.lengthType, data, offset);
		let length = this.lengthType.getLength(data, offset);

		for (let index = 0; index < itemLength; index++) {
			length += this.type.getLength(data, offset + length);
		}

		return length;
	}

	parse (data: DataView, offset: number): unknown[] {
		const itemLength = getItemLength(this.lengthType, data, offset);
		const result: unknown[] = [];
		let currentOffset = offset + this.lengthType.getLength(data, offset);

		for (let index = 0; index < itemLength; index++) {
			result[index] = this.type.parse(data, currentOffset);
			currentOffset += this.type.getLength(data, currentOffset);
		}

		return result;
	}

	stringify (data: unknown): ArrayBuffer[] {
		if (!Array.isArray(data)) throw unexpectedType('data', 'array');
		const buffers = [this.lengthType.stringify(data.length)];

		for (const item of data) {
			buffers.push(this.type.stringify(item));
		}

		return buffers.flat();
	}

	getIndex (data: DataView, offset: number, index: unknown): DeepTypeData {
		const itemLength = getItemLength(this.lengthType, data, offset);
		if (typeof index !== 'number') throw unexpectedType('index', 'number');
		checkInt(index, 'index');
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
}

export { ArrayLenType };
