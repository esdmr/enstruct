import {
	Endianness,
	TypeProvider,
} from '../../typedef';
import { read, write } from '../../buffer-helpers';

export class IntegerType implements TypeProvider<number> {
	constructor (
		private readonly size: 8 | 16 | 32,
		private readonly endianness: Endianness = 'BE',
		private readonly signed = true,
	) { }

	getLength (): number { return this.size / 8; }

	parse (data: Buffer, offset: number): number {
		const func = read[this.endianness][this.signed ? 1 : 0][this.size];
		return func(data, offset);
	}

	stringify (data: number): Buffer[] {
		const buffer = Buffer.alloc(this.getLength());
		write[this.endianness][this.signed ? 1 : 0][this.size](buffer, data);
		return [buffer];
	}
}
