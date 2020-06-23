import {
	DeepTypeData, DeepTypeProvider, TypeProvider, ParseType,
} from '../../typedef';
import { IndexOutOfBoundError } from '../../error';

export class ArrayLenType<T extends TypeProvider>
implements DeepTypeProvider<T[], number, ParseType<T>[]> {
	constructor (
		private type: T,
		private lengthType: TypeProvider<number>,
	) { }

	getLength (data: Buffer, offset: number): number {
		let length = this.lengthType.getLength(data, offset);
		const itemLength = this.lengthType.parse(data, offset);

		for (let index = 0; index < itemLength; index++) {
			length += this.type.getLength(data, offset + length);
		}

		return length;
	}

	parse (data: Buffer, offset: number): ParseType<T>[] {
		const itemLength = this.lengthType.parse(data, offset);
		const result: unknown[] = [];
		let currentOffset = offset;
		currentOffset += this.lengthType.getLength(data, offset);

		for (let index = 0; index < itemLength; index++) {
			result[index] = this.type.parse(data, currentOffset);
			currentOffset += this.type.getLength(data, currentOffset);
		}

		return result as ParseType<T>[];
	}

	stringify (data: ParseType<T>[]): Buffer[] {
		const buffers: Buffer[][] = [
			this.lengthType.stringify(data.length),
		];

		for (const item of data) {
			buffers.push(this.type.stringify(item));
		}

		return buffers.flat();
	}

	getIndex (data: Buffer, offset: number, index: number): DeepTypeData<T> {
		const itemLength = this.lengthType.parse(data, offset);

		if (index >= itemLength) {
			throw new IndexOutOfBoundError(String(index));
		}

		let currentOffset = offset;
		currentOffset += this.lengthType.getLength(data, offset);

		for (let iteration = 0; iteration < itemLength; iteration++) {
			if (iteration === index) {
				return { offset: currentOffset, type: this.type };
			}

			currentOffset += this.type.getLength(data, currentOffset);
		}

		// Never gets executed.
		throw new IndexOutOfBoundError(String(index));
	}
}
