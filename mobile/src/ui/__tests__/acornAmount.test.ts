import { formatCount } from '../AcornAmount';

describe('formatCount', () => {
  it('groups thousands', () => {
    expect(formatCount(30000)).toBe('30,000');
    expect(formatCount(120)).toBe('120');
  });
});
