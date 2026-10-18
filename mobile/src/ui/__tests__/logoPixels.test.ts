import { LOGO_COLORS, LOGO_PIXELS } from '../logoPixels';

describe('logo', () => {
  it('is a square grid that only uses known colors', () => {
    for (const row of LOGO_PIXELS) {
      expect(row).toHaveLength(LOGO_PIXELS.length);
      for (const cell of row) expect(cell === '.' || cell in LOGO_COLORS).toBe(true);
    }
  });
});
