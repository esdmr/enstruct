import { inspect } from 'util';
import { SchemaParserError } from './error';
import type { Location, TypedStatementMap, TypedStatement } from './typedef';

const indent = ' '.repeat(4);

class StringInspectable {
	[inspect.custom] () { return this.toString(); }
}

abstract class Statement extends StringInspectable { }

function multiDef (start: Location, end?: Location) {
	const message = 'Multiple default type statements found.';
	throw new SchemaParserError(message, start, end);
}

function multiNamed (name: string, start: Location, end?: Location) {
	const message = `Duplicate type statements '${name}' found.`;
	throw new SchemaParserError(message, start, end);
}

function nullReference (ref: string, start: Location, end?: Location) {
	const message = `Unexisting type reference '${ref}' found.`;
	throw new SchemaParserError(message, start, end);
}

export class TypeReference extends StringInspectable {
	constructor (
		readonly name: string,
		readonly array: boolean | number = false,
	) { super(); }

	toString (): string {
		switch (this.array) {
			case false: return this.name;
			case true: return `${this.name}[]`;
			default: return `${this.name}[${this.array}]`;
		}
	}
}

export class RootEnvironment extends StringInspectable {
	readonly default?: TypedStatement;
	readonly typeMap: TypedStatementMap = new Map();

	constructor (
		public options: OptionStatement[],
		public types: TypedStatement[],
		private readonly start: Location,
		private readonly end: Location,
	) {
		super();

		for (const type of types) {
			if (type.name == null) {
				if (this.default != null) multiDef(this.start, this.end);
				this.default = type;
			} else {
				if (this.typeMap.has(type.name)) {
					multiNamed(type.name, this.start, this.end);
				}

				this.typeMap.set(type.name, type);
			}
		}
	}

	validate (): void {
		/*
		 * //
		 * const currentOptions = new Set();
		 * for (const option of this.options) {
		 * 	if (currentOptions.has(option.option));
		 * }
		 */

		for (const type of this.types) {
			type.validate(this.typeMap);
		}
	}

	toString (): string {
		const str = [];
		for (const option of this.options) str.push(option);
		for (const type of this.types) str.push(type);
		return str.join('\n');
	}
}

export class OptionStatement extends Statement {
	static INVALID_SYNTAX = 'Incorrect option statement.';

	constructor (readonly option: string) { super(); }

	toString (): string {
		return `option ${this.option};`;
	}
}

export class StructStatement extends Statement {
	constructor (
		readonly name: string,
		readonly props: StructProperty[],
	) { super(); }

	validate (typeMap: TypedStatementMap): void {
		for (const prop of this.props) {
			prop.validate(typeMap);
		}
	}

	toString (): string {
		const str = [`struct ${this.name} {`];

		for (const prop of this.props) {
			str.push(`${indent}${prop.toString()}`);
		}

		str.push('}');
		return str.join('\n');
	}
}

export class StructProperty extends StringInspectable {
	constructor (
		readonly name: string,
		readonly type: TypeReference,
		private readonly start: Location,
		private readonly end: Location,
	) { super(); }

	validate (typeMap: TypedStatementMap): void {
		if (!typeMap.has(this.type.name)) {
			nullReference(this.type.name, this.start, this.end);
		}
	}

	toString (): string {
		return `${this.type} ${this.name};`;
	}
}

export class TypeStatement extends Statement {
	static INVALID_SYNTAX = 'Incorrect type statement.';

	constructor (
		readonly name: string | null,
		readonly type: TypeReference,
		private readonly start: Location,
		private readonly end: Location,
	) { super(); }

	validate (typeMap: TypedStatementMap): void {
		if (!typeMap.has(this.type.name)) {
			nullReference(this.type.name, this.start, this.end);
		}
	}

	toString (): string {
		switch (this.name) {
			case null: return `type = ${this.type};`;
			default: return `type ${this.name} = ${this.type};`;
		}
	}
}
