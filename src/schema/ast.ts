import {
	ArrayFixType, ArrayLenType, Environment, StructType, TypeProvider,
} from '../provider';
import type { Location } from './typedef';
import { inspect } from 'util';

const indent = ' '.repeat(4);

abstract class ASTItem {
	abstract toString (): string;
	[inspect.custom] (): string { return this.toString(); }
}

abstract class CompilableASTItem extends ASTItem {
	abstract compile (environment: Environment): void;
}

class Schema extends CompilableASTItem {
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

class TypeReference extends ASTItem {
	constructor (
		private readonly name: string,
		private readonly array: boolean | number,
		readonly start: Location,
		readonly end: Location,
	) { super(); }

	constructTypeProvider (environment: Environment): TypeProvider {
		const type = environment.getType(this.name);
		const size = environment.getType('arrsize', 'arrsizebe');

		switch (this.array) {
			case false: return type;
			case true: return new ArrayLenType(type, size);
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

class OptionStatement extends CompilableASTItem {
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

class TypeStatement extends CompilableASTItem {
	constructor (
		private readonly name: string | null,
		private readonly type: TypeReference,
		readonly start: Location,
		readonly end: Location,
	) { super(); }

	compile (environment: Environment): void {
		environment.types.set(
			this.name ?? 'default',
			this.type.constructTypeProvider(environment),
		);
	}

	toString (): string {
		return `type ${this.name ?? 'default'} = ${this.type};`;
	}
}

class StructStatement extends CompilableASTItem {
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

class StructProperty extends ASTItem {
	constructor (
		readonly name: string,
		readonly type: TypeReference,
		readonly start: Location,
		readonly end: Location,
	) { super(); }

	toString (): string {
		return `${this.type} ${this.name};`;
	}
}

export {
	ASTItem, CompilableASTItem, Schema, TypeReference, OptionStatement,
	TypeStatement, StructStatement, StructProperty,
};
