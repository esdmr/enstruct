/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export function alloc (size: number) {
	return new DataView(new ArrayBuffer(size));
}

export const bufferGet = {
	0: {
		8:  (buf: DataView) => buf.getUint8,
		16: (buf: DataView) => buf.getUint16,
		32: (buf: DataView) => buf.getUint32,
		64: (buf: DataView) => buf.getBigUint64,
	},
	1: {
		8:  (buf: DataView) => buf.getInt8,
		16: (buf: DataView) => buf.getInt16,
		32: (buf: DataView) => buf.getInt32,
		64: (buf: DataView) => buf.getBigInt64,
	},
	float: {
		32: (buf: DataView) => buf.getFloat32,
		64: (buf: DataView) => buf.getFloat64,
	},
} as const;

export const bufferSet = {
	0: {
		8:  (buf: DataView) => buf.setUint8,
		16: (buf: DataView) => buf.setUint16,
		32: (buf: DataView) => buf.setUint32,
		64: (buf: DataView) => buf.setBigUint64,
	},
	1: {
		8:  (buf: DataView) => buf.setInt8,
		16: (buf: DataView) => buf.setInt16,
		32: (buf: DataView) => buf.setInt32,
		64: (buf: DataView) => buf.setBigInt64,
	},
	float: {
		32: (buf: DataView) => buf.setFloat32,
		64: (buf: DataView) => buf.setFloat64,
	},
} as const;
