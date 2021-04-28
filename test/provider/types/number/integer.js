const tap = require('tap');
const { testTypeProvider, runTestCases } = require('../../../helper');
const { IntegerType } =
	require('../../../../build/provider/types/number/integer');

tap.test('IntegerType', async (tap) => {
	testTypeProvider(tap, IntegerType.prototype, true);

	runTestCases(tap, {
		buffer:      new DataView(Uint32Array.of(0x78563412).buffer),
		constructor: IntegerType,
		outputTypes: ['number'],

		cases: [
			{
				args:   [8, false],
				offset: 0,
				size:   1,
				value:  0x12,
				name:   'uint8',
			},
			{
				args:   [8, true],
				offset: 0,
				size:   1,
				value:  0x12,
				name:   'int8',
			},
			{
				args:   [16, false],
				offset: 0,
				size:   2,
				value:  0x1234,
				name:   'uint16',
			},
			{
				args:   [16, true],
				offset: 0,
				size:   2,
				value:  0x1234,
				name:   'int16',
			},
			{
				args:   [32, false],
				offset: 0,
				size:   4,
				value:  0x12345678,
				name:   'uint32',
			},
			{
				args:   [32, true],
				offset: 0,
				size:   4,
				value:  0x12345678,
				name:   'int32',
			},
			{
				args:   [8, false, false],
				offset: 0,
				size:   1,
				value:  0x12,
				name:   'uint8be',
			},
			{
				args:   [8, false, true],
				offset: 0,
				size:   1,
				value:  0x12,
				name:   'uint8le',
			},
			{
				args:   [8, true, false],
				offset: 0,
				size:   1,
				value:  0x12,
				name:   'int8be',
			},
			{
				args:   [8, true, true],
				offset: 0,
				size:   1,
				value:  0x12,
				name:   'int8le',
			},
			{
				args:   [16, false, false],
				offset: 0,
				size:   2,
				value:  0x1234,
				name:   'uint16be',
			},
			{
				args:   [16, false, true],
				offset: 0,
				size:   2,
				value:  0x3412,
				name:   'uint16le',
			},
			{
				args:   [16, true, false],
				offset: 0,
				size:   2,
				value:  0x1234,
				name:   'int16be',
			},
			{
				args:   [16, true, true],
				offset: 0,
				size:   2,
				value:  0x3412,
				name:   'int16le',
			},
			{
				args:   [32, false, false],
				offset: 0,
				size:   4,
				value:  0x12345678,
				name:   'uint32be',
			},
			{
				args:   [32, false, true],
				offset: 0,
				size:   4,
				value:  0x78563412,
				name:   'uint32le',
			},
			{
				args:   [32, true, false],
				offset: 0,
				size:   4,
				value:  0x12345678,
				name:   'int32be',
			},
			{
				args:   [32, true, true],
				offset: 0,
				size:   4,
				value:  0x78563412,
				name:   'int32le',
			},
		],
	});
});
