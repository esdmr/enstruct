import type { TypeProvider } from '../typedef';
import { alloc } from '../helpers';

// INFO: This should be converted to namespace when TypeScript/#420 closes.
export class BooleanType implements TypeProvider {
	getLength (): number { return 1; }

	parse (data: DataView, offset: number): boolean {
		return data.getUint8(offset) > 0;
	}

	stringify (data: boolean): ArrayBuffer[] {
		const buffer = alloc(1);
		buffer.setUint8(0, data ? 1 : 0);
		return [buffer.buffer];
	}
}
