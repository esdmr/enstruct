/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BufferWriteObject, BufferReadObject } from './typedef';

export const read: BufferReadObject = {
	BE: {
		0: {
			8:  (...args) => Buffer.prototype.readUInt8.call(...args),
			16: (...args) => Buffer.prototype.readUInt16BE.call(...args),
			32: (...args) => Buffer.prototype.readUInt32BE.call(...args),
			64: (...args) => Buffer.prototype.readBigUInt64BE.call(...args),
		},
		1: {
			8:  (...args) => Buffer.prototype.readInt8.call(...args),
			16: (...args) => Buffer.prototype.readInt16BE.call(...args),
			32: (...args) => Buffer.prototype.readInt32BE.call(...args),
			64: (...args) => Buffer.prototype.readBigInt64BE.call(...args),
		},
		float: {
			32: (...args) => Buffer.prototype.readFloatBE.call(...args),
			64: (...args) => Buffer.prototype.readDoubleBE.call(...args),
		},
	},
	LE: {
		0: {
			8:  (...args) => Buffer.prototype.readUInt8.call(...args),
			16: (...args) => Buffer.prototype.readUInt16LE.call(...args),
			32: (...args) => Buffer.prototype.readUInt32LE.call(...args),
			64: (...args) => Buffer.prototype.readBigUInt64LE.call(...args),
		},
		1: {
			8:  (...args) => Buffer.prototype.readInt8.call(...args),
			16: (...args) => Buffer.prototype.readInt16LE.call(...args),
			32: (...args) => Buffer.prototype.readInt32LE.call(...args),
			64: (...args) => Buffer.prototype.readBigInt64LE.call(...args),
		},
		float: {
			32: (...args) => Buffer.prototype.readFloatLE.call(...args),
			64: (...args) => Buffer.prototype.readDoubleLE.call(...args),
		},
	},
};

export const write: BufferWriteObject = {
	BE: {
		0: {
			8:  (...args) => Buffer.prototype.writeUInt8.call(...args),
			16: (...args) => Buffer.prototype.writeUInt16BE.call(...args),
			32: (...args) => Buffer.prototype.writeUInt32BE.call(...args),
			64: (...args) => Buffer.prototype.writeBigUInt64BE.call(...args),
		},
		1: {
			8:  (...args) => Buffer.prototype.writeInt8.call(...args),
			16: (...args) => Buffer.prototype.writeInt16BE.call(...args),
			32: (...args) => Buffer.prototype.writeInt32BE.call(...args),
			64: (...args) => Buffer.prototype.writeBigInt64BE.call(...args),
		},
		float: {
			32: (...args) => Buffer.prototype.writeFloatBE.call(...args),
			64: (...args) => Buffer.prototype.writeDoubleBE.call(...args),
		},
	},
	LE: {
		0: {
			8:  (...args) => Buffer.prototype.writeUInt8.call(...args),
			16: (...args) => Buffer.prototype.writeUInt16LE.call(...args),
			32: (...args) => Buffer.prototype.writeUInt32LE.call(...args),
			64: (...args) => Buffer.prototype.writeBigUInt64LE.call(...args),
		},
		1: {
			8:  (...args) => Buffer.prototype.writeInt8.call(...args),
			16: (...args) => Buffer.prototype.writeInt16LE.call(...args),
			32: (...args) => Buffer.prototype.writeInt32LE.call(...args),
			64: (...args) => Buffer.prototype.writeBigInt64LE.call(...args),
		},
		float: {
			32: (...args) => Buffer.prototype.writeFloatLE.call(...args),
			64: (...args) => Buffer.prototype.writeDoubleLE.call(...args),
		},
	},
};
