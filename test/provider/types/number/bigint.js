const tap = require('tap');
const { testTypeProvider, testInvalidType } = require('../../../helper');
const { BigIntType } =
	require('../../../../build/provider/types/number/bigint');

const { ArrayBufferArray } =
	require('../../../../build/arraybuffer-array');

const buffer = new DataView(new ArrayBuffer(48));

/**
 * @type {TestItem[]}
 * @typedef {object} TestItem
 * @property {ConstructorParameters<typeof BigIntType>} args
 * @property {BigIntType} [instance]
 * @property {string} [name]
 * @property {number} [offset]
 * @property {[bigint]} values
 */
const testList = [
	{ args: [false], values: [BigInt(123)] },
	{ args: [true], values: [BigInt(-123)] },

	{ args: [false, false], values: [BigInt(456)] },
	{ args: [false, true], values: [BigInt(789)] },
	{ args: [true, false], values: [BigInt(-456)] },
	{ args: [true, true], values: [BigInt(-789)] },
];

let currentOffset = 0;

for (const item of testList) {
	const sign = item.args[1] ? 's' : 'u';
	item.instance = new BigIntType(...item.args);
	item.name = `${sign}int64`;
	item.offset = currentOffset;
	const name = `setBig${item.args[0] ? 'I' : 'Ui'}nt64`;
	buffer[name](currentOffset, item.values[0], item.args[1]);
	currentOffset += 8;

	if (item.args.length === 2) {
		item.name += item.args[1] ? 'le' : 'be';
	}
}

tap.test('BigIntType', async (tap) => {
	testTypeProvider(tap, BigIntType.prototype, true);

	tap.test('.getLength', async (tap) => {
		for (const obj of testList) {
			tap.equal(
				obj.instance.getLength(),
				8,
				`must have correct output for ${obj.name}`,
			);
		}
	});

	tap.test('.parse', async (tap) => {
		for (const obj of testList) {
			tap.equal(
				obj.instance.parse(buffer, obj.offset),
				obj.values[0],
				`must have correct output for ${obj.name}`,
			);
		}
	});

	tap.test('.stringify', async (tap) => {
		for (const obj of testList) {
			const testBuf = obj.instance.stringify(obj.values[0]);
			const dview = new ArrayBufferArray(testBuf).toDataView();
			let state = dview.byteLength === 8;

			for (let offset = 0; offset < 8 && state; offset++) {
				state = dview.getUint8(offset) ===
					buffer.getUint8(offset + obj.offset);
			}

			tap.ok(state, `must have correct output for ${obj.name}`);
		}

		testInvalidType(tap, testList[0].instance, 'stringify', 'bigint');
	});
});
