const tap = require('tap');
const { testTypeProvider, testInvalidType } = require('../../helper');
const { BooleanType } =
	require('../../../build/provider/types/boolean');

const { ArrayBufferArray } =
	require('../../../build/arraybuffer-array');

const buffer = new DataView(new ArrayBuffer(42));

/**
 * @type {TestItem[]}
 * @typedef {object} TestItem
 * @property {BooleanType} [instance]
 * @property {number} [offset]
 * @property {[boolean]} values
 */
const testList = [
	{ values: [false] },
	{ values: [true] },
];

let currentOffset = 0;

for (const item of testList) {
	item.instance = new BooleanType();
	item.offset = currentOffset;
	buffer.setUint8(currentOffset, item.values[0] ? 1 : 0);
	currentOffset += 1;
}

tap.test('BooleanType', async (tap) => {
	testTypeProvider(tap, BooleanType.prototype, true);

	tap.test('.getLength', async (tap) => {
		for (const obj of testList) {
			tap.equal(
				obj.instance.getLength(),
				1,
				'must have correct output',
			);
		}
	});

	tap.test('.parse', async (tap) => {
		for (const obj of testList) {
			tap.equal(
				obj.instance.parse(buffer, obj.offset),
				obj.values[0],
				'must have correct output',
			);
		}
	});

	tap.test('.stringify', async (tap) => {
		for (const obj of testList) {
			const testBuf = obj.instance.stringify(obj.values[0]);
			const dview = new ArrayBufferArray(testBuf).toDataView();

			const state = dview.byteLength === 1 &&
				dview.getUint8(0) === buffer.getUint8(obj.offset);

			tap.ok(state, 'must have correct output');
		}

		testInvalidType(tap, testList[0].instance, 'stringify', 'boolean');
	});
});
