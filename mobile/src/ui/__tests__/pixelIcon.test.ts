import { ICONS } from '../PixelIcon';

describe('pixel icons', () => {
  it('are 7×7 grids of # and .', () => {
    for (const rows of Object.values(ICONS)) {
      expect(rows).toHaveLength(7);
      for (const row of rows) expect(row).toMatch(/^[#.]{7}$/);
    }
  });
});
