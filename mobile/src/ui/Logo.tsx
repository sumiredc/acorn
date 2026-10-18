import { StyleSheet, View } from 'react-native';

import { LOGO_COLORS, LOGO_PIXELS } from './logoPixels';

// `label` null hides it from screen readers, for when it sits next to text that says it all.
export function Logo({ size = 28, label = 'Acorn' }: { size?: number; label?: string | null }) {
  const pixel = size / LOGO_PIXELS.length;
  return (
    <View
      accessible={label !== null}
      accessibilityRole={label !== null ? 'image' : undefined}
      accessibilityLabel={label ?? undefined}
      style={{ width: size, height: size }}
    >
      {LOGO_PIXELS.map((row, y) => (
        <View key={y} style={styles.row}>
          {[...row].map((cell, x) => (
            <View
              key={x}
              style={{
                width: pixel,
                height: pixel,
                backgroundColor: LOGO_COLORS[cell] ?? 'transparent',
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
