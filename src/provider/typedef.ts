interface TypeProvider {
	getLength (data: DataView, offset: number): number;
	parse (data: DataView, offset: number): unknown;
	stringify (data: unknown): ArrayBuffer[];
}

interface DeepTypeData {
	offset: number;
	type: TypeProvider;
}

interface DeepTypeProvider extends TypeProvider {
	getIndex (data: DataView, offset: number, index: unknown): DeepTypeData;
}

export { TypeProvider, DeepTypeData, DeepTypeProvider };
