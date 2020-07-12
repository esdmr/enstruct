/**
 * @typedef {InstanceType<import('tap')['Test']>} Test
 */
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
			tap.type(func, 'function', 'must be a function');

			if (staticLength) {
				tap.ok(func.length === 0, 'must accept no arguments.');
			} else {
				tap.ok(func.length === 2, 'must accept 2 arguments');
			}
		});

		tap.test(`.parse${msgConst}`, async (tap) => {
			const func = instance.parse;
			tap.type(func, 'function', 'must be a function');

			if (constant) {
				tap.ok(func.length === 0, 'must accept no arguments');
			} else {
				tap.ok(func.length === 2, 'must accept 2 arguments');
			}
		});

		tap.test(`.stringify${msgConst}`, async (tap) => {
			const func = instance.stringify;
			tap.type(func, 'function', 'must be a function');

			if (constant) {
				tap.ok(func.length === 0, 'must accept no arguments');
			} else {
				tap.ok(func.length === 1, 'must accept 1 arguments');
			}
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
		['bigint', BigInt('123456780')],
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

/**
 *
 * @template {string} T
 * @param {Test} tap
 * @param {{[x in T]: (arg: unknown) => unknown}} obj
 * @param {T} func
 * @param  {...any} excludedTypes
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
