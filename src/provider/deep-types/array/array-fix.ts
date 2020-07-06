import { indexOutOfBounds, incorrectLength } from '../../error';
import { DeepTypeData, DeepTypeProvider, TypeProvider } from '../../typedef';

export class ArrayFixType implements DeepTypeProvider {
	constructor (
		private type: TypeProvider,
		private length: number,
	) { }

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
		if (index > this.length) throw indexOutOfBounds(index);

		for (let iteration = 0; iteration < this.length; iteration++) {
			if (iteration === index) {
				return { offset: currentOffset, type: this.type };
			}

			currentOffset += this.type.getLength(data, currentOffset);
		}

		throw indexOutOfBounds(index);
	}
}
