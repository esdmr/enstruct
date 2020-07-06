import { alloc, bufferGet, bufferSet } from '../../helpers';
import { TypeProvider } from '../../typedef';

export class BigIntType implements TypeProvider {
	constructor (
		private readonly signed: boolean,
		private readonly le = false,
	) { }

	getLength (): number { return 8; }

	parse (buffer: DataView, offset: number): bigint {
		return bufferGet[this.signed ? 1 : 0][64](buffer)(offset, this.le);
	}

	stringify (data: bigint): ArrayBuffer[] {
		const buffer = alloc(8);
		bufferSet[this.signed ? 1 : 0][64](buffer)(0, data, this.le);
		return [buffer.buffer];
	}
}
