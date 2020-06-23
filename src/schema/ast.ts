import { inspect } from 'util';
import { SchemaParserError } from './error';
import type { Location, TypeMap, TypeProviderStmt } from './typedef';

const indent = ' '.repeat(4);

class StringInspectable {
	[inspect.custom] () { return this.toString(); }
}

class Statement extends StringInspectable { }

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

export class Type extends StringInspectable {
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

export class RootEnv extends StringInspectable {
	readonly default?: TypeProviderStmt;
	readonly typeMap: TypeMap = new Map();

	constructor (
		public options: OptionStmt[],
		public types: TypeProviderStmt[],
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

export class OptionStmt extends Statement {
	static INVALID_SYNTAX = 'Incorrect option statement.';

	constructor (readonly option: string) { super(); }

	toString (): string {
		return `option ${this.option};`;
	}
}

export class StructStmt extends Statement {
	constructor (
		readonly name: string,
		readonly props: StructProperty[],
	) { super(); }

	validate (typeMap: TypeMap): void {
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
		readonly type: Type,
		private readonly start: Location,
		private readonly end: Location,
	) { super(); }

	validate (typeMap: TypeMap): void {
		if (!typeMap.has(this.type.name)) {
			nullReference(this.type.name, this.start, this.end);
		}
	}

	toString (): string {
		return `${this.type} ${this.name};`;
	}
}

export class TypeStmt extends Statement {
	static INVALID_SYNTAX = 'Incorrect type statement.';

	constructor (
		readonly name: string | null,
		readonly type: Type,
		private readonly start: Location,
		private readonly end: Location,
	) { super(); }

	validate (typeMap: TypeMap): void {
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
