import { StyleSheet, View } from 'react-native';

import { useAcorn } from '@/storage/store';

import { ActionButton, PixelText } from './primitives';
import { colors } from './theme';

// Moves app time forward so a demo can show several days, or a new week, in a few minutes.
export function DemoClock() {
  const { dispatch, t } = useAcorn();
  return (
    <View style={styles.bar}>
      <PixelText style={styles.label}>{t('demo.label')}</PixelText>
      <ActionButton
        tone="plain"
        label={t('demo.advanceDay')}
        onPress={() => dispatch({ type: 'advanceDay' })}
      />
      <ActionButton
        tone="plain"
        label={t('demo.advanceWeek')}
        onPress={() => dispatch({ type: 'advanceWeek' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 2,
    borderTopColor: colors.soft,
    borderStyle: 'dashed',
    paddingTop: 10,
  },
  label: { fontSize: 13, color: colors.muted },
});
