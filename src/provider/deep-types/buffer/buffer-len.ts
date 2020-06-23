import { DeepTypeData, DeepTypeProvider, TypeProvider } from '../../typedef';
import { IndexOutOfBoundError } from '../../error';
import { IntegerType } from '../../types/number/integer';

export class BufferLenType
implements DeepTypeProvider<IntegerType[], number, Buffer> {
	private readonly intType = new IntegerType(8, 'BE', false);

	constructor (private readonly lengthType: TypeProvider<number>) { }

	getLength (data: Buffer, offset: number): number {
		return this.lengthType.getLength(data, offset) +
			this.lengthType.parse(data, offset);
	}

	parse (data: Buffer, offset: number): Buffer {
		const itemLength = this.getLength(data, offset);
		return data.slice(offset, offset + itemLength);
	}

	stringify (data: Buffer): Buffer[] {
		return [...this.lengthType.stringify(data.length), data];
	}

	getIndex (data: Buffer, offset: number, index: number):
	DeepTypeData<IntegerType> {
		const itemLength = this.lengthType.parse(data, offset);

		if (index >= itemLength) {
			throw new IndexOutOfBoundError(String(index));
		}

		return { offset: offset + index, type: this.intType };
	}
}
