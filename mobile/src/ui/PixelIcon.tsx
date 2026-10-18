import { StyleSheet, View } from 'react-native';

import { colors } from './theme';

// Small one-color pixel icons, 7×7. '#' is drawn, '.' is transparent.
export const ICONS = {
  daily: ['...#...', '.#...#.', '..###..', '#.###.#', '..###..', '.#...#.', '...#...'],
  weekly: ['#######', '#######', '#.....#', '#.#.#.#', '#.....#', '#.#.#.#', '#######'],
  buttons: ['...#...', '...#...', '.#####.', '...#...', '...#...', '.......', '.#####.'],
  bar: ['.......', '.......', '#######', '####..#', '#######', '.......', '.......'],
  number: ['.......', '.#.#.#.', '.......', '.#.#.#.', '.......', '.#.#.#.', '.......'],
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
  size?: number;
  color?: string;
  label?: string;
}) {
  const rows = ICONS[name];
  const pixel = size / rows.length;
  return (
    <View
      accessible={label !== undefined}
      accessibilityRole={label !== undefined ? 'image' : undefined}
      accessibilityLabel={label}
      style={{ width: size, height: size }}
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
