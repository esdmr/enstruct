import type { SchemaParserError } from './error';

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
