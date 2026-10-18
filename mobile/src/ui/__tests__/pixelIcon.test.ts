import { ICONS } from '../PixelIcon';

describe('pixel icons', () => {
  it('are square grids of # and .', () => {
    for (const rows of Object.values(ICONS)) {
      for (const row of rows) expect(row).toMatch(new RegExp(`^[#.]{${rows.length}}$`));
    }
  });
});
