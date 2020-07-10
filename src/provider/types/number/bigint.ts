import { alloc, bufferGet, bufferSet } from '../../helpers';
import type { TypeProvider } from '../../typedef';
import { unexpectedType } from '../../error';

class BigIntType implements TypeProvider {
	constructor (
		private readonly signed: boolean,
		private readonly le = false,
	) { }

	getLength (): number { return 8; }

	parse (buffer: DataView, offset: number): bigint {
		return bufferGet[this.signed ? 1 : 0][64](buffer)(offset, this.le);
	}

	stringify (data: unknown): ArrayBuffer[] {
		if (typeof data !== 'bigint') throw unexpectedType('data', 'bigint');
		const buffer = alloc(8);
		bufferSet[this.signed ? 1 : 0][64](buffer)(0, data, this.le);

		return [buffer.buffer];
	}
}

export { BigIntType };
