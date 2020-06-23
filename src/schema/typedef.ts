import type { SchemaParserError } from './error';
import type { TypeStmt, StructStmt } from './ast';

export interface Location {
	readonly offset: number;
	readonly row: number;
	readonly column: number;
}

export interface ParserConfig {
	readonly position?: number;
}

export type Result<T> = SuccessResult<T> | FailureResult;

interface SuccessResult<T> {
	readonly state: true;
	readonly match: T;
	readonly start: number;
	readonly end: number;
}

interface FailureResult {
	readonly state: false;
	message (): SchemaParserError;
	readonly start: number;
}

export type TypeProviderStmt = TypeStmt | StructStmt;
export type TypeMap = Map<string, TypeProviderStmt>;
