/**
 * @typedef {InstanceType<import('tap')['Test']>} Test
 */
const { ArrayBufferArray } = require('../build/arraybuffer-array');

const ASSERT_MSG_FUNCTION = 'must be a function';

/**
 * @param {Test} tap
 * @param {number} nums
 * @param {Function} func
 */
function assertParameterLength (tap, nums, func) {
	const message = `must accept ${nums} argument${nums === 1 ? '' : 's'}.`;
	tap.ok(func.length === nums, message);
}

/**
 * @param {Test} tap
 * @param {import('../src/provider/typedef').TypeProvider} instance
 * @param {boolean} [staticLength]
 * @param {boolean} [constant]
 */
exports.testTypeProvider = (
	tap,
	instance,
	staticLength = false,
	constant = false,
) => {
	const msgStatic = staticLength ? ' (staticLength)' : '';
	const msgConst = constant ? ' (constant)' : '';

	tap.test(':TypeProvider', async (tap) => {
		tap.test(`.getLength${msgStatic}`, async (tap) => {
			const func = instance.getLength;
			tap.type(func, 'function', ASSERT_MSG_FUNCTION);
			assertParameterLength(tap, staticLength ? 0 : 2, func);
		});

		tap.test(`.parse${msgConst}`, async (tap) => {
			const func = instance.parse;
			tap.type(func, 'function', ASSERT_MSG_FUNCTION);
			assertParameterLength(tap, constant ? 0 : 2, func);
		});

		tap.test(`.stringify${msgConst}`, async (tap) => {
			const func = instance.stringify;
			tap.type(func, 'function', ASSERT_MSG_FUNCTION);
			assertParameterLength(tap, constant ? 0 : 1, func);
		});
	});
};

/**
 * @param {Test} tap
 * @param {import('../src/provider/typedef').DeepTypeProvider} instance
 */
exports.testDeepTypeProvider = (tap, instance, staticLength, constant) => {
	tap.test(':DeepTypeProvider', async (tap) => {
		exports.testTypeProvider(tap, instance, staticLength, constant);

		tap.test('.getIndex', async (tap) => {
			const func = instance.getIndex;
			tap.type(func, 'function', ASSERT_MSG_FUNCTION);
			assertParameterLength(tap, 3, func);
		});
	});
};


const typeInstances =
	/* eslint-disable-next-line no-inline-comments */
	new Map(/** @type {[string | NewableFunction, never][]} */ ([
		['bigint', BigInt('123456780')],
		['boolean', true],
		['function', () => null],
		['infinity', Infinity],
		['nan', NaN],
		['null', null],
		['number', 0xDEADBEEF],
		['object', {}],
		['string', 'Test invalid parm'],
		['symbol', Symbol('Test invalid param')],
		/* eslint-disable-next-line no-undefined */
		['undefined', undefined],
		[ArrayBuffer, new ArrayBuffer(0)],
		[DataView, new DataView(new ArrayBuffer(0))],
	]));

/**
 * @template {string} T
 * @param {Test} tap
 * @param {{[x in T]: (arg: unknown) => unknown}} obj
 * @param {T} func
 * @param  {...string | NewableFunction} excludedTypes
 */
exports.testInvalidType = (tap, obj, func, ...excludedTypes) => {
	for (const [key, value] of typeInstances) {
		if (!excludedTypes.includes(key)) {
			const name = typeof key === 'string' ? key : key.name;

			tap.throws(
				() => obj[func](value),
				`must throw when given ${name}`,
			);
		}
	}
};

/**
 * @param {Test} tap
 * @param {TestData} testData
 *
 * @typedef {object} TestData
 * @property {DataView} buffer
 * @property {TestCase[]} cases
 * @property {new (...args: unknown[]) =>
 *  import('../build/provider/typedef').TypeProvider} constructor
 * @property {(string | NewableFunction)[]} outputTypes
 *
 * @typedef {object} TestCase
 * @property {unknown[]} args
 * @property {number} offset
 * @property {string} name
 * @property {number} size
 * @property {unknown} value
 */
exports.runTestCases = (tap, testData) => {
	const instances =
		testData.cases.map(({ args }) => new testData.constructor(...args));

	tap.test('.getLength', async (tap) => {
		for (const [index, obj] of testData.cases.entries()) {
			tap.equal(
				obj.size,
				instances[index].getLength(testData.buffer, obj.offset),
				`must have correct output for ${obj.name}`,
			);
		}
	});

	tap.test('.parse', async (tap) => {
		for (const [index, obj] of testData.cases.entries()) {
			tap.equal(
				obj.value,
				instances[index].parse(testData.buffer, obj.offset),
				`must have correct output for ${obj.name}`,
			);
		}
	});

	tap.test('.stringify', async (tap) => {
		for (const [index, obj] of testData.cases.entries()) {
			const testBuf = instances[index].stringify(obj.value);
			const dview = new ArrayBufferArray(testBuf).toDataView();
			let state = dview.byteLength === obj.size;

			for (let offset = 0; offset < obj.size && state; offset++) {
				state = dview.getUint8(offset) ===
					testData.buffer.getUint8(offset + obj.offset);
			}

			tap.ok(state, `must have correct output for ${obj.name}`);
		}

		exports.testInvalidType(
			tap,
			testData.constructor.prototype,
			'stringify',
			...testData.outputTypes,
		);
	});
};
