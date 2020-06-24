import {
	OptionStatement, RootEnvironment, StructProperty, StructStatement,
	TypeReference, TypeStatement,
} from './ast';
import { SchemaParserError } from './error';
import type {
	Location, ParserConfig, Result, TypedStatement,
} from './typedef';

const wrapExpect = <T extends (...args: never[]) => Result<unknown>> (
	_target: SchemaParser,
	_propertyKey: string | symbol,
	descriptor: TypedPropertyDescriptor<T>,
) => {
	const func = descriptor.value;
	if (func == null) throw new TypeError('Cannot wrap null or undefined.');

	descriptor.value = function wrapped (
		this: SchemaParser,
		...args: Parameters<T>
	) {
		const position = this.position;
		const result = func.call(this, ...args);
		if (!result.state) this.position = position;
		return result;
	} as T;

	return descriptor;
};

export class SchemaParser {
	private readonly keywordOption = 'option';
	private readonly keywordStruct = 'struct';
	private readonly keywordType = 'type';

	private readonly regexIdentifier = /[a-zA-Z_][a-zA-Z0-9_]*/uy;
	private readonly regexInt = /([1-9][0-9]*)|0/uy;
	private readonly regexSpacing = /[ \t\n\r]+/uy;

	private readonly symbolLeftArray = '[';
	private readonly symbolLeftStruct = '{';
	private readonly symbolRightArray = ']';
	private readonly symbolRightStruct = '}';
	private readonly symbolStmtTerminator = ';';
	private readonly symbolTypeAssignment = '=';

	private readonly OPTION_INVALID_SYNTAX = 'Incorrect option statement.';
	private readonly STRUCT_INVALID_PROP = 'Invalid struct property.';
	private readonly STRUCT_INVALID_SYNTAX = 'Incorrect struct statement.';
	private readonly STRUCT_MISSING_SEMI = 'Missing semicolon in struct.';
	private readonly TYPE_INVALID_SYNTAX = 'Incorrect type statement.';

	private readonly OPTION_ONLY_AT_TOP =
	'Option statements are only allowed at top.';

	private readonly REGEX_NOT_STICKY =
	'Regex given to expectRegex must have y(Sticky) flag set.';

	position = 0;
	private length: number;
	private newlineCache?: readonly number[];

	constructor (
		private readonly text: string,
		private readonly config: ParserConfig = {},
	) {
		this.position = config.position ?? 0;
		this.length = text.length;
	}

	start (): RootEnvironment {
		this.position = this.config.position ?? 0;
		this.expectSpacing();
		const env = this.expectRootEnv();
		if (!env.state) throw env.message();
		this.expectSpacing();
		const eof = this.expectEOF();
		if (!eof.state) throw eof.message();
		return env.match;
	}

	private getNewLinePositions (): readonly number[] {
		if (this.newlineCache != null) return this.newlineCache;

		const length = this.length;
		const newline = '\n';
		const positions: number[] = [];

		for (let index = 0; index < length; index++) {
			if (this.text[index] === newline) {
				positions.push(index);
			}
		}

		this.newlineCache = positions;
		return positions;
	}

	private computeLocation (offset: number): Location {
		const newlinePositions = this.getNewLinePositions();
		let row = 1;
		let column = offset + 1;

		for (const position of newlinePositions) {
			if (offset <= position) break;
			row += 1;
			column = offset - position;
		}

		return { offset, row, column };
	}

	@wrapExpect
	private expectString<T extends string> (
		text: T,
		length = text.length,
	): Result<T> {
		const substring = this.text.substr(this.position, length);
		const startPosition = this.position;

		if (substring === text) {
			this.position += length;
			const match = substring as T;
			return {
				state: true,
				match: match,
				start: startPosition,
				end:   this.position,
			};
		}
		const message = () => SchemaParserError.
			expectedString(text, this.computeLocation(startPosition));

		return {
			state:   false,
			message: message,
			start:   startPosition,
		};
	}

