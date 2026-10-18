import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { balance } from '@/domain/balance';
import { availableRewards, canAddReward, canRedeem } from '@/domain/rewards';
import { nextSetupStep } from '@/domain/setup';
import type { Reward } from '@/domain/types';
import { useAcorn } from '@/storage/store';
import { AcornAmount } from '@/ui/AcornAmount';
import { AddRewardSheet } from '@/ui/AddRewardSheet';
import { ConfirmModal } from '@/ui/ConfirmModal';
import { ActionButton, PixelText } from '@/ui/primitives';
import { RewardCard } from '@/ui/RewardCard';
import { Screen } from '@/ui/Screen';
import { colors } from '@/ui/theme';
import { useToast } from '@/ui/Toast';

export default function ShopScreen() {
  const { data, dispatch, t } = useAcorn();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [redeeming, setRedeeming] = useState<Reward | null>(null);

  if (nextSetupStep(data) !== null) return <Redirect href="/setup" />;

  const onHand = balance(data);
  const waiting = availableRewards(data.rewards);
  const redeemed = data.rewards.filter((r) => r.status === 'redeemed');

  function redeem() {
    const reward = redeeming;
    setRedeeming(null);
    if (!reward) return;
    // Checked again right before saving, in case a second tap slipped past the disabled button.
    if (!canRedeem(data, reward)) {
      toast(t('shop.notEnough'));
      return;
    }
    dispatch({ type: 'redeemReward', id: reward.id });
    toast(t('shop.redeemToast', { name: reward.name }), 'success');
  }

  return (
    <Screen
      logo={false}
      title={t('shop.title')}
      right={
        <View style={styles.onHand}>
          <PixelText style={styles.onHandLabel}>{t('shop.balance')}</PixelText>
          <AcornAmount
            value={onHand}
            size={24}
            style={styles.balance}
            label={t('shop.balanceSpoken', { count: onHand })}
          />
        </View>
      }
    >
      <PixelText style={styles.section}>{t('rewards.title')}</PixelText>
      {waiting.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          action={
            <ActionButton
              label={t('shop.redeem')}
              disabled={!canRedeem(data, reward)}
              onPress={() => setRedeeming(reward)}
            />
          }
        />
      ))}
      {canAddReward(data.rewards) ? (
        <Pressable accessibilityRole="button" onPress={() => setAdding(true)} style={styles.empty}>
          <PixelText style={styles.emptyLabel}>{t('rewards.empty')}</PixelText>
        </Pressable>
      ) : (
        <PixelText style={styles.note}>{t('shop.full')}</PixelText>
      )}
      {redeemed.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          action={<PixelText style={styles.redeemed}>{t('shop.redeemed')}</PixelText>}
        />
      ))}
      <AddRewardSheet visible={adding} onClose={() => setAdding(false)} />
      <ConfirmModal
        message={redeeming && t('shop.redeemConfirm', { name: redeeming.name, pt: redeeming.pt })}
        confirmLabel={t('shop.redeem')}
        onConfirm={redeem}
        onCancel={() => setRedeeming(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  onHand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onHandLabel: { fontSize: 12, color: colors.muted },
  balance: { fontSize: 22, color: colors.acorn },
  section: { fontSize: 15, color: colors.muted },
  empty: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.muted,
    borderRadius: 6,
  },
  emptyLabel: { color: colors.muted, fontSize: 14 },
  note: { fontSize: 13, color: colors.muted },
  redeemed: { fontSize: 14, color: colors.muted },
});
