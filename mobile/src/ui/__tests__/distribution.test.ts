import { topCandidates } from '../distribution';

describe('topCandidates', () => {
  it('returns the top three, highest first, marking the choice', () => {
    const rows = topCandidates({
      choice: 'b',
      probabilities: { a: 0.1, b: 0.5, c: 0.25, d: 0.15 },
      confidence: 0.5,
    });
    expect(rows).toEqual([
      { key: 'b', percent: 50, chosen: true },
      { key: 'c', percent: 25, chosen: false },
      { key: 'd', percent: 15, chosen: false },
    ]);
  });
});
