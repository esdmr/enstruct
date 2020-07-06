import { alloc, bufferGet, bufferSet } from '../../helpers';
import { TypeProvider } from '../../typedef';

export class FloatType implements TypeProvider {
	constructor (
		private readonly size: 32 | 64,
		private readonly le = false,
	) { }

	getLength (): number { return this.size / 8; }

	parse (data: DataView, offset: number): number {
		return bufferGet.float[this.size](data)(offset, this.le);
	}

	stringify (data: number): ArrayBuffer[] {
		const buffer = alloc(this.getLength());
		bufferSet.float[this.size](buffer)(0, data, this.le);
		return [buffer.buffer];
	}
}
