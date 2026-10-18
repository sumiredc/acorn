import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from './theme';

const useNativeDriver = Platform.OS !== 'web';
const SPARKS = 10;
export const SPARK_COLORS = [colors.acorn, colors.leaf, colors.sky, '#e0b13a'];

// Pixel sparks that burst outward from the middle of `style`'s box and fade.
// Position the box with `style` (it is absolutely positioned); changing `play` replays it.
export function Sparks({
  play,
  delay = 0,
  style,
}: {
  play: number;
  delay?: number;
  style?: ViewStyle;
}) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    progress.setValue(0);
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(progress, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
    ]).start();
  }, [play, delay, progress]);

  // Hidden until it starts, then fades only near the end (eased progress gets there early).
  const fade = progress.interpolate({
    inputRange: [0, 0.01, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });
  return (
    <View pointerEvents="none" style={[styles.box, style]}>
      {Array.from({ length: SPARKS }, (_, i) => {
        const angle = (i / SPARKS) * 2 * Math.PI;
        const distance = 30 + (i % 3) * 10;
        return (
          <Animated.View
            key={i}
            style={[
              styles.spark,
              {
                backgroundColor: SPARK_COLORS[i % SPARK_COLORS.length],
                opacity: fade,
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.cos(angle) * distance],
                    }),
                  },
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.sin(angle) * distance],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    width: 40,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: { position: 'absolute', width: 6, height: 6 },
});
