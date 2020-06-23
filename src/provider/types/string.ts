import { TypeProvider } from '../typedef';

export class StringLenType implements TypeProvider<string> {
	constructor (
		private readonly bufferType: TypeProvider<Buffer>,
		private readonly encoding?: Parameters<Buffer['toString']>[0],
	) { }

	getLength (data: Buffer, offset: number): number {
		return this.bufferType.getLength(data, offset);
	}

	parse (data: Buffer, offset: number): string {
		return this.bufferType.parse(data, offset).toString(this.encoding);
	}

	stringify (data: string): Buffer[] {
		return this.bufferType.stringify(Buffer.from(data, this.encoding));
	}
}
