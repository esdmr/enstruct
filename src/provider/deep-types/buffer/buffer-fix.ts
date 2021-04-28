import type { DeepTypeData, DeepTypeProvider } from '../../typedef';
import { checkInt, isInstanceOf } from '../../helpers';
import { indexOutOfBounds, unexpectedType } from '../../error';
import { IntegerType } from '../../types/number/integer';

const intType = new IntegerType(8, false);

export class BufferFixType implements DeepTypeProvider {
	constructor (private readonly length: number) {
		checkInt(length, 'length');
	}

	getLength (): number {
		return this.length;
	}

	parse (buffer: DataView, offset: number): ArrayBuffer {
		return buffer.buffer.slice(offset, offset + this.length);
	}

	stringify (data: unknown): ArrayBuffer[] {
		if (!isInstanceOf(data, ArrayBuffer)) {
			throw unexpectedType('data', 'ArrayBuffer');
		}

		return [data];
	}

	getIndex (_data: DataView, offset: number, index: unknown): DeepTypeData {
		if (typeof index !== 'number') throw unexpectedType('index', 'number');
		checkInt(index, 'index');
		if (index >= this.length) throw indexOutOfBounds(index);

		return { offset: offset + index, type: intType };
	}
}
