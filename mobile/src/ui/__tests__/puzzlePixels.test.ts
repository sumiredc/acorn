import { PIECES, PUZZLES } from '../puzzlePixels';

describe('timeline puzzles', () => {
  it.each([1, 2, 3] as const)('splits a 12×12 square into %i pieces', (count) => {
    const rows = PUZZLES[count];
    expect(rows).toHaveLength(12);
    for (const row of rows) expect(row).toHaveLength(12);
    expect(new Set(rows.join(''))).toEqual(new Set(PIECES.slice(0, count)));
  });
});
