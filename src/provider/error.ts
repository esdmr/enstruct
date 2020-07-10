class ProviderError extends Error {
	name = 'TypeProviderError';
}

type PError = ProviderError;

function indexOutOfBounds (index: number): PError {
	return new ProviderError(`Index ${index} is out of bounds.`);
}

function undefinedIndex (index: string): PError {
	return new ProviderError(`Index '${index}' does not exists on this type.`);
}

function unexpectedType (what: string, expected: string): PError {
	return new ProviderError(`'${what}' must be a(n) '${expected}'.`);
}

function unexpectedProvider (what: string, expected: string): PError {
	return new ProviderError(`'${what}' must be a(n) '${expected}' provider.`);
}

function incorrectLength (expected: number, got: number): PError {
	return new ProviderError(`Expected ${expected} elements, Got ${got}.`);
}

export {
	ProviderError, indexOutOfBounds, undefinedIndex, unexpectedType,
	unexpectedProvider, incorrectLength,
};
