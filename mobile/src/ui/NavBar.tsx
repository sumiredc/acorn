import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAcorn } from '@/storage/store';

import { type IconName, PixelIcon } from './PixelIcon';
import { PixelText } from './primitives';
import { colors, layout } from './theme';

const TABS: { href: '/' | '/shop'; icon: IconName; label: 'nav.home' | 'nav.shop' }[] = [
  { href: '/', icon: 'home', label: 'nav.home' },
  { href: '/shop', icon: 'shop', label: 'nav.shop' },
];

// Switches between home and the shop, replacing the screen so switching back and forth
// doesn't pile up screens. Hidden while getting the week ready.
export function NavBar() {
  const { t } = useAcorn();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  if (pathname === '/setup') return null;

  return (
    <View style={[styles.bar, { paddingBottom: 8 + insets.bottom }]}>
      <View accessibilityRole="tablist" style={styles.tabs}>
        {TABS.map((tab) => {
          const selected = pathname === tab.href;
          return (
            <Pressable
              key={tab.href}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => router.replace(tab.href)}
              style={styles.tab}
            >
              <PixelIcon name={tab.icon} size={18} color={selected ? colors.acorn : colors.muted} />
              <PixelText style={[styles.label, selected && styles.selected]}>
                {t(tab.label)}
              </PixelText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.window,
    borderTopWidth: layout.border,
    borderTopColor: colors.ink,
    paddingTop: 8,
    alignItems: 'center',
  },
  tabs: { flexDirection: 'row', width: '100%', maxWidth: layout.maxWidth },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontSize: 12, color: colors.muted },
  selected: { color: colors.acorn },
});
