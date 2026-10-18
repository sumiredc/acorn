import { StyleSheet, View } from 'react-native';

import { useAcorn } from '@/storage/store';

import { ActionButton } from './primitives';
import { Sheet } from './Sheet';

// Asks before an action that can't easily be taken back, such as removing a mission.
export function ConfirmModal({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  // null hides the modal.
  message: string | null;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useAcorn();
  return (
    <Sheet visible={message !== null} title={message ?? undefined} onClose={onCancel}>
      <View style={styles.actions}>
        <ActionButton tone="plain" label={t('common.cancel')} onPress={onCancel} />
        <ActionButton label={confirmLabel} onPress={onConfirm} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
});
