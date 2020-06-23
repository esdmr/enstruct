export class IndexOutOfBoundError extends Error {
	name = 'IndexOutOfBoundError';

	constructor (
		index: string,
		message = `Index ${index} is out of bounds.`,
	) {
		super(message);
	}
}

export class UndefinedIndexError extends Error {
	name = 'UndefinedIndexError';

	constructor (index: string);
	constructor (index: unknown, message: string);
	constructor (
		index: string,
		message = `Index '${index}' does not exists on this type.`,
	) {
		super(message);
	}
}
