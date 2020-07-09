/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { unexpectedProvider, ProviderError } from './error';
import { TypeProvider } from './typedef';

export function alloc (size: number) {
	return new DataView(new ArrayBuffer(size));
}

export const bufferGet = {
	0: {
		8:  (buf: DataView) => buf.getUint8.bind(buf),
		16: (buf: DataView) => buf.getUint16.bind(buf),
		32: (buf: DataView) => buf.getUint32.bind(buf),
		64: (buf: DataView) => buf.getBigUint64.bind(buf),
	},
	1: {
		8:  (buf: DataView) => buf.getInt8.bind(buf),
		16: (buf: DataView) => buf.getInt16.bind(buf),
		32: (buf: DataView) => buf.getInt32.bind(buf),
		64: (buf: DataView) => buf.getBigInt64.bind(buf),
	},
	float: {
		32: (buf: DataView) => buf.getFloat32.bind(buf),
		64: (buf: DataView) => buf.getFloat64.bind(buf),
	},
} as const;

export const bufferSet = {
	0: {
		8:  (buf: DataView) => buf.setUint8.bind(buf),
		16: (buf: DataView) => buf.setUint16.bind(buf),
		32: (buf: DataView) => buf.setUint32.bind(buf),
		64: (buf: DataView) => buf.setBigUint64.bind(buf),
	},
	1: {
		8:  (buf: DataView) => buf.setInt8.bind(buf),
		16: (buf: DataView) => buf.setInt16.bind(buf),
		32: (buf: DataView) => buf.setInt32.bind(buf),
		64: (buf: DataView) => buf.setBigInt64.bind(buf),
	},
	float: {
		32: (buf: DataView) => buf.setFloat32.bind(buf),
		64: (buf: DataView) => buf.setFloat64.bind(buf),
	},
} as const;

export function checkInt (int: number, what = 'integer') {
	if (int < 0 ||
		!isFinite(int) ||
		int % 1 !== 0 ||
		int > Number.MAX_SAFE_INTEGER) {
		throw new ProviderError(`Given ${what} is incorrect.`);
	}
}

export function getItemLength (
	lengthType: TypeProvider,
	data: DataView,
	offset: number,
): number {
	const itemLength = lengthType.parse(data, offset);

	if (typeof itemLength !== 'number') {
		throw unexpectedProvider('itemLength', 'number');
	}

	checkInt(itemLength, 'length');
	return itemLength;
}

type Class<T> = new (...args: never) => T;
export function isInstanceOf<T> (obj: unknown, klass: Class<T>): obj is T {
	return typeof obj === 'object' && obj instanceof klass;
}
