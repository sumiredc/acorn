// Timeline puzzles as 12×12 pixel maps, one per number of daily missions.
// Each letter is a piece ('a' fills first); knobs make neighbouring pieces interlock.
export const PUZZLES: Record<1 | 2 | 3, string[]> = {
  1: Array.from({ length: 12 }, () => 'aaaaaaaaaaaa'),
  2: [
    'aaaaaabbbbbb',
    'aaaaaabbbbbb',
    'aaaaaabbbbbb',
    'aaaaaabbbbbb',
    'aaaaaaaabbbb',
    'aaaaaaaabbbb',
    'aaaaaaaabbbb',
    'aaaabbbbbbbb',
    'aaaabbbbbbbb',
    'aaaaaabbbbbb',
    'aaaaaabbbbbb',
    'aaaaaabbbbbb',
  ],
  3: [
    'aaaaaabbbbbb',
    'aaaaaabbbbbb',
    'aaaaaaaabbbb',
    'aaaaaaaabbbb',
    'aaccaabbbbbb',
    'aaccaabbbbbb',
    'ccccccccbbcc',
    'ccccccccbbcc',
    'cccccccccccc',
    'cccccccccccc',
    'cccccccccccc',
    'cccccccccccc',
  ],
};

export const PIECES = ['a', 'b', 'c'];
