type Tail<T extends readonly unknown[]> =
	((...args: T) => void) extends ((first: any, ...rest: infer V) => void) ? V
		: T extends [unknown] ? [] : T extends [] ? [] : never;


export type GetValue<T, K extends readonly unknown[]> = {
	done: T,
	deep: unknown,
	recur: GetValue<T[Extract<K[0], keyof T>], Tail<K>>,
}[K['length'] extends 0 ? 'done'
	: K['length'] extends 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 ? 'recur'
		: 'deep'];
