import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from './Logo';
import { PixelText } from './primitives';
import { colors, layout } from './theme';

// Phone-width column, centered on web, with the title bar.
export function Screen({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Logo size={28} />
              <PixelText style={styles.title}>{title}</PixelText>
            </View>
            {right}
          </View>
          {children}
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 22 },
});