	@wrapExpect
	private expectRegex (regex: RegExp): Result<string> {
		if (!regex.sticky) {
			throw new Error(this.REGEX_NOT_STICKY);
		}

		const startPosition = this.position;
		const oldLastIndex = regex.lastIndex;
		regex.lastIndex = startPosition;
		const result = regex.exec(this.text);

		if (result == null) {
			regex.lastIndex = oldLastIndex;
			const message = () => SchemaParserError.
				expectedRegEx(regex, this.computeLocation(startPosition));

			return {
				state:   false,
				message: message,
				start:   startPosition,
			};
		}

		this.position = regex.lastIndex;
		regex.lastIndex = oldLastIndex;

		return {
			state: true,
			match: result[0],
			start: startPosition,
			end:   this.position,
		};
	}

	@wrapExpect
	private expectEOF (): Result<null> {
		if (this.position === this.length) {
			return {
				state: true,
				match: null,
				start: this.position,
				end:   this.position,
			};
		}
		const start = this.computeLocation(this.position);
		const end = this.computeLocation(this.length);
		const message = () => SchemaParserError.
			expected('End Of File', start, end);

		return {
			state:   false,
			message: message,
			start:   start.offset,
		};
	}

	@wrapExpect
	private expectIdentifier (): Result<string> {
		const result = this.expectRegex(this.regexIdentifier);

		if (!result.state) {
			result.message = () => SchemaParserError.
				expected('Identifier', this.computeLocation(result.start));
		}

		return result;
	}

	@wrapExpect
	private expectInt (): Result<number> {
		const result = this.expectRegex(this.regexInt);

		if (!result.state) {
			result.message = () => SchemaParserError.
				expected('Integer', this.computeLocation(result.start));

			return result;
		}

		return { ...result, match: parseInt(result.match, 10) };
	}

	@wrapExpect
	private expectSpacing (): Result<string> {
		const result = this.expectRegex(this.regexSpacing);

		if (!result.state) {
			result.message = () => SchemaParserError.
				expected('Space', this.computeLocation(result.start));
		}

		return result;
	}

	@wrapExpect
	private expectType (): Result<TypeReference> {
		const identifier = this.expectRegex(this.regexIdentifier);
		if (!identifier.state) return identifier;
		const array = this.expectTypeArray();

		const match = new TypeReference(
			identifier.match,
			array.state ? array.match : false,
		);

		return {
			state: true,
			match: match,
			start: identifier.start,
			end:   array.state ? array.end : identifier.end,
		};
	}

	@wrapExpect
	private expectTypeArray (): Result<number | true> {
		const left = this.expectString(this.symbolLeftArray);
		if (!left.state) return left;
		const int = this.expectInt();
		const right = this.expectString(this.symbolRightArray);
		if (!right.state) throw right.message();

		return {
			state: true,
			match: int.state ? int.match : true,
			start: left.start,
			end:   right.end,
		};
	}

	@wrapExpect
	private expectOption (): Result<OptionStatement> {
		const keyword = this.expectString(this.keywordOption);
		if (!keyword.state) return keyword;
		const space0 = this.expectSpacing();
		if (!space0.state) throw space0.message();
		const identifier = this.expectIdentifier();
		if (!identifier.state) throw identifier.message();
		this.expectSpacing();
		const terminator = this.expectString(this.symbolStmtTerminator);
		if (!terminator.state) throw terminator.message();

		return {
			state: true,
			match: new OptionStatement(identifier.match),
			start: keyword.start,
			end:   terminator.end,
		};
	}

	@wrapExpect
	private expectAlias (): Result<TypeStatement> {
		const keyword = this.expectString(this.keywordType);
		if (!keyword.state) return keyword;
		const identifier = this.expectAliasIdentifier();
		this.expectSpacing();
		const assignment = this.expectString(this.symbolTypeAssignment);
		if (!assignment.state) throw assignment.message();
		this.expectSpacing();
		const type = this.expectType();
		if (!type.state) throw type.message();
		this.expectSpacing();
		const terminator = this.expectString(this.symbolStmtTerminator);
		if (!terminator.state) throw terminator.message();

		const start = this.computeLocation(keyword.start);
		const end = this.computeLocation(terminator.end);

		const match = new TypeStatement(
			identifier.state ? identifier.match : null,
			type.match,
			start,
			end,
		);

		return {
			state: true,
			match: match,
			start: start.offset,
			end:   end.offset,
		};
	}

