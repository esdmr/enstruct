import { TypeProvider, Endianness } from '../typedef';

export class CharType implements TypeProvider<string> {
	constructor (
		private readonly size: 8 | 16,
		private readonly endianness: Endianness = 'BE',
	) {}

	getLength (): number { return this.size / 8; }

	parse (data: Buffer, offset: number): string {
		const buffer = data.slice(offset, offset + this.getLength());
		this.swap(buffer);

		try {
			return buffer.toString(this.encoding());
		} finally {
			this.swap(buffer);
		}
	}

	stringify (data: string): Buffer[] {
		const buffer = Buffer.from(data[0], this.encoding());
		this.swap(buffer);
		return [buffer];
	}

	private swap (buffer: Buffer) {
		if (this.endianness === 'BE' && this.size === 16) buffer.swap16();
	}

	private encoding () {
		return this.size === 8 ? 'latin1' : 'ucs2';
	}
}
