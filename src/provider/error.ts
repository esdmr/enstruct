export class ProviderError extends Error {
	name = 'TypeProviderError';
}

type PError = ProviderError;

export function indexOutOfBounds (index: number): PError {
	return new ProviderError(`Index ${index} is out of bounds.`);
}

export function undefinedIndex (index: string): PError {
	return new ProviderError(`Index '${index}' does not exists on this type.`);
}

export function unexpectedType (what: string, expected: string): PError {
	return new ProviderError(`'${what}' must be a(n) '${expected}'.`);
}

export function unexpectedProvider (what: string, expected: string): PError {
	return new ProviderError(`'${what}' must be a(n) '${expected}' provider.`);
}

export function incorrectLength (expected: number, got: number): PError {
	return new ProviderError(`Expected ${expected} elements, Got ${got}.`);
}
