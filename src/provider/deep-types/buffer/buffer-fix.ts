import { DeepTypeData, DeepTypeProvider } from '../../typedef';
import { IndexOutOfBoundError } from '../../error';
import { IntegerType } from '../../types/number/integer';

export class BufferFixType
implements DeepTypeProvider<IntegerType[], number, Buffer> {
	private readonly intType = new IntegerType(8, 'BE', false);

	constructor (private readonly length: number) { }

	getLength (): number {
		return this.length;
	}

	parse (data: Buffer, offset: number): Buffer {
		return data.slice(offset, offset + this.length);
	}

	stringify (data: Buffer): Buffer[] {
		return [data];
	}

	getIndex (data: Buffer, offset: number, index: number):
	DeepTypeData<IntegerType> {
		if (index >= this.length) {
			throw new IndexOutOfBoundError(String(index));
		}

		return { offset: offset + index, type: this.intType };
	}
}
