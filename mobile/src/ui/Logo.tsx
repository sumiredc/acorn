import { StyleSheet, View } from 'react-native';

import { LOGO_COLORS, LOGO_PIXELS } from './logoPixels';

export function Logo({ size = 28 }: { size?: number }) {
  const pixel = size / LOGO_PIXELS.length;
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Acorn"
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
