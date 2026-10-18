import { StyleSheet, View } from 'react-native';

import type { TimelineDay } from '@/domain/timeline';
import { useAcorn } from '@/storage/store';

import { PixelText } from './primitives';
import { colors, grass } from './theme';

// Monday to Sunday, one cell per day that gets greener as more daily missions are cleared.
export function Timeline({ days }: { days: TimelineDay[] }) {
  const { t } = useAcorn();
  return (
    <View style={styles.row}>
      {days.map((day, i) => (
        <View key={day.date} style={styles.day}>
          <PixelText style={[styles.label, day.isToday && styles.todayLabel]}>
            {t(`day.${i}` as `day.${0 | 1 | 2 | 3 | 4 | 5 | 6}`)}
          </PixelText>
          <View
            accessibilityLabel={`${day.cleared}/${day.total}`}
            style={[
              styles.cell,
              { backgroundColor: grass[day.level] },
              day.isToday && styles.today,
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  day: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontSize: 13, color: colors.muted },
  todayLabel: { color: colors.ink },
  cell: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 40,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  today: { borderColor: colors.ink },
});
