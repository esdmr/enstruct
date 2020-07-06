import { indexOutOfBounds, unexpectedProvider } from '../../error';
import type {
	DeepTypeData, DeepTypeProvider, TypeProvider,
} from '../../typedef';
import { IntegerType } from '../../types/number/integer';

const intType = new IntegerType(8, true, false);

export class BufferLenType implements DeepTypeProvider {
	constructor (private readonly lengthType: TypeProvider) { }

	getLength (data: DataView, offset: number): number {
		return this.lengthType.getLength(data, offset) +
			this.getItemLength(data, offset);
	}

	parse (buffer: DataView, offset: number): ArrayBuffer {
		const lengthSize = this.lengthType.getLength(buffer, offset);
		const totalSize = lengthSize + this.getItemLength(buffer, offset);
		return buffer.buffer.slice(offset + lengthSize, offset + totalSize);
	}

	stringify (data: ArrayBuffer): ArrayBuffer[] {
		return [...this.lengthType.stringify(data.byteLength), data];
	}

	getIndex (data: DataView, offset: number, index: number): DeepTypeData {
		const itemLength = this.getItemLength(data, offset);
		if (index >= itemLength) throw indexOutOfBounds(index);
		return { offset: offset + index, type: intType };
	}

	private getItemLength (data: DataView, offset: number) {
		const itemLength = this.lengthType.parse(data, offset);

		if (typeof itemLength !== 'number') {
			throw unexpectedProvider('lengthType', 'number');
		}

		return itemLength;
	}
}
