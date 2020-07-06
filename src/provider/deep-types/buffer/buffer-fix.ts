import { indexOutOfBounds } from '../../error';
import type { DeepTypeData, DeepTypeProvider } from '../../typedef';
import { IntegerType } from '../../types/number/integer';

const intType = new IntegerType(8, false);

export class BufferFixType implements DeepTypeProvider {
	constructor (private readonly length: number) { }

	getLength (): number {
		return this.length;
	}

	parse (buffer: DataView, offset: number): ArrayBuffer {
		return buffer.buffer.slice(offset, offset + this.length);
	}

	stringify (data: ArrayBuffer): ArrayBuffer[] {
		return [data];
	}

	getIndex (_data: DataView, offset: number, index: number): DeepTypeData {
		if (index >= this.length) throw indexOutOfBounds(index);
		return { offset: offset + index, type: intType };
	}
}
