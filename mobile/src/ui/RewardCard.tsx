import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Reward } from '@/domain/types';
import { isMessageKey } from '@/i18n';
import { useAcorn } from '@/storage/store';

import { AcornAmount } from './AcornAmount';
import { PixelText, Window } from './primitives';
import { colors } from './theme';

// A reward with its price in acorns and the price band or period it was judged in.
export function RewardCard({ reward, action }: { reward: Reward; action?: ReactNode }) {
  const { t } = useAcorn();
  const choice = reward.judgement.choice;
  const redeemed = reward.status === 'redeemed';
  return (
    <Window style={redeemed ? styles.redeemed : undefined}>
      <View style={styles.header}>
        <PixelText style={styles.name}>{reward.name}</PixelText>
        <AcornAmount
          value={reward.pt}
          style={styles.pt}
          label={t('acorns.count', { count: reward.pt })}
        />
      </View>
      <View style={styles.footer}>
        <PixelText style={styles.band}>{isMessageKey(choice) ? t(choice) : choice}</PixelText>
        {action}
      </View>
    </Window>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 16 },
  pt: { fontSize: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  band: { fontSize: 12, color: colors.sky },
  redeemed: { opacity: 0.55 },
});
