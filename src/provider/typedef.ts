export type Endianness = 'BE' | 'LE';
export type ParseType<T> = T extends TypeProvider<infer V> ? V : never;

export type BufferReadObject = {
	[x in 'BE' | 'LE']: {
		[x in 0 | 1]: {
			[x in 8 | 16 | 32]: (buf: Buffer, off: number) => number;
		} & {
			64: (buf: Buffer, off: number) => bigint;
		};
	} & {
		float: {
			[x in 32 | 64]: (buf: Buffer, off: number) => number;
		}
	};
};

export type BufferWriteObject = {
	[x in 'BE' | 'LE']: {
		[x in 0 | 1]: {
			[x in 8 | 16 | 32]:
			(buf: Buffer, dat: number, off?: number) => void;
		} & {
			64: (buf: Buffer, dat: bigint, off?: number) => void;
		};
	} & {
		float: {
			[x in 32 | 64]:
			(buf: Buffer, dat: number, off?: number) => void;
		}
	};
};

export type ParseDeepType<T, K extends keyof T = keyof T> = {
	[S in K]: ParseType<T[S]>;
};

export interface TypeProvider<Result = unknown> {
	getLength (data: Buffer, offset: number): number;
	parse (data: Buffer, offset: number): Result;
	stringify (data: Result): Buffer[];
}

export interface DeepTypeData<Type extends TypeProvider> {
	offset: number;
	type: Type;
}

export interface DeepTypeProvider<
	Type = unknown,
	Keys extends keyof Type = keyof Type,
	Result = ParseDeepType<Type, Keys>,
> extends TypeProvider<Result> {
	getIndex<S extends Keys> (
		data: Buffer,
		offset: number,
		index: S
	): DeepTypeData<Type[S] & TypeProvider>;
}
