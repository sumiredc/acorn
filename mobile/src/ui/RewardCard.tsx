import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Reward } from '@/domain/types';
import { useAcorn } from '@/storage/store';

import { AcornAmount } from './AcornAmount';
import { PixelText, Window } from './primitives';

// A reward with its price in acorns.
export function RewardCard({ reward, action }: { reward: Reward; action?: ReactNode }) {
  const { t } = useAcorn();
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
        {action}
      </View>
    </Window>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { flex: 1, fontSize: 16 },
  pt: { fontSize: 18 },
  redeemed: { opacity: 0.55 },
});
