import type { Location } from './typedef';

export class SchemaParserError extends Error {
	constructor (message: string, start: Location, end?: Location) {
		const position = SchemaParserError.stringifyPosition(start);

		const endPosition = end == null ?
			null :
			SchemaParserError.stringifyPosition(end);

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

	private static stringifyPosition (position: Location) {
		return `${position.row}:${position.column}@${position.offset}`;
	}
}
