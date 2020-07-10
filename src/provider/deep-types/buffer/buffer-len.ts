import type {
	DeepTypeData, DeepTypeProvider, TypeProvider,
} from '../../typedef';
import { checkInt, getItemLength, isInstanceOf } from '../../helpers';
import { indexOutOfBounds, unexpectedType } from '../../error';
import { IntegerType } from '../../types/number/integer';

const intType = new IntegerType(8, true, false);

class BufferLenType implements DeepTypeProvider {
	constructor (private readonly lengthType: TypeProvider) { }

	getLength (data: DataView, offset: number): number {
		return this.lengthType.getLength(data, offset) +
			getItemLength(this.lengthType, data, offset);
	}

	parse (buffer: DataView, offset: number): ArrayBuffer {
		const lengthSize = this.lengthType.getLength(buffer, offset);

		const totalSize = lengthSize +
			getItemLength(this.lengthType, buffer, offset);

		return buffer.buffer.slice(offset + lengthSize, offset + totalSize);
	}

	stringify (data: unknown): ArrayBuffer[] {
		if (!isInstanceOf(data, ArrayBuffer)) {
			throw unexpectedType('data', 'ArrayBuffer');
		}

		return [...this.lengthType.stringify(data.byteLength), data];
	}

	getIndex (data: DataView, offset: number, index: unknown): DeepTypeData {
		if (typeof index !== 'number') throw unexpectedType('index', 'number');
		checkInt(index);
		const itemLength = getItemLength(this.lengthType, data, offset);
		if (index >= itemLength) throw indexOutOfBounds(index);

		return { offset: offset + index, type: intType };
	}
}

export { BufferLenType };
