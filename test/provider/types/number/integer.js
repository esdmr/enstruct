const tap = require('tap');
const { testTypeProvider } = require('../../../helper');
const { IntegerType } =
	require('../../../../build/provider/types/number/integer');

const buffer = new DataView(Uint8Array.of(0x12, 0x34, 0x56, 0x78).buffer);

/**
 * @type {TestItem[]}
 * @typedef {object} TestItem
 * @property {ConstructorParameters<typeof IntegerType>} args
 * @property {IntegerType} [instance]
 * @property {string} [name]
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

for (const item of testList) {
	const sign = item.args[1] ? 's' : 'u';
	item.instance = new IntegerType(...item.args);
	item.name = `${sign}int${item.args[0]}`;
	item.size = item.args[0] / 8;

	if (item.args.length === 3) {
		item.name += item.args[2] ? 'le' : 'be';
	}
}

tap.test('IntegerType', async (tap) => {
	testTypeProvider(tap, IntegerType.prototype);

	tap.test('.getLength', async (tap) => {
		const func = IntegerType.prototype.getLength;
		tap.equal(func.length, 0, 'must accept no arguments.');

		for (const obj of testList) {
			tap.equal(
				obj.instance.getLength(),
				obj.size,
				`must have correct output for ${obj.name}.`,
			);
		}
	});

	tap.test('.parse', async (tap) => {
		for (const obj of testList) {
			tap.equal(
				obj.instance.parse(buffer, 0),
				obj.values[0],
				`must have correct output for ${obj.name}.`,
			);
		}
	});
});
