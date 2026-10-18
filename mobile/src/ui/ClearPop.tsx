import { type ReactNode, useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { colors, fonts } from './theme';

const useNativeDriver = Platform.OS !== 'web';
const SPARKS = 10;
const SPARK_COLORS = [colors.acorn, colors.leaf, colors.sky, '#e0b13a'];

// A short celebration for the card that was just cleared: it bounces once with a soft green
// flash, pixel sparks fly out from the points, and "+Npt" floats up.
export function ClearPop({
  play,
  delay = 0,
  pt,
  children,
}: {
  // Changing it replays the celebration; null shows the card as is.
  play: number | null;
  // Milliseconds to wait first, such as for a closing window to fade out.
  delay?: number;
  pt: number | null;
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
      {play !== null && pt !== null && <Burst play={play} delay={delay} pt={pt} />}
    </Animated.View>
  );
}

function Burst({ play, delay, pt }: { play: number; delay: number; pt: number }) {
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
    <View pointerEvents="none" style={styles.burst}>
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
      <Animated.Text
        style={[
          styles.gain,
          {
            opacity: fade,
            transform: [
              { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) },
            ],
          },
        ]}
      >
        +{pt}pt
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.leafSoft,
    borderRadius: 8,
  },
  burst: {
    position: 'absolute',
    right: 17,
    top: 13,
    width: 40,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: { position: 'absolute', width: 6, height: 6 },
  gain: {
    position: 'absolute',
    fontFamily: fonts.pixel,
    fontSize: 16,
    color: colors.leaf,
    width: 80,
    textAlign: 'center',
  },
});
