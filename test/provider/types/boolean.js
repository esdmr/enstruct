const tap = require('tap');
const { testTypeProvider, runTestCases } = require('../../helper');
const { BooleanType } =
	require('../../../build/provider/types/boolean');

tap.test('BooleanType', async (tap) => {
	testTypeProvider(tap, BooleanType.prototype, true);

	runTestCases(tap, {
		buffer:      new DataView(Uint8Array.of(0, 1, 2).buffer),
		constructor: BooleanType,
		outputTypes: ['boolean'],

		cases: [
			{ args: [], size: 1, offset: 0, value: false, name: 'false' },
			{ args: [], size: 1, offset: 1, value: true, name: 'true' },
		],
	});
});
