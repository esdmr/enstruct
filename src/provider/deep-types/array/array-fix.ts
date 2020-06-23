import {
	DeepTypeData, DeepTypeProvider, TypeProvider, ParseType,
} from '../../typedef';
import { IndexOutOfBoundError } from '../../error';

export class ArrayFixType<T extends TypeProvider>
implements DeepTypeProvider<T[], number, ParseType<T>[]> {
	constructor (
		private type: T,
		private length: number,
	) { }

	getLength (data: Buffer, offset: number): number {
		let length = 0;

		for (let index = 0; index < this.length; index++) {
			length += this.type.getLength(data, offset + length);
		}

		return length;
	}

	parse (data: Buffer, offset: number): ParseType<T>[] {
		const result: unknown[] = [];
		let currentOffset = offset;

		for (let index = 0; index < this.length; index++) {
			result.push(this.type.parse(data, currentOffset));
			currentOffset += this.type.getLength(data, currentOffset);
		}

		return result as ParseType<T>[];
	}

	stringify (data: ParseType<T>[]): Buffer[] {
		const buffers: Buffer[][] = [];

		if (data.length !== this.length) {
			throw new IndexOutOfBoundError(String(this.length));
		}

		for (const item of data) {
			buffers.push(this.type.stringify(item));
		}

		return buffers.flat();
	}

	getIndex (data: Buffer, offset: number, index: number): DeepTypeData<T> {
		let currentOffset = offset;

		if (index > this.length) {
			throw new IndexOutOfBoundError(String(index));
		}

		for (let iteration = 0; iteration < this.length; iteration++) {
			if (iteration === index) {
				return { offset: currentOffset, type: this.type };
			}

			currentOffset += this.type.getLength(data, currentOffset);
		}

		throw new IndexOutOfBoundError(String(index));
	}
}
