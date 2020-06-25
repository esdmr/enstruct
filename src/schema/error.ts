import type { Location } from './typedef';

function stringifyPosition (position: Location) {
	return `${position.row}:${position.column}@${position.offset}`;
}

export class SchemaParserError extends Error {
	constructor (message: string, start: Location, end?: Location) {
		const position = stringifyPosition(start);
		const endPosition = end == null ? null : stringifyPosition(end);
		const endString = endPosition == null ? '' : ` - ${endPosition}`;
		super(`${message}\nAt: ${position}${endString}`);
		this.name = 'SchemaParserError';
	}

	static expectedString (text: string, start: Location): SchemaParserError {
		return new SchemaParserError(`Expected Literal: ${text}`, start);
	}

	static expectedRegEx (regex: RegExp, start: Location): SchemaParserError {
		return new SchemaParserError(`Expected RegEx: ${regex.source}`, start);
	}

	static expected (
		message: string,
		start: Location,
		end?: Location,
	): SchemaParserError {
		return new SchemaParserError(`Expected ${message}`, start, end);
	}
}

export class SchemaAstError extends SchemaParserError {
	name = 'SchemaAstError';

	static multiDef (start: Location, end?: Location): SchemaAstError {
		const message = 'Multiple default type statements found.';
		return new SchemaAstError(message, start, end);
	}

	static multiNamed (
		name: string,
		start: Location,
		end?: Location,
	): SchemaAstError {
		const message = `Duplicate type statements '${name}' found.`;
		return new SchemaAstError(message, start, end);
	}

	static nullReference (
		ref: string,
		start: Location,
		end?: Location,
	): SchemaAstError {
		const message = `Unexisting type reference '${ref}' found.`;
		return new SchemaAstError(message, start, end);
	}
}
