import { type Ref, useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import type { ViewHandle } from './measure';
import { Logo } from './Logo';
import { PixelText } from './primitives';
import { Sparks } from './Sparks';
import { colors } from './theme';

const useNativeDriver = Platform.OS !== 'web';

// Total points, counting up with a small pop whenever the value changes, and sparks when it grows.
export function PointCounter({
  value,
  spokenLabel,
  ref,
}: {
  value: number;
  // Read out for the whole counter, such as "Acorns collected: 12".
  spokenLabel: string;
  ref?: Ref<ViewHandle>;
}) {
  const [count] = useState(() => new Animated.Value(value));
  const [scale] = useState(() => new Animated.Value(1));
  const [shown, setShown] = useState(value);
  // The previous value, to tell growth apart; `burst` replays the sparks.
  const [last, setLast] = useState(value);
  const [burst, setBurst] = useState(0);
  if (value !== last) {
    setLast(value);
    if (value > last) setBurst(burst + 1);
  }

  useEffect(() => {
    const id = count.addListener(({ value: v }) => setShown(Math.round(v)));
    return () => count.removeListener(id);
  }, [count]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(count, { toValue: value, duration: 450, useNativeDriver: false }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 120, useNativeDriver }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver }),
      ]),
    ]).start();
  }, [count, scale, value]);

  return (
    <View ref={ref} accessible accessibilityLabel={spokenLabel} style={styles.box}>
      <Animated.View style={[styles.amount, { transform: [{ scale }] }]}>
        <Logo size={24} label={null} />
        <PixelText style={styles.value}>{shown}</PixelText>
      </Animated.View>
      {burst > 0 && <Sparks play={burst} style={styles.sparks} />}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center' },
  amount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  value: { fontSize: 22, color: colors.acorn },
  sparks: { right: 6, top: 2 },
});
