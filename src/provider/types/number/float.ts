import {
	Endianness,
	TypeProvider,
} from '../../typedef';
import { read, write } from '../../helpers';

export class FloatType implements TypeProvider<number> {
	constructor (
		private readonly size: 32 | 64,
		private readonly endianness: Endianness,
	) { }

	getLength (): number { return this.size / 8; }

	parse (data: Buffer, offset: number): number {
		return read[this.endianness].float[this.size](data, offset);
	}

	stringify (data: number): Buffer[] {
		const buffer = Buffer.alloc(this.getLength());
		write[this.endianness].float[this.size](buffer, data);
		return [buffer];
	}
}
