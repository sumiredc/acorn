import { StyleSheet, View } from 'react-native';

import type { TimelineDay } from '@/domain/timeline';
import { useAcorn } from '@/storage/store';

import { PixelText } from './primitives';
import { PIECES, PUZZLES } from './puzzlePixels';
import { colors } from './theme';

const SIZE = 36;

// Monday to Sunday, one puzzle per day with a piece for each daily mission.
export function Timeline({ days }: { days: TimelineDay[] }) {
  const { t } = useAcorn();
  return (
    <View style={styles.row}>
      {days.map((day, i) => (
        <View key={day.date} style={[styles.day, day.isToday && styles.todayDay]}>
          <View style={[styles.labelBox, day.isToday && styles.todayLabelBox]}>
            <PixelText style={[styles.label, day.isToday && styles.todayLabel]}>
              {t(`day.${i}` as `day.${0 | 1 | 2 | 3 | 4 | 5 | 6}`)}
            </PixelText>
          </View>
          <View
            accessibilityLabel={`${day.cleared}/${day.total}`}
            style={[styles.frame, day.isToday && styles.today]}
          >
            <Puzzle cleared={day.cleared} total={day.total} />
          </View>
        </View>
      ))}
    </View>
  );
}

function Puzzle({ cleared, total }: { cleared: number; total: number }) {
  if (total === 0) return <View style={styles.empty} />;
  const rows = PUZZLES[Math.min(total, 3) as 1 | 2 | 3];
  const pixel = SIZE / rows.length;
  const filled = new Set(PIECES.slice(0, cleared));
  return (
    <View style={styles.puzzle}>
      {rows.map((row, y) => (
        <View key={y} style={styles.pixelRow}>
          {[...row].map((piece, x) => (
            <View
              key={x}
              style={{
                width: pixel,
                height: pixel,
                backgroundColor: filled.has(piece) ? colors.leaf : colors.soft,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  day: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4, borderRadius: 6 },
  todayDay: { backgroundColor: colors.acornSoft },
  labelBox: { paddingHorizontal: 6, borderRadius: 4 },
  todayLabelBox: { backgroundColor: colors.ink },
  label: { fontSize: 13, color: colors.muted },
  todayLabel: { color: colors.window },
  frame: { padding: 2, borderRadius: 4, borderWidth: 2, borderColor: 'transparent' },
  today: { borderColor: colors.acorn },
  puzzle: { width: SIZE, height: SIZE },
  pixelRow: { flexDirection: 'row' },
  empty: { width: SIZE, height: SIZE, backgroundColor: colors.soft },
});
