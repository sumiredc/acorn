import { StyleSheet, View } from 'react-native';

import { colors } from './theme';

// Small one-color pixel icons, mostly 7×7. '#' is drawn, '.' is transparent.
export const ICONS = {
  daily: ['...#...', '.#...#.', '..###..', '#.###.#', '..###..', '.#...#.', '...#...'],
  weekly: ['#######', '#######', '#.....#', '#.#.#.#', '#.....#', '#.#.#.#', '#######'],
  buttons: ['...#...', '...#...', '.#####.', '...#...', '...#...', '.......', '.#####.'],
  bar: ['.......', '.......', '#######', '####..#', '#######', '.......', '.......'],
  number: ['.......', '.#.#.#.', '.......', '.#.#.#.', '.......', '.#.#.#.', '.......'],
  // 9×9 so the pencil's eraser, outline and tip all read.
  record: [
    '.......##',
    '......###',
    '.....###.',
    '....#.#..',
    '...#.#...',
    '..#.#....',
    '.#.#.....',
    '###......',
    '#........',
  ],
  undo: ['..#....', '.##....', '######.', '.##...#', '..#...#', '......#', '..####.'],
  close: ['#.....#', '.#...#.', '..#.#..', '...#...', '..#.#..', '.#...#.', '#.....#'],
  save: ['.......', '......#', '.....##', '#...##.', '##.##..', '.###...', '..#....'],
  check: ['#######', '#.....#', '#.....#', '#.....#', '#.....#', '#.....#', '#######'],
  trash: ['..###..', '#######', '.#####.', '.#.#.#.', '.#.#.#.', '.#.#.#.', '.#####.'],
  max: ['.......', '#..#..#', '##.##.#', '#######', '##.##.#', '#..#..#', '.......'],
};

export type IconName = keyof typeof ICONS;

export function PixelIcon({
  name,
  size = 14,
  color = colors.ink,
  label,
}: {
  name: IconName;
  // Size of a 7×7 icon; larger grids keep the same pixel size and come out bigger.
  size?: number;
  color?: string;
  label?: string;
}) {
  const rows = ICONS[name];
  const pixel = size / 7;
  const side = pixel * rows.length;
  return (
    <View
      accessible={label !== undefined}
      accessibilityRole={label !== undefined ? 'image' : undefined}
      accessibilityLabel={label}
      style={{ width: side, height: side }}
    >
      {rows.map((row, y) => (
        <View key={y} style={styles.row}>
          {[...row].map((cell, x) => (
            <View
              key={x}
              style={{
                width: pixel,
                height: pixel,
                backgroundColor: cell === '#' ? color : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
});
