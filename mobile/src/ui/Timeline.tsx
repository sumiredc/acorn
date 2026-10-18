import { StyleSheet, View } from 'react-native';

import type { TimelineDay } from '@/domain/timeline';
import { useAcorn } from '@/storage/store';

import { PixelText } from './primitives';
import { colors } from './theme';

// Monday to Sunday: one square per daily mission, filled when cleared, and a star for the weekly.
export function Timeline({ days }: { days: TimelineDay[] }) {
  const { t } = useAcorn();
  return (
    <View style={styles.row}>
      {days.map((day, i) => (
        <View key={day.date} style={[styles.day, day.isToday && styles.today]}>
          <PixelText style={[styles.label, day.isToday && styles.todayLabel]}>
            {t(`day.${i}` as `day.${0 | 1 | 2 | 3 | 4 | 5 | 6}`)}
          </PixelText>
          <View style={styles.marks}>
            {day.daily.map((cleared, j) => (
              <View key={j} style={[styles.square, cleared && styles.squareCleared]} />
            ))}
          </View>
          <PixelText style={[styles.star, day.weeklyCleared && styles.starCleared]}>★</PixelText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  today: { borderColor: colors.ink, backgroundColor: colors.acornSoft },
  label: { fontSize: 13, color: colors.muted },
  todayLabel: { color: colors.ink },
  marks: { gap: 3, minHeight: 36 },
  square: {
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.window,
  },
  squareCleared: { backgroundColor: colors.leaf },
  star: { fontSize: 12, color: colors.muted, opacity: 0.3 },
  starCleared: { color: colors.acorn, opacity: 1 },
});
