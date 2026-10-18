import { type ReactNode, useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

import { Sparks } from './Sparks';
import { colors } from './theme';

const useNativeDriver = Platform.OS !== 'web';

// A short celebration for the card that was just cleared: it bounces once with a soft green
// flash and pixel sparks fly out from the points.
export function ClearPop({
  play,
  delay = 0,
  children,
}: {
  // Changing it replays the celebration; null shows the card as is.
  play: number | null;
  // Milliseconds to wait first, such as for a closing window to fade out.
  delay?: number;
  children: ReactNode;
}) {
  // Animated values live for the component's lifetime; useState keeps one instance per mount.
  const [scale] = useState(() => new Animated.Value(1));
  const [flash] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (play === null) return;
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 0.96, duration: 0, useNativeDriver }),
          Animated.spring(scale, { toValue: 1, friction: 3, tension: 140, useNativeDriver }),
        ]),
        Animated.sequence([
          Animated.timing(flash, { toValue: 0.5, duration: 0, useNativeDriver }),
          Animated.timing(flash, { toValue: 0, duration: 700, useNativeDriver }),
        ]),
      ]),
    ]).start();
  }, [play, delay, scale, flash]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash }]} />
      {play !== null && <Sparks play={play} delay={delay} style={styles.sparks} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.leafSoft,
    borderRadius: 8,
  },
  sparks: { right: 17, top: 13 },
});
