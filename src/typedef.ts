type Index <T, K> = K extends never ? T : T[Extract<K, keyof T>];

type Tail<T extends readonly unknown[]> =
	((...args: T) => void) extends ((first: any, ...rest: infer V) => void) ? V
		: T extends [unknown] ? [] : T extends [] ? [] : never;

type RecursionLimit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type GetValue<T, K extends readonly unknown[]> = {
	done: T,
	deep: 'TOO DEEP',
	recur: GetValue<Index<T, K[0]>, Tail<K>>,
}[K['length'] extends 0 ? 'done'
	: K['length'] extends RecursionLimit ? 'recur': 'deep'];