	@wrapExpect
	private expectAliasIdentifier (): Result<string> {
		const space = this.expectSpacing();
		if (!space.state) return space;
		const identifier = this.expectIdentifier();
		return identifier;
	}

	@wrapExpect
	private expectStruct (): Result<StructStatement> {
		const keyword = this.expectString(this.keywordStruct);
		if (!keyword.state) return keyword;
		const space = this.expectSpacing();
		if (!space.state) throw space.message();
		const name = this.expectIdentifier();
		if (!name.state) throw name.message();
		this.expectSpacing();
		const left = this.expectString(this.symbolLeftStruct);
		if (!left.state) throw left.message();
		this.expectSpacing();
		const props: StructProperty[] = [];

		while (true) {
			const property = this.expectStructProperty();
			if (!property.state) break;
			props.push(property.match);
			this.expectSpacing();
		}

		const right = this.expectString(this.symbolRightStruct);
		if (!right.state) throw right.message();

		const start = this.computeLocation(keyword.start);
		const end = this.computeLocation(right.end);

		return {
			state: true,
			match: new StructStatement(name.match, props),
			start: start.offset,
			end:   end.offset,
		};
	}

	@wrapExpect
	private expectStructProperty (): Result<StructProperty> {
		const type = this.expectType();
		if (!type.state) return type;
		const space = this.expectSpacing();
		if (!space.state) throw space.message();
		const name = this.expectIdentifier();
		if (!name.state) throw name.message();
		const terminator = this.expectString(this.symbolStmtTerminator);
		if (!terminator.state) throw terminator.message();

		const start = this.computeLocation(type.start);
		const end = this.computeLocation(terminator.end);

		return {
			state: true,
			match: new StructProperty(name.match, type.match, start, end),
			start: start.offset,
			end:   end.offset,
		};
	}

	@wrapExpect
	private expectRootEnv (): Result<RootEnvironment> {
		const header = this.expectRootEnvHeader();
		const options = header.state ? header.match : [];
		this.expectSpacing();
		const body = this.expectRootEnvBody();
		const statements = body.state ? body.match : [];
		const start = this.computeLocation(header.start);
		const end = this.computeLocation(this.position);

		return {
			state: true,
			match: new RootEnvironment(options, statements, start, end),
			start: start.offset,
			end:   end.offset,
		};
	}

	@wrapExpect
	private expectRootEnvHeader (): Result<OptionStatement[]> {
		const options: OptionStatement[] = [];
		const start = this.position;

		const initial = this.expectOption();
		if (!initial.state) return initial;
		options.push(initial.match);

		while (true) {
			const { start: spaceStart } = this.expectSpacing();
			const option = this.expectOption();

			if (option.state) {
				options.push(option.match);
			} else {
				// Rollback last spacing.
				this.position = spaceStart;
				break;
			}
		}

		return {
			state: true,
			match: options,
			start: start,
			end:   this.position,
		};
	}

	@wrapExpect
	private expectRootEnvBody (): Result<TypedStatement[]> {
		const statements: TypedStatement[] = [];
		const initial = this.expectTypeProvider();

		if (initial.state) {
			statements.push(initial.match);

			while (true) {
				const { start: spaceStart } = this.expectSpacing();
				const statement = this.expectTypeProvider();

				if (!statement.state) {
					this.position = spaceStart;
					break;
				}

				statements.push(statement.match);
			}
		}

		return { state: true,
			match: statements,
			start: initial.start,
			end:   this.position,
		};
	}

	@wrapExpect
	private expectTypeProvider (): Result<TypedStatement> {
		const struct = this.expectStruct();
		if (struct.state) return struct;

		const alias = this.expectAlias();
		if (alias.state) return alias;

		const option = this.expectString(this.keywordOption);

		if (option.state) {
			const start = this.computeLocation(option.start);
			const end = this.computeLocation(option.end);
			throw new SchemaParserError(this.OPTION_ONLY_AT_TOP, start, end);
		}

		const start = this.computeLocation(this.position);

		return {
			state:   false,
			message: () => SchemaParserError.expected('Statement', start),
			start:   start.offset,
		};
	}
}
