const tap = require('tap');
const { testTypeProvider, testInvalidType } = require('../../../helper');
const { IntegerType } =
	require('../../../../build/provider/types/number/integer');

const { ArrayBufferArray } =
	require('../../../../build/arraybuffer-array');

const buffer = new DataView(new ArrayBuffer(42));

/**
 * @type {TestItem[]}
 * @typedef {object} TestItem
 * @property {ConstructorParameters<typeof IntegerType>} args
 * @property {IntegerType} [instance]
 * @property {string} [name]
 * @property {number} [offset]
 * @property {number} [size]
 * @property {[number]} values
 */
const testList = [
	{ args: [8, false], values: [0x12] },
	{ args: [8, true], values: [0x12] },
	{ args: [16, false], values: [0x1234] },
	{ args: [16, true], values: [0x1234] },
	{ args: [32, false], values: [0x12345678] },
	{ args: [32, true], values: [0x12345678] },

	{ args: [8, false, false], values: [0x12] },
	{ args: [8, false, true], values: [0x12] },
	{ args: [8, true, false], values: [0x12] },
	{ args: [8, true, true], values: [0x12] },
	{ args: [16, false, false], values: [0x1234] },
	{ args: [16, false, true], values: [0x3412] },
	{ args: [16, true, false], values: [0x1234] },
	{ args: [16, true, true], values: [0x3412] },
	{ args: [32, false, false], values: [0x12345678] },
	{ args: [32, false, true], values: [0x78563412] },
	{ args: [32, true, false], values: [0x12345678] },
	{ args: [32, true, true], values: [0x78563412] },
];

let currentOffset = 0;

for (const item of testList) {
	const sign = item.args[1] ? 's' : 'u';
	item.instance = new IntegerType(...item.args);
	item.name = `${sign}int${item.args[0]}`;
	item.size = item.args[0] / 8;
	item.offset = currentOffset;
	const name = `set${item.args[1] ? 'I' : 'Ui'}nt${item.args[0]}`;
	buffer[name](currentOffset, item.values[0], item.args[2]);
	currentOffset += item.size;

	if (item.args.length === 3) {
		item.name += item.args[2] ? 'le' : 'be';
	}
}

tap.test('IntegerType', async (tap) => {
	testTypeProvider(tap, IntegerType.prototype, true);

	tap.test('.getLength', async (tap) => {
		for (const obj of testList) {
			tap.equal(
				obj.instance.getLength(),
				obj.size,
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
			let state = true;
			if (dview.byteLength !== obj.size) state = false;

			for (let offset = 0; offset < obj.size && state; offset++) {
				state = dview.getUint8(offset) ===
					buffer.getUint8(offset + obj.offset);
			}

			tap.ok(state, `must have correct output for ${obj.name}`);
		}

		testInvalidType(tap, testList[0].instance, 'stringify', 'number');
	});
});
