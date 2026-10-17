import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAcorn } from '@/storage/store';

import { ActionButton, PixelText } from './primitives';
import { colors, layout } from './theme';

// Phone-width column, centered on web, with the title bar and language switch.
export function Screen({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const { locale, dispatch, t } = useAcorn();
  const switchTo = locale === 'ja' ? 'en' : 'ja';
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <View style={styles.header}>
            <PixelText style={styles.title}>🌰 {title}</PixelText>
            {right}
          </View>
          {children}
          <View style={styles.footer}>
            <ActionButton
              tone="plain"
              label={t('locale.switch')}
              onPress={() => dispatch({ type: 'setLocale', locale: switchTo })}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, alignItems: 'center', padding: 16 },
  column: { width: '100%', maxWidth: layout.maxWidth, gap: layout.gap },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22 },
  footer: { alignItems: 'flex-end', marginTop: 8 },
});
