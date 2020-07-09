if (module.parent == null) require('tap').end();

exports.testTypeProvider = (tap, instance) => {
	tap.test(':TypeProvider', async (tap) => {
		tap.test('.getLength', async (tap) => {
			const func = instance.getLength;
			tap.type(func, 'function', 'must be a function.');
			tap.ok(func.length <= 2, 'must have 2 or less arguments.');
		});

		tap.test('.parse', async (tap) => {
			const func = instance.parse;
			tap.type(func, 'function', 'must be a function.');
			tap.ok(func.length <= 2, 'must have 2 or less arguments.');
		});

		tap.test('.stringify', async (tap) => {
			const func = instance.stringify;
			tap.type(func, 'function', 'must be a function.');
			tap.ok(func.length <= 1, 'must have 1 or less arguments.');
		});
	});
};

exports.testDeepTypeProvider = (tap, instance) => {
	tap.test(':DeepTypeProvider', async (tap) => {
		exports.testTypeProvider(tap, instance);

		tap.test('.getIndex', async (tap) => {
			const func = instance.getIndex;
			tap.type(func, 'function', 'must be a function.');
			tap.ok(func.length <= 3, 'must have 1 or less arguments.');
		});
	});
};
