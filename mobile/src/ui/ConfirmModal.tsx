import { Modal, StyleSheet, View } from 'react-native';

import { useAcorn } from '@/storage/store';

import { ActionButton, PixelText, Window } from './primitives';
import { layout } from './theme';

// Asks before an action that can't be taken back, such as removing a mission.
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
    <Modal visible={message !== null} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Window>
            <PixelText>{message}</PixelText>
            <View style={styles.actions}>
              <ActionButton tone="plain" label={t('common.cancel')} onPress={onCancel} />
              <ActionButton label={confirmLabel} onPress={onConfirm} />
            </View>
          </Window>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 38, 32, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: { width: '100%', maxWidth: layout.maxWidth },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
});
