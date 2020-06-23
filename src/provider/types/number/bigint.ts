import {
	Endianness,
	TypeProvider,
} from '../../typedef';
import { read, write } from '../../buffer-helpers';

export class BigIntType implements TypeProvider<bigint> {
	constructor (
		_size?: 64,
		private readonly endianness: Endianness = 'BE',
		private readonly signed = true,
	) { }

	getLength (): number { return 8; }

	parse (data: Buffer, offset: number): bigint {
		return read[this.endianness][this.signed ? 1 : 0][64](data, offset);
	}

	stringify (data: bigint): Buffer[] {
		const buffer = Buffer.alloc(8);
		write[this.endianness][this.signed ? 1 : 0][64](buffer, data);
		return [buffer];
	}
}
