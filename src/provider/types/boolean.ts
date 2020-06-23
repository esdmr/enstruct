import { TypeProvider } from '../typedef';
// INFO: This should be converted to namespace when TypeScript/#420 closes.

export class BooleanType implements TypeProvider<boolean> {
	getLength (): number { return 1; }

	parse (data: Buffer, offset: number): boolean {
		return data.readUInt8(offset) > 0;
	}

	stringify (data: boolean): Buffer[] {
		return [Buffer.of(data ? 1 : 0)];
	}
}
