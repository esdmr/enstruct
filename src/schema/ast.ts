import { Location } from './typedef';
import {
	ArrayLenType, ArrayFixType, Environment, TypeProvider, StructType,
} from '../provider';
import { inspect } from 'util';

const indent = ' '.repeat(4);

export abstract class ASTItem {
	abstract toString (): string;
	[inspect.custom] (): string { return this.toString(); }
}

export abstract class CompilableASTItem extends ASTItem {
	abstract compile (environment: Environment): void;
}

export class Schema extends CompilableASTItem {
	constructor (
		private readonly statements: ASTItem[],
		readonly start: Location,
		readonly end: Location,
	) { super(); }

	compile (environment: Environment): void {
		for (const item of this.statements) {
			if (item instanceof CompilableASTItem) {
				item.compile(environment);
			}
		}
	}

	toString (): string {
		return this.statements.map((item) => item.toString()).join('\n');
	}
}

export class TypeReference extends ASTItem {
	constructor (
		private readonly name: string,
		private readonly array: boolean | number,
		readonly start: Location,
		readonly end: Location,
	) { super(); }

	constructTypeProvider (environment: Environment): TypeProvider {
		const type = environment.getType(this.name);
		const uint32 =
			environment.getType('uint32', 'uint32be') as TypeProvider<number>;

		switch (this.array) {
			case false: return type;
			case true: return new ArrayLenType(type, uint32);
			default: return new ArrayFixType(type, this.array);
		}
	}

	toString (): string {
		switch (this.array) {
			case false: return this.name;
			case true: return `${this.name}[]`;
			default: return `${this.name}[${this.array}]`;
		}
	}
}

export class OptionStatement extends CompilableASTItem {
	constructor (
		private readonly name: string,
		readonly start: Location,
		readonly end: Location,
	) { super(); }

	compile (environment: Environment): void {
		environment.applyOption(this.name);
	}

	toString (): string {
		return `option ${this.name};`;
	}
}

export class NamedTypeStatement extends CompilableASTItem {
	constructor (
		private readonly name: string,
		private readonly type: TypeReference,
		readonly start: Location,
		readonly end: Location,
	) { super(); }

	compile (environment: Environment): void {
		environment.types.set(
			this.name,
			this.type.constructTypeProvider(environment),
		);
	}

	toString (): string {
		return `type ${this.name} = ${this.type};`;
	}
}

export class DefaultTypeStatement extends CompilableASTItem {
	constructor (
		private readonly type: TypeReference,
		readonly start: Location,
		readonly end: Location,
	) { super(); }

	compile (environment: Environment): void {
		environment.default = this.type.constructTypeProvider(environment);
	}

	toString (): string {
		return `type = ${this.type};`;
	}
}

export class StructStatement extends CompilableASTItem {
	constructor (
		private readonly name: string,
		private readonly props: StructProperty[],
		readonly start: Location,
		readonly end: Location,
	) { super(); }

	compile (environment: Environment): void {
		environment.types.set(
			this.name,
			new StructType(this.props.map((item) => [
				item.name,
				item.type.constructTypeProvider(environment),
			])),
		);
	}

	toString (): string {
		const props = this.props.map((item) => indent + item.toString());
		return `struct ${this.name} {\n${props.join('\n')}\n}`;
	}
}

export class StructProperty extends ASTItem {
	constructor (
		readonly name: string,
		readonly type: TypeReference,
		readonly start: Location,
		readonly end: Location,
	) { super(); }

	toString (): string {
		return `${this.type} ${this.name}`;
	}
}
