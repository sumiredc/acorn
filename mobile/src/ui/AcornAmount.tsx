import { StyleSheet, type TextStyle, View } from 'react-native';

import { Logo } from './Logo';
import { PixelText } from './primitives';

// Acorns are the currency: the pixel acorn followed by the number, such as for a mission's reward.
export function AcornAmount({
  value,
  size = 18,
  style,
  label,
}: {
  // A number, or text like "+3".
  value: number | string;
  size?: number;
  style?: TextStyle;
  // Read out instead of the icon and number, such as "3 acorns".
  label: string;
}) {
  return (
    <View accessible accessibilityLabel={label} style={styles.row}>
      <Logo size={size} label={null} />
      <PixelText style={style}>{typeof value === 'number' ? formatCount(value) : value}</PixelText>
    </View>
  );
}

// 30000 → "30,000", so big prices stay readable.
export function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
