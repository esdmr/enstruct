export interface TypeProvider {
	getLength (data: DataView, offset: number): number;
	parse (data: DataView, offset: number): unknown;
	stringify (data: unknown): ArrayBuffer[];
}

export interface DeepTypeData {
	offset: number;
	type: TypeProvider;
}

export interface DeepTypeProvider extends TypeProvider {
	getIndex (data: DataView, offset: number, index: unknown): DeepTypeData;
}
