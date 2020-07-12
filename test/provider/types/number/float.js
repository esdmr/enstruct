const tap = require('tap');
const { testTypeProvider, testInvalidType } = require('../../../helper');
const { FloatType } =
	require('../../../../build/provider/types/number/float');

const { ArrayBufferArray } =
	require('../../../../build/arraybuffer-array');

const buffer = new DataView(new ArrayBuffer(36));

/**
 * @type {TestItem[]}
 * @typedef {object} TestItem
 * @property {ConstructorParameters<typeof FloatType>} args
 * @property {FloatType} [instance]
 * @property {string} [name]
 * @property {number} [offset]
 * @property {number} [size]
 * @property {[number]} values
 */
const testList = [
	{ args: [32], values: [Infinity] },
	{ args: [64], values: [-Infinity] },

	{ args: [32, false], values: [Infinity] },
	{ args: [32, true], values: [Infinity] },
	{ args: [64, false], values: [-Infinity] },
	{ args: [64, true], values: [-Infinity] },
];

let currentOffset = 0;

for (const item of testList) {
	item.instance = new FloatType(...item.args);
	item.name = `float${item.args[0]}`;
	item.size = item.args[0] / 8;
	item.offset = currentOffset;
	const name = `setFloat${item.args[0]}`;
	buffer[name](currentOffset, item.values[0], item.args[1]);
	currentOffset += item.size;

	if (item.args.length === 2) {
		item.name += item.args[1] ? 'le' : 'be';
	}
}

tap.test('IntegerType', async (tap) => {
	testTypeProvider(tap, FloatType.prototype, true);

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
