import { alloc, bufferGet, bufferSet } from '../../helpers';
import type { TypeProvider } from '../../typedef';
import { unexpectedType } from '../../error';

class IntegerType implements TypeProvider {
	constructor (
		private readonly size: 8 | 16 | 32,
		private readonly signed: boolean,
		private readonly le = false,
	) { }

	getLength (): number { return this.size / 8; }

	parse (data: DataView, offset: number): number {
		const func = bufferGet[this.signed ? 1 : 0][this.size](data);

		return func(offset, this.le);
	}

	stringify (data: unknown): ArrayBuffer[] {
		if (typeof data !== 'number') throw unexpectedType('data', 'number');
		const buffer = alloc(this.getLength());
		bufferSet[this.signed ? 1 : 0][this.size](buffer)(0, data, this.le);

		return [buffer.buffer];
	}
}

export { IntegerType };
