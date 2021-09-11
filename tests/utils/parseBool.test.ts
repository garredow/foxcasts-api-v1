import { parseBool } from '../../src/utils/parseBool';

describe('parseBool()', () => {
  const cases = [
    { source: 'true', expectedVal: true, defaultVal: undefined },
    { source: 'TRUE', expectedVal: true, defaultVal: undefined },
  ];
  it.each(cases)(
    'should return value',
    ({ source, expectedVal, defaultVal }) => {
      const result = parseBool(source, defaultVal);

      expect(result).toEqual(expectedVal);
    }
  );
});
