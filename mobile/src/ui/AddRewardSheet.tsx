import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { apiClient } from '@/api/client';
import { newId } from '@/storage/id';
import { useAcorn } from '@/storage/store';

import { ActionButton, Field } from './primitives';
import { Sheet } from './Sheet';
import { useToast } from './Toast';

// Name a reward; Acorn asks the server how many acorns it should cost, then adds it.
export function AddRewardSheet({
  visible,
  onAdded,
  onClose,
}: {
  visible: boolean;
  onAdded?: () => void;
  onClose: () => void;
}) {
  const { t } = useAcorn();
  return (
    <Sheet visible={visible} title={t('rewards.new')} onClose={onClose}>
      {visible && <RewardForm onAdded={onAdded} onClose={onClose} />}
    </Sheet>
  );
}

function RewardForm({ onAdded, onClose }: { onAdded?: () => void; onClose: () => void }) {
  const { data, dispatch, t } = useAcorn();
  const toast = useToast();
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const ready = name.trim() !== '' && !sending;

  async function add() {
    if (!ready) return;
    setSending(true);
    const result = await apiClient.judgeReward(data.budgetUsd!, name.trim());
    setSending(false);
    if (!result.ok) {
      toast(t(`error.${result.error}`));
      return;
    }
    dispatch({ type: 'addReward', id: newId(), name, ...result.data });
    onAdded?.();
    onClose();
  }

  return (
    <>
      <Field
        autoFocus
        value={name}
        editable={!sending}
        onChangeText={setName}
        onSubmitEditing={add}
        placeholder={t('rewards.placeholder')}
        accessibilityLabel={t('rewards.name')}
      />
      <View style={styles.actions}>
        <ActionButton
          label={t(sending ? 'rewards.sending' : 'rewards.add')}
          disabled={!ready}
          onPress={add}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
});
