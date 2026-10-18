import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useAcorn } from '@/storage/store';

import { IconButton } from './IconButton';
import { PixelText, Window } from './primitives';
import { layout } from './theme';

// A window over the page. Tapping outside it or the × in the corner closes it.
export function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useAcorn();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        {visible && (
          <View style={styles.sheet}>
            <Window>
              <View style={styles.header}>
                <PixelText style={styles.title}>{title}</PixelText>
                <IconButton icon="close" label={t('common.close')} onPress={onClose} />
              </View>
              {children}
            </Window>
          </View>
        )}
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 17 },
});
