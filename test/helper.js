/**
 * @typedef {InstanceType<import('tap')['Test']>} Test
 */
/**
 * @param {Test} tap
 * @param {import('../src/provider/typedef').TypeProvider} instance
 */
exports.testTypeProvider = (tap, instance) => {
	tap.test(':TypeProvider', async (tap) => {
		tap.test('.getLength', async (tap) => {
			const func = instance.getLength;
			tap.type(func, 'function', 'must be a function');
			tap.ok(func.length <= 2, 'must have 2 or less arguments');
		});

		tap.test('.parse', async (tap) => {
			const func = instance.parse;
			tap.type(func, 'function', 'must be a function');
			tap.ok(func.length <= 2, 'must have 2 or less arguments');
		});

		tap.test('.stringify', async (tap) => {
			const func = instance.stringify;
			tap.type(func, 'function', 'must be a function');
			tap.ok(func.length <= 1, 'must have 1 or less arguments');
		});
	});
};

/**
 *
 * @param {Test} tap
 * @param {import('../src/provider/typedef').DeepTypeProvider} instance
 */
exports.testDeepTypeProvider = (tap, instance) => {
	tap.test(':DeepTypeProvider', async (tap) => {
		exports.testTypeProvider(tap, instance);

		tap.test('.getIndex', async (tap) => {
			const func = instance.getIndex;
			tap.type(func, 'function', 'must be a function');
			tap.ok(func.length <= 3, 'must have 1 or less arguments');
		});
	});
};


const typeInstances =
	/* eslint-disable-next-line no-inline-comments */
	new Map(/** @type {[string | NewableFunction, never][]} */ ([
		['bigint', BigInt('12345678901234567890')],
		['boolean', true],
		['function', (...args) => console.log('Test invalid:', ...args)],
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

exports.testInvalidType = (tap, func, ...excludedTypes) => {
	for (const [key, value] of typeInstances) {
		if (!excludedTypes.includes(key)) {
			const name = typeof key === 'string' ? key : key.name;

			tap.throws(
				() => func(value),
				`must throw when given ${name}`,
			);
		}
	}
};
