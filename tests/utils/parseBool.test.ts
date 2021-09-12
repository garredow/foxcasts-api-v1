import { parseBool } from '../../src/utils/parseBool';

describe('parseBool()', () => {
  const cases = [
    { source: 'true', expectedVal: true, defaultVal: undefined },
    { source: 'TRUE', expectedVal: true, defaultVal: undefined },
    { source: 'false', expectedVal: false, defaultVal: undefined },
    { source: 'FALSE', expectedVal: false, defaultVal: undefined },
    { source: undefined, expectedVal: true, defaultVal: true },
    { source: undefined, expectedVal: false, defaultVal: false },
    { source: 'other', expectedVal: true, defaultVal: true },
    { source: 'OTHER', expectedVal: false, defaultVal: false },
  ];
  it.each(cases)(
    'should return value',
    ({ source, expectedVal, defaultVal }) => {
      const result = parseBool(source, defaultVal);

      expect(result).toEqual(expectedVal);
    }
  );
});
