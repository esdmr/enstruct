import { TypeProvider } from '../typedef';
import { unexpectedProvider, unexpectedType } from '../error';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class StringLenType implements TypeProvider {
	constructor (private readonly bufferType: TypeProvider) { }

	getLength (data: DataView, offset: number): number {
		return this.bufferType.getLength(data, offset);
	}

	parse (buffer: DataView, offset: number): string {
		const parsed = this.bufferType.parse(buffer, offset);

		if (typeof parsed !== 'object' || !(parsed instanceof ArrayBuffer)) {
			throw unexpectedProvider('bufferType', 'ArrayBuffer');
		}

		return decoder.decode(parsed);
	}

	stringify (data: unknown): ArrayBuffer[] {
		if (typeof data !== 'string') throw unexpectedType('data', 'string');
		return this.bufferType.stringify(encoder.encode(data).buffer);
	}
}
