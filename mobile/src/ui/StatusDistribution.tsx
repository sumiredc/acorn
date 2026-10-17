import { StyleSheet, View } from 'react-native';

import type { Judgement } from '@/domain/types';
import { isMessageKey } from '@/i18n';
import { useAcorn } from '@/storage/store';

import { topCandidates } from './distribution';
import { PixelText } from './primitives';
import { colors } from './theme';

export function StatusDistribution({ judgement }: { judgement: Judgement }) {
  const { t } = useAcorn();
  return (
    <View style={styles.box}>
      {topCandidates(judgement).map((row) => (
        <View key={row.key} style={styles.row}>
          <View style={styles.labels}>
            <PixelText style={[styles.label, row.chosen && styles.chosen]}>
              {row.chosen ? '▶ ' : '  '}
              {isMessageKey(row.key) ? t(row.key) : row.key}
            </PixelText>
            <PixelText style={[styles.label, row.chosen && styles.chosen]}>
              {row.percent}%
            </PixelText>
          </View>
          <View style={styles.track}>
            <View
              style={[styles.bar, { width: `${row.percent}%` }, row.chosen && styles.barChosen]}
            />
          </View>
        </View>
      ))}
      <PixelText style={styles.confidence}>
        {t('status.confidence', { value: Math.round(judgement.confidence * 100) })}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 6 },
  row: { gap: 3 },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13, color: colors.muted },
  chosen: { color: colors.ink },
  track: { height: 6, backgroundColor: colors.soft, borderRadius: 3, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: colors.skySoft },
  barChosen: { backgroundColor: colors.sky },
  confidence: { fontSize: 11, color: colors.muted, alignSelf: 'flex-end' },
});
